"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Quote {
  id: string;
  text: string;
  author: string;
  enabled: boolean;
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [counterTitle, setCounterTitle] = useState("Próximo Estreno");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const [loading, setLoading] = useState(true);

  // Load landing configuration and quotes
  useEffect(() => {
    async function loadData() {
      try {
        const [configRes, quotesRes] = await Promise.all([
          fetch("/api/landing-config"),
          fetch("/api/quotes"),
        ]);

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData && configData.targetDate) {
            setTargetDate(new Date(configData.targetDate));
            if (configData.title) setCounterTitle(configData.title);
          }
        }

        if (quotesRes.ok) {
          const quotesData = await quotesRes.json();
          if (Array.isArray(quotesData)) {
            setQuotes(quotesData);
          }
        }
      } catch (err) {
        console.error("Error loading landing page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Quotes cycling logic
  useEffect(() => {
    if (quotes.length <= 1) return;

    const interval = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFadeState("in");
      }, 800); // Wait for fade out to complete before switching
    }, 8000); // Show each quote for 8 seconds

    return () => clearInterval(interval);
  }, [quotes]);

  const activeQuote = quotes[currentQuoteIndex];

  return (
    <main className="landing-wrapper">
      <style jsx global>{`
        .landing-wrapper {
          min-height: 100vh;
          background-color: #000000;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 2rem;
        }

        /* Ambient glowing background */
        .landing-wrapper::before {
          content: "";
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 80vw;
          height: 60vh;
          background: radial-gradient(circle, rgba(252, 209, 22, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .content-container {
          max-width: 800px;
          width: 100%;
          text-align: center;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
          animation: fadeIn 1.5s ease-out;
        }

        .header-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.2rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ffffff 0%, #b3b3b3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          font-weight: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .header-line {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #FCD116, transparent);
          margin: 1.5rem auto 0 auto;
        }

        .counter-title {
          font-size: 1rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #FCD116;
          font-weight: 500;
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .timer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .timer-segment {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .timer-segment:hover {
          border-color: rgba(252, 209, 22, 0.2);
          background: rgba(252, 209, 22, 0.01);
          transform: translateY(-2px);
        }

        .timer-number {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 3.5rem;
          font-weight: 400;
          color: #ffffff;
          line-height: 1;
          margin-bottom: 0.5rem;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .timer-label {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #888888;
          font-weight: 500;
        }

        .quotes-container {
          min-height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 0 1rem;
        }

        .quote-block {
          max-width: 650px;
          margin: 0 auto;
          transition: opacity 0.8s ease-in-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .quote-block.fade-in {
          opacity: 0.85;
          transform: translateY(0);
        }

        .quote-block.fade-out {
          opacity: 0;
          transform: translateY(10px);
        }

        .quote-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.25rem;
          font-style: italic;
          line-height: 1.8;
          color: #e0e0e0;
          margin-bottom: 1.2rem;
          position: relative;
        }

        .quote-author {
          font-size: 0.8rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #FCD116;
          font-weight: 600;
        }

        .quote-author::before {
          content: "— ";
          color: rgba(252, 209, 22, 0.5);
        }

        /* Subtle dashboard access in bottom right */
        .admin-access {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          opacity: 0.25;
          transition: opacity 0.3s ease;
          color: #888888;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          font-size: 0.8rem;
        }

        .admin-access:hover {
          opacity: 0.85;
          color: #FCD116;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .header-logo {
            font-size: 1.6rem;
          }
          .timer-grid {
            gap: 0.75rem;
          }
          .timer-segment {
            padding: 1rem 0.5rem;
            border-radius: 8px;
          }
          .timer-number {
            font-size: 2.2rem;
          }
          .timer-label {
            font-size: 0.6rem;
            letter-spacing: 0.1em;
          }
          .quote-text {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <div className="content-container">


        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "#888" }}>
            <span style={{ fontSize: "1.2rem", letterSpacing: "0.1em" }}>Cargando...</span>
          </div>
        ) : (
          <>
            {/* Timer section */}
            <div>
              <h2 className="counter-title">{counterTitle}</h2>
              <div className="timer-grid">
                <div className="timer-segment">
                  <span className="timer-number">{String(timeLeft.days).padStart(2, "0")}</span>
                  <span className="timer-label">Días</span>
                </div>
                <div className="timer-segment">
                  <span className="timer-number">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="timer-label">Horas</span>
                </div>
                <div className="timer-segment">
                  <span className="timer-number">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="timer-label">Min</span>
                </div>
                <div className="timer-segment">
                  <span className="timer-number">{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className="timer-label">Seg</span>
                </div>
              </div>
            </div>

            {/* Changing Quotes section */}
            {quotes.length > 0 && activeQuote && (
              <div className="quotes-container">
                <div className={`quote-block ${fadeState === "in" ? "fade-in" : "fade-out"}`}>
                  <p className="quote-text">“{activeQuote.text}”</p>
                  <span className="quote-author">{activeQuote.author}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Subtle lock link to login/dashboard */}
      <Link href="/dashboard" className="admin-access">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Acceso</span>
      </Link>
    </main>
  );
}
