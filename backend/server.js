
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
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

// Proposal response limiter
const responseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeader: false,
  message: {
    message: "Too many attempts. Please try again later.",
  },
});

// Personal message limiter
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeader: false,
  message: {
    message: "Too many messages. Please try again later.",
  },
});

// ======================================
// EMAIL CONFIGURATION
// ======================================

const {
  EMAIL_USER,
  EMAIL_APP_PASSWORD,
  NOTIFY_EMAIL,
} = process.env;

let transporter = null;

if (EMAIL_USER && EMAIL_APP_PASSWORD && NOTIFY_EMAIL) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  });
} else {
  console.error("Email environment variables are missing.");
}

const sendNotificationEmail = async (mailOptions) => {
  if (!transporter) {
    throw new Error("Email notifications are not configured.");
  }

  return transporter.sendMail({
    from: `"Our Love Story" <${EMAIL_USER}>`,
    to: NOTIFY_EMAIL,
    ...mailOptions,
  });
};

// Escape HTML to safely display user-written messages
const escapeHtml = (text) => {
  return text.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
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

app.post(
  "/api/proposal-response",
  responseLimiter,
  async (req, res) => {
    try {
      const { response } = req.body ?? {};

      // Accepted response values
      const allowedResponses = {
        yes: "Yes, I'd love to ❤️",
        think: "Let me think 😊",
        "Yes, I'd love to ❤️": "Yes, I'd love to ❤️",
        "Let me think 😊": "Let me think 😊",
      };

      if (
        typeof response !== "string" ||
        !Object.prototype.hasOwnProperty.call(
          allowedResponses,
          response
        )
      ) {
        return res.status(400).json({
          message: "Invalid response.",
        });
      }

      const selectedResponse = allowedResponses[response];

      await sendNotificationEmail({
        subject: "Proposal website response received",
        text: `
A response was selected on your proposal website:

${selectedResponse}

This is an automated notification.
        `,
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: auto;
            padding: 28px;
            color: #332329;
            background: #fffaf5;
            border-radius: 16px;
          ">
            <h2 style="color: #7b2438;">
              You received a response 💌
            </h2>

            <p>
              Someone selected a response on your proposal website:
            </p>

            <div style="
              padding: 18px;
              background: #f7e9e7;
              border-radius: 12px;
              font-size: 20px;
              font-weight: bold;
            ">
              ${escapeHtml(selectedResponse)}
            </div>

            <p style="
              color: #76666a;
              font-size: 13px;
              margin-top: 24px;
            ">
              Sent automatically by your Our Love Story website.
            </p>
          </div>
        `,
      });

      console.log(
        "Proposal response email sent:",
        selectedResponse
      );

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
  }
);

// ======================================
// PERSONAL MESSAGE ENDPOINT
// ======================================

app.post(
  "/api/proposal-message",
  messageLimiter,
  async (req, res) => {
    try {
      const { message } = req.body ?? {};

      // Validate personal message
      if (
        typeof message !== "string" ||
        !message.trim() ||
        message.length > 1000
      ) {
        return res.status(400).json({
          message: "Please enter a message of up to 1000 characters.",
        });
      }

      // Preserve the original message exactly
      const safeMessage = escapeHtml(message);

      await sendNotificationEmail({
        subject: "A personal message from your proposal website 💌",

        // Plain-text email preserves the submitted text
        text: `You received a personal message:

${message}

Sent from your Our Love Story website.`,

        // HTML email safely displays the same content
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: auto;
            padding: 28px;
            color: #332329;
            background: #fffaf5;
            border-radius: 16px;
          ">
            <h2 style="color: #7b2438;">
              You received a little message 💌
            </h2>

            <p>
              Someone left you a personal message:
            </p>

            <div style="
              padding: 20px;
              background: #f7e9e7;
              border-radius: 12px;
              font-size: 16px;
              line-height: 1.8;
              white-space: pre-wrap;
              overflow-wrap: anywhere;
            ">${safeMessage}</div>

            <p style="
              color: #76666a;
              font-size: 12px;
              margin-top: 24px;
            ">
              Sent from your Our Love Story website.
            </p>
          </div>
        `,
      });

      console.log("Personal message email sent successfully.");

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
  }
);

// ======================================
// START SERVER
// ======================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});