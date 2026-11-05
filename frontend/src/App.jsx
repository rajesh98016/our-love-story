
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Music2,
  VolumeX,
  Sparkles,
  Mail,
  ArrowDown,
} from "lucide-react";

function App() {
  const [started, setStarted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("");
  const [pendingChoice, setPendingChoice] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState("");
  const audioRef = useRef(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleStart = () => {
    setStarted(true);

    setTimeout(() => {
      scrollTo("home");
    }, 100);
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (musicOn) {
      audioRef.current.pause();
      setMusicOn(false);
    } else {
      try {
        await audioRef.current.play();
        setMusicOn(true);
      } catch (error) {
        console.error("Music playback failed:", error);
      }
    }
  };

 
const sendEmailNotification = async (selectedResponse) => {
  if (sending) return;

  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5001"
  ).replace(/\/+$/, "");

  setSending(true);
  setPendingChoice(selectedResponse);
  setNotificationStatus("");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    let response;

    try {
      response = await fetch(`${API_URL}/api/proposal-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response: selectedResponse,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Notification failed.");
    }

    setAnswer(selectedResponse);
    setNotificationStatus("Your response has been received ❤️");

  } catch (error) {
    console.error("Email notification error:", error);

    setNotificationStatus(
      error.name === "AbortError"
        ? "The request timed out. Please try again."
        : "Something went wrong. Please try again."
    );
  } finally {
    setSending(false);
    setPendingChoice("");
  }
};


  const sendPersonalMessage = async () => {
    if (sendingMessage) return;

    if (!personalMessage.trim()) {
      setMessageStatus("Please write a little message first. ❤️");
      return;
    }

    const API_URL = (
      import.meta.env.VITE_API_URL || "http://localhost:5001"
    ).replace(/\/+$/, "");
    setSendingMessage(true);
    setMessageStatus("");

    try {
      const response = await fetch(
        `${API_URL}/api/proposal-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: personalMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not send your message.");
      }

      setMessageStatus("Your message has been sent to me. ❤️");
      setPersonalMessage("");
    } catch (error) {
      console.error("Personal message error:", error);
      setMessageStatus(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <main>
      {/* BACKGROUND MUSIC */}
      <audio
        ref={audioRef}
        src="/music/romantic-song.mp3"
        loop
      />

      {/* MUSIC CONTROL */}
      <button
        className="music-control"
        onClick={toggleMusic}
        aria-label={musicOn ? "Turn music off" : "Turn music on"}
      >
        {musicOn ? <VolumeX size={19} /> : <Music2 size={19} />}
      </button>

      {/* WELCOME SCREEN */}
      {!started && (
        <motion.div
          className="welcome-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="welcome-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Sparkles className="welcome-sparkle" size={30} />

            <p className="eyebrow">
              A LITTLE SOMETHING FROM MY HEART
            </p>

            <h1>
              For
              <br />
              <em>Arpita Jii</em>
            </h1>

            <p className="welcome-description">
              Some people enter our lives unexpectedly. And
              somehow, without even trying, they make ordinary
              moments feel extraordinary.
            </p>

            <p className="welcome-description">
              This little website holds a few memories, a few
              feelings, and something I've wanted to tell you.
            </p>

            <button
              className="primary-button"
              onClick={handleStart}
            >
              Open your little surprise
              <Heart size={17} fill="currentColor" />
            </button>

            <p className="welcome-footer">
              Made with a little love ♡
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* MAIN WEBSITE */}
      {started && (
        <>
          {/* HERO */}
          <section className="hero-section" id="home">
            <motion.div
              className="hero-content"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <span className="eyebrow">
                A LITTLE SOMETHING FROM MY HEART
              </span>

              <h1>
                For
                <br />
                <em>Arpita Jii</em>
              </h1>

              <p className="hero-description">
                Some stories begin with a simple hello. Ours
                became a collection of moments I never want
                to forget.
              </p>

              <button
                className="scroll-button"
                onClick={() => scrollTo("chapter-one")}
              >
                Read our little story
                <ArrowDown size={17} />
              </button>
            </motion.div>

            <div className="scroll-indicator">
              SCROLL TO READ ↓
            </div>

            <span className="floating-heart heart-one">♡</span>
            <span className="floating-heart heart-two">♡</span>
          </section>

          {/* CHAPTER ONE */}
          <section
            className="section story-section"
            id="chapter-one"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <span className="eyebrow">CHAPTER ONE</span>

              <h2>
                How it <em>started</em>
              </h2>

              <div className="story-content">
                <p>
                  It started in the most ordinary way. I used
                  to pass by your PG whenever I went to the
                  market. One day, while I was returning, you
                  were walking with your friend. Your friend
                  asked for my Instagram ID, I shared it, and
                  that little moment became the beginning of
                  our conversations.
                </p>

                <p>
                  Then came the day I saw you in person for
                  the first time. You were coming downstairs
                  to receive a Zepto order. I was around fifty
                  metres away. You noticed me, got shy, and
                  quickly went back inside. Even today,
                  whenever I think about that moment, it
                  brings a smile to my face.
                </p>

                <p>
                  Two days later, we met in my colony and went
                  for a walk together. Our first walk was
                  around <strong>8 kilometres</strong>. Since
                  then, there have been so many more walks,
                  conversations, and little memories that
                  mean a lot to me.
                </p>
              </div>

              <div className="story-moments">
                <span>Instagram hello</span>
                <span>First glimpse</span>
                <span>Our 8 km walk</span>
                <span>More memories</span>
              </div>
            </motion.div>
          </section>

          {/* CHAPTER TWO */}
          <section className="section memories-section">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
            >
              <span className="eyebrow">CHAPTER TWO</span>

              <h2>
                Things That <em>Remind Me of You</em>
              </h2>

              <p className="section-lead">
                Some things don't need photographs to be
                remembered.
              </p>

              <div className="memory-grid">
                {[
                  {
                    icon: "😊",
                    title: "Your Smile",
                    note: "The kind that stays in my mind.",
                  },
                  {
                    icon: "🙈",
                    title: "Your Shyness",
                    note: "Especially that first meeting.",
                  },
                  {
                    icon: "🌸",
                    title: "Your Little Habits",
                    note: "The little things you do without even realising how adorable they are.",
                  },
                  {
                    icon: "🫶",
                    title: "Your Presence",
                    note: "Somehow, even an ordinary day feels a little more beautiful when you're around.",
                  },
                  {
                    icon: "✨",
                    title: "Your Uniqueness",
                    note: "There's something about you that I can't quite put into words.",
                  },
                  {
                    icon: "💗",
                    title: "Just Being You",
                    note: "You don't have to do anything special to make someone smile.",
                  },
                ].map((item, index) => (
                  <motion.article
                    className="memory-card note-card"
                    key={item.title}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="note-icon">
                      {item.icon}
                    </div>

                    <div className="memory-caption">
                      <h3>{item.title}</h3>
                      <p>{item.note}</p>
                    </div>
                  </motion.article>
                ))}
              </div>

              <p className="memory-ending">
                "Some of my favourite memories are the ones I
                carry in my heart." ♡
              </p>
            </motion.div>
          </section>

          {/* CHAPTER THREE — CONFESSION */}
          <section
            className="section confession-section"
            id="confession"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <span className="eyebrow">
                CHAPTER THREE · A LITTLE CONFESSION
              </span>

              <h2>
                There's something I've been
                <br />
                <em>meaning to say...</em>
              </h2>

              <div className="confession-content">
                <p className="confession-intro">
                  I don't know exactly when it happened...
                  <br />
                  But somewhere along the way,
                  <br />
                  I fell for you.
                </p>

                <Heart
                  className="declaration-heart"
                  fill="currentColor"
                />

                <p className="confession-message">
                  Your smile, your little habits, and the way
                  you make even ordinary moments feel special...
                  somewhere along the way, you became someone
                  I hold very close to my heart.
                </p>

                <p className="three-words">
                  Three little words...
                </p>

                <h2 className="love-confession">
                  I Love You,
                  <br />
                  <span>Arpita.</span>
                </h2>

                <p className="confession-ending">
                  I don't expect you to say it back. I just
                  wanted you to know what's in my heart. ♡
                </p>
              </div>
            </motion.div>
          </section>

          {/* PERSONAL LETTER */}
          <section className="section letter-section">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <span className="eyebrow">A NOTE FOR YOU</span>

              <div className="letter">
                <div className="letter-top">
                  <Mail size={20} />
                  <span>A letter, just for you</span>
                </div>

                <h2>Dear Arpita Jii,</h2>

                <p>
                  I may not always find the perfect words to
                  express what's on my mind, but I hope this
                  little note says what sometimes remains
                  unspoken.
                </p>

                <p>
                  I want you to know that I genuinely value
                  the connection we share. I don't know what
                  the future holds, and I don't want to rush
                  anything. I'd simply love to keep getting
                  to know you, laughing together, and creating
                  more memories along the way.
                </p>

                <p>
                  There's no pressure and no expectation.
                  Whatever you feel, I'll respect it. I just
                  wanted to be honest with you and give you a
                  little glimpse of what's in my heart.
                </p>

                <p className="signature">
                  With a smile,
                  <br />
                  <strong>It's me</strong> <span>♡</span>
                </p>
              </div>
            </motion.div>
          </section>

          {/* FINAL PROPOSAL */}

          {/* FINAL PROPOSAL */}
          <section className="section proposal-section">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <Heart
                className="proposal-heart"
                fill="currentColor"
              />

              <span className="eyebrow">
                ONE LITTLE QUESTION
              </span>

              <h2>
                Would you like to
                <br />
                <em>make more memories</em>
                <br />
                with me?
              </h2>

              <p className="proposal-description">
                I don't know what tomorrow holds, but I'd love
                to find out, one little moment at a time.
              </p>

              {/* PROPOSAL RESPONSE BUTTONS */}
              {!answer ? (
                <div className="proposal-buttons">
                  <button
                    className={`yes-button ${pendingChoice === "yes" ? "button-loading" : ""
                      }`}
                    onClick={() => sendEmailNotification("yes")}
                    disabled={sending}
                  >
                    {pendingChoice === "yes"
                      ? "Sending... ♡"
                      : "Yes, I'd love to ❤️"}
                  </button>

                  <button
                    className={`think-button ${pendingChoice === "think" ? "button-loading" : ""
                      }`}
                    onClick={() => sendEmailNotification("think")}
                    disabled={sending}
                  >
                    {pendingChoice === "think"
                      ? "Sending... ♡"
                      : "Let me think 😊"}
                  </button>
                </div>
              ) : (
                /* RESPONSE SUCCESS MESSAGE */
                <motion.div
                  className="answer-message"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {answer === "yes" ? (
                    <>
                      <h2>You've made me smile! ❤️</h2>
                      <p>
                        Here's to more beautiful memories together.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>Take your time. ♡</h2>
                      <p>
                        There's no rush. Your feelings and your answer
                        matter to me.
                      </p>
                    </>
                  )}
                </motion.div>
              )}

              {/* PROPOSAL EMAIL STATUS */}
              {notificationStatus && (
                <p className="notification-status">
                  {notificationStatus}
                </p>
              )}

              {/* PERSONAL MESSAGE BOX */}
              <motion.div
                className="personal-message-box"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <h3>Or leave me a little message 💌</h3>

                <p>
                  Whatever is on your mind, I'd love to hear it.
                </p>

                <textarea
                  value={personalMessage}
                  onChange={(e) => {
                    setPersonalMessage(e.target.value);
                    setMessageStatus("");
                  }}
                  placeholder="Write something you'd like me to know..."
                  maxLength={1000}
                  rows={5}
                  disabled={sendingMessage}
                />

                <div className="message-box-footer">
                  <span>{personalMessage.length}/1000</span>

                  <button
                    className="send-message-button"
                    onClick={sendPersonalMessage}
                    disabled={sendingMessage || !personalMessage.trim()}
                  >
                    {sendingMessage
                      ? "Sending..."
                      : "Send me a little message 💌"}
                  </button>
                </div>

                {messageStatus && (
                  <p className="message-status">
                    {messageStatus}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </section>


          {/* FOOTER */}
          <footer className="footer">
            <p>
              Made with care, just for you{" "}
              <Heart size={15} fill="currentColor" />
            </p>
            <span>♡</span>
          </footer>
        </>
      )}
    </main>
  );
}

export default App;
