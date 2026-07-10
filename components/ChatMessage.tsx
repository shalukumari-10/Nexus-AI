"use client";
import React, { useState } from "react";
import { ChatMessage as MsgType } from "@/lib/chat-context";

// Holographic avatar component with dynamic glows and orbital particles
export const HolographicAvatar = ({ glowClass, state, size = 42 }: { glowClass: string; state: "idle" | "listening" | "speaking" | "thinking"; size?: number }) => {
  return (
    <div className={`avatar-holder ${glowClass} state-${state}`} style={{ width: size, height: size }}>
      <div className="pulse-ring-glow" />
      {/* 3D vector-designed holographic core */}
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 2 }}>
        {/* Core glowing sphere */}
        <circle cx="50" cy="50" r="28" fill="url(#orb-core-gradient)" className="core-orb" />
        <circle cx="50" cy="50" r="28" stroke="url(#orb-border-gradient)" strokeWidth="1.5" style={{ opacity: 0.8 }} />
        
        {/* 3D reflection highlight */}
        <path d="M35 35 C 40 30, 60 30, 65 35" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Orbit Rings representing intelligence nodes */}
        <ellipse cx="50" cy="50" rx="38" ry="14" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" transform="rotate(-30 50 50)" className="orbit-ring-1" />
        <ellipse cx="50" cy="50" rx="40" ry="10" stroke="rgba(6, 182, 212, 0.22)" strokeWidth="1.2" transform="rotate(45 50 50)" className="orbit-ring-2" />
        
        {/* Animated particles floating on orbits */}
        <circle cx="50" cy="50" r="3.5" fill="#06B6D4" className="orbit-node-1" />
        <circle cx="50" cy="50" r="2.5" fill="#818CF8" className="orbit-node-2" />
        <circle cx="50" cy="50" r="2" fill="#10B981" className="orbit-node-3" />

        <defs>
          <radialGradient id="orb-core-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(28)">
            <stop stopColor="var(--orb-color-stop-1)" />
            <stop offset="0.75" stopColor="var(--orb-color-stop-2)" stopOpacity="0.45" />
            <stop offset="1" stopColor="rgba(15, 23, 42, 0.95)" />
          </radialGradient>
          <linearGradient id="orb-border-gradient" x1="22" y1="22" x2="78" y2="78" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06B6D4" />
            <stop offset="0.5" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default function ChatMessage({
  message,
  onRegenerate,
  onSpeak,
  isSpeakingMsg,
  glowClass = "glow-blue"
}: {
  message: MsgType;
  onRegenerate?: () => void;
  onSpeak?: () => void;
  isSpeakingMsg?: boolean;
  glowClass?: string;
}) {
  const isNexus = message.sender === "nexus";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([message.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexus_advisor_advice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format and highlight entities dynamically
  const formatText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let formatted = line;
      // Bold text: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      formatted = formatted.replace(boldRegex, "<strong>$1</strong>");

      // Highlight financial values
      formatted = formatted.replace(/(\$\d[\d,]*(\.\d+)?|\b\d+(\.\d+)?%)/g, '<span class="entity-financial">$1</span>');

      // Highlight risk terms
      formatted = formatted.replace(/\b(high risk|moderate risk|red flag|warnings|liabilities|liability|exposure|risk score|risky|penalty|penalties|default)\b/gi, '<span class="entity-risk">$1</span>');

      // Highlight deadlines & obligations
      formatted = formatted.replace(/\b(\d+\s+(days|weeks|months|years)|deadline|obligations|obligation|terminate|termination|payment term)\b/gi, '<span class="entity-deadline">$1</span>');
      
      // Bullets format
      if (formatted.trim().startsWith("• ")) {
        return <li key={idx} style={{ marginBottom: 8, marginLeft: 20, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatted.trim().slice(2) }} />;
      }
      return <p key={idx} style={{ margin: "0 0 12px 0", lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isNexus ? "flex-start" : "flex-end",
        marginBottom: 24,
        width: "100%",
        animation: "fadeslide 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
      }}
    >
      <style jsx global>{`
        @keyframes avatar-pulse {
          0% { box-shadow: 0 0 4px rgba(6, 182, 212, 0.4); }
          100% { box-shadow: 0 0 12px rgba(6, 182, 212, 0.8), 0 0 2px var(--violet); }
        }
        .avatar-glow {
          animation: avatar-pulse 2s infinite alternate ease-in-out;
        }
        .chat-action-btn {
          background: none;
          border: none;
          color: var(--text3);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease-in-out;
          font-weight: 500;
        }
        .chat-action-btn:hover {
          color: var(--text2) !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .chat-bubble-container {
          display: flex;
          gap: 16px;
          width: 100%;
          align-items: flex-start;
        }
        .chat-bubble-container.user {
          justify-content: flex-end;
        }
        .bubble-wrapper {
          padding: 14px 18px;
          font-size: 13.5px;
          color: #F8FAFC;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          line-height: 1.6;
        }
        .bubble-wrapper.nexus {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          max-width: 72%;
          border-top-left-radius: 4px;
        }
        .bubble-wrapper.user {
          background: linear-gradient(135deg, var(--violet), #6366f1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 68%;
          border-top-right-radius: 4px;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
        }
        @media (max-width: 768px) {
          .bubble-wrapper.nexus {
            max-width: 85%;
          }
          .bubble-wrapper.user {
            max-width: 82%;
          }
        }
      `}</style>

      <div className={`chat-bubble-container ${isNexus ? "nexus" : "user"}`}>
        {isNexus && (
          <div style={{ flexShrink: 0, marginTop: 2 }} className="hidden md:block">
            <HolographicAvatar glowClass={glowClass} state="idle" size={40} />
          </div>
        )}
        
        <div className={`bubble-wrapper ${isNexus ? "nexus" : "user"}`}>
          {formatText(message.text)}
        </div>
      </div>

      {isNexus && (
        <div style={{ display: "flex", gap: 12, marginTop: 8, marginLeft: 56, flexWrap: "wrap" }}>
          <button onClick={handleCopy} className="chat-action-btn">
            <i className={copied ? "ti ti-check" : "ti ti-copy"} style={{ fontSize: 13 }} /> <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          {onRegenerate && (
            <button onClick={onRegenerate} className="chat-action-btn">
              <i className="ti ti-refresh" style={{ fontSize: 13 }} /> <span>Regenerate</span>
            </button>
          )}
          {onSpeak && (
            <button onClick={onSpeak} className="chat-action-btn">
              <i className={isSpeakingMsg ? "ti ti-volume-off" : "ti ti-volume"} style={{ fontSize: 13 }} /> <span>{isSpeakingMsg ? "Stop" : "Speak"}</span>
            </button>
          )}
          <button onClick={handleSave} className="chat-action-btn">
            <i className="ti ti-download" style={{ fontSize: 13 }} /> <span>Save Advice</span>
          </button>
        </div>
      )}
    </div>
  );
}
