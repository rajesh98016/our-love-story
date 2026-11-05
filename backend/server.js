import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Render runs behind a proxy; needed for correct client IPs in rate limiting
app.set("trust proxy", 1);

app.use(helmet());

// ======================================
// CORS
// ======================================

const normalizeOrigin = (url) => (url ? url.replace(/\/+$/, "") : url);

const allowedOrigins = [
  "http://localhost:5173",
  normalizeOrigin(process.env.FRONTEND_URL),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "10kb" }));

// ======================================
// RATE LIMITERS
// ======================================

const responseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many messages. Please try again later." },
});

// ======================================
// HELPERS
// ======================================

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// ======================================
// RESEND EMAIL CONFIGURATION
// ======================================

const { RESEND_API_KEY, NOTIFY_EMAIL } = process.env;

if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
  console.error(
    "Missing RESEND_API_KEY or NOTIFY_EMAIL environment variable."
  );
}

const sendNotificationEmail = async ({ subject, text, html }) => {
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    throw new Error("Resend email notifications are not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Our Love Story <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(20000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Resend API error:", data);
    throw new Error(data.message || "Failed to send notification email.");
  }

  console.log("Email sent successfully through Resend:", data.id);
  return data;
};

// ======================================
// HEALTH CHECK
// ======================================

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Proposal notification server is running.",
  });
});

// ======================================
// PROPOSAL RESPONSE ENDPOINT
// ======================================

const allowedResponses = {
  yes: "Yes, I'd love to ❤️",
  think: "Let me think 😊",
};

app.post("/api/proposal-response", responseLimiter, async (req, res) => {
  try {
    const { response } = req.body ?? {};

    if (
      typeof response !== "string" ||
      !Object.prototype.hasOwnProperty.call(allowedResponses, response)
    ) {
      return res.status(400).json({ message: "Invalid response." });
    }

    const selectedResponse = allowedResponses[response];

    await sendNotificationEmail({
      subject: "Proposal website response received",
      text: `A response was selected on your proposal website:

${selectedResponse}

This is an automated notification.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #332329; background: #fffaf5; border-radius: 16px;">
          <h2 style="color: #7b2438;">You received a response 💌</h2>
          <p>Someone selected a response on your proposal website:</p>
          <div style="padding: 18px; background: #f7e9e7; border-radius: 12px; font-size: 20px; font-weight: bold;">
            ${escapeHtml(selectedResponse)}
          </div>
          <p style="color: #76666a; font-size: 13px; margin-top: 24px;">
            Sent automatically by your Our Love Story website.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Your response was sent successfully.",
    });
  } catch (error) {
    console.error("Proposal email failed:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send the notification. Please try again.",
    });
  }
});

// ======================================
// PERSONAL MESSAGE ENDPOINT
// ======================================

app.post("/api/proposal-message", messageLimiter, async (req, res) => {
  try {
    const { message } = req.body ?? {};

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 1000
    ) {
      return res.status(400).json({
        message: "Please enter a message of up to 1000 characters.",
      });
    }

    const safeMessage = escapeHtml(message);

    await sendNotificationEmail({
      subject: "A personal message from your proposal website 💌",
      text: `You received a personal message:

${message}

Sent from your Our Love Story website.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 28px; color: #332329; background: #fffaf5; border-radius: 16px;">
          <h2 style="color: #7b2438;">You received a little message 💌</h2>
          <p>Someone left you a personal message:</p>
          <div style="padding: 20px; background: #f7e9e7; border-radius: 12px; font-size: 16px; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere;">${safeMessage}</div>
          <p style="color: #76666a; font-size: 12px; margin-top: 24px;">
            Sent from your Our Love Story website.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Your personal message was sent successfully.",
    });
  } catch (error) {
    console.error("Personal message email failed:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send your message. Please try again.",
    });
  }
});

// ======================================
// ERROR HANDLER (CORS and body parse errors return JSON, not HTML)
// ======================================

app.use((err, _req, res, _next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed." });
  }
  console.error("Unhandled error:", err);
  return res.status(400).json({ message: "Bad request." });
});

// ======================================
// START SERVER
// ======================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});