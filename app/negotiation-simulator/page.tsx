"use client";
import React, { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { GlassCard, Badge } from "@/components/ui";
import { getLastResult } from "@/lib/storage";

interface MsgType {
  sender: "client" | "nexus";
  text: string;
  timestamp: string;
}

interface NegotiationClause {
  id: string;
  category: string;
  severity: "red" | "yellow" | "green";
  originalClause: string;
  nexusProposal: string;
  clientCounter: string;
  finalVersion: string;
  businessImpact: string;
  savings: string;
  chatHistory: MsgType[];
  successRate?: number;
  protectionRate?: number;
  moneySaved?: number;
  riskReduced?: number;
  agreed?: boolean;
}

const DEFAULT_CLAUSES: NegotiationClause[] = [
  {
    id: "c-1",
    category: "Unlimited Revisions Limit",
    severity: "red",
    originalClause: "Contractor agrees to perform any and all revisions requested by the Client until Client is fully satisfied with the final deliverables, without additional compensation.",
    nexusProposal: "Contractor includes up to 2 rounds of creative revisions. Any additional revision requests will be billed at Contractor's standard hourly rate of $150/hr.",
    clientCounter: "Awaiting negotiation offer...",
    finalVersion: "Negotiation in progress...",
    businessImpact: "Prevents scope creep and uncompensated labor hours on client revisions.",
    savings: "$3,500 per project iteration",
    chatHistory: [
      { sender: "client", text: "We want unlimited revisions to ensure the final deliverables match our exact brand guidelines. We cannot pay extra for standard edits.", timestamp: "10:04 AM" }
    ],
    successRate: 15,
    protectionRate: 20,
    moneySaved: 0,
    riskReduced: 10
  },
  {
    id: "c-2",
    category: "Unlimited Liability Exposure",
    severity: "red",
    originalClause: "Contractor shall defend, indemnify, and hold harmless the Client and its officers from any and all losses, costs, and damages arising out of the performance of services under this Agreement.",
    nexusProposal: "Contractor's maximum aggregate liability under this agreement shall be strictly capped at the total fees paid to Contractor during the preceding 12-month period.",
    clientCounter: "Awaiting negotiation offer...",
    finalVersion: "Negotiation in progress...",
    businessImpact: "Protects organization from catastrophic liability claims exceeding contract values.",
    savings: "$120,000 risk liability offset",
    chatHistory: [
      { sender: "client", text: "Our risk team requires full indemnification for vendor-provided services. Capping liability at fees paid leaves us heavily exposed.", timestamp: "10:12 AM" }
    ],
    successRate: 10,
    protectionRate: 15,
    moneySaved: 0,
    riskReduced: 5
  },
  {
    id: "c-3",
    category: "Pre-existing IP Overreach",
    severity: "yellow",
    originalClause: "All Intellectual Property rights, copyrights, patents, and work products created by Contractor prior to or during the term of this Agreement shall vest solely and exclusively in the Client upon creation.",
    nexusProposal: "Client shall own work products created specifically for this project upon full payment of fees. Pre-existing materials and tools remain the sole property of Contractor.",
    clientCounter: "Awaiting negotiation offer...",
    finalVersion: "Negotiation in progress...",
    businessImpact: "Preserves proprietary tools and pre-existing assets for reuse in future client projects.",
    savings: "$15,000 proprietary tools value",
    chatHistory: [
      { sender: "client", text: "We need full copyright ownership of all materials developed. If it includes pre-existing tools, we must own them to prevent licensing issues.", timestamp: "10:22 AM" }
    ],
    successRate: 25,
    protectionRate: 30,
    moneySaved: 0,
    riskReduced: 15
  }
];

export default function NegotiationSimulator() {
  const [clauses, setClauses] = useState<NegotiationClause[]>(DEFAULT_CLAUSES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [toastMsg, setToastMsg] = useState("");

  // Voice States
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Mobile navigation drawers
  const [showLeftMobile, setShowLeftMobile] = useState(false);
  const [showRightMobile, setShowRightMobile] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<any>(null);

  const activeClause = clauses[activeIndex];
  const contractResult = getLastResult();
  const contractKey = `nexus_sim_session_${contractResult?.scannedAt || "default"}`;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeClause?.chatHistory, isTyping]);

  // Load contract result and localStorage cache on mount
  useEffect(() => {
    let initialList = DEFAULT_CLAUSES;
    if (contractResult && contractResult.flags && contractResult.flags.length > 0) {
      initialList = contractResult.flags.map((f, idx) => ({
        id: f.id || `c-${idx}`,
        category: f.category,
        severity: f.severity,
        originalClause: f.clause,
        nexusProposal: f.suggestedCounterLanguage,
        clientCounter: "Awaiting negotiation offer...",
        finalVersion: "Negotiation in progress...",
        businessImpact: f.creatorImpact || "Reduces general legal liability.",
        savings: f.estimatedFinancialImpact || "Unquantified exposure cap",
        chatHistory: [
          {
            sender: "client",
            text: `Hello, I've received the contract draft. Let's negotiate the terms for the ${f.category} clause. What is your proposed adjustment?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ],
        successRate: 15,
        protectionRate: 20,
        moneySaved: 0,
        riskReduced: 10
      }));
    }

    const cached = localStorage.getItem(contractKey);
    if (cached) {
      try {
        setClauses(JSON.parse(cached));
      } catch {
        setClauses(initialList);
      }
    } else {
      setClauses(initialList);
    }
  }, [contractKey]);

  const persistSession = (updated: NegotiationClause[]) => {
    localStorage.setItem(contractKey, JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Voice Speak helper
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speech Recognition input helper
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  };

  // Dynamic dispatch counter sender
  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setLastQuery(text);
    const userMsg: MsgType = {
      sender: "nexus",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedHistory = [...activeClause.chatHistory, userMsg];
    const tempClauses = clauses.map((c, idx) => {
      if (idx === activeIndex) return { ...c, chatHistory: updatedHistory };
      return c;
    });

    setClauses(tempClauses);
    setInput("");
    setIsTyping(true);
    stopSpeaking();

    try {
      const profileStored = typeof window !== "undefined" ? localStorage.getItem("nexus_creator_profile") : null;
      const profile = profileStored ? JSON.parse(profileStored) : undefined;

      const res = await fetch("/api/negotiation-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: activeClause.chatHistory,
          clause: {
            category: activeClause.category,
            originalClause: activeClause.originalClause,
            nexusProposal: activeClause.nexusProposal,
            severity: activeClause.severity
          },
          difficulty,
          agreementName: contractResult?.contractName || "Commercial Contract",
          profile
        })
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to process simulation.");

      const clientMsg: MsgType = {
        sender: "client",
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const finalHistory = [...updatedHistory, clientMsg];
      const finalClauses = clauses.map((c, idx) => {
        if (idx === activeIndex) {
          return {
            ...c,
            chatHistory: finalHistory,
            successRate: responseData.successRate || c.successRate,
            protectionRate: responseData.protectionRate || c.protectionRate,
            moneySaved: responseData.moneySaved !== undefined ? responseData.moneySaved : c.moneySaved,
            riskReduced: responseData.riskReduced || c.riskReduced,
            agreed: responseData.agreed || c.agreed,
            finalVersion: responseData.agreed ? (responseData.finalVersion || c.nexusProposal) : c.finalVersion,
            clientCounter: responseData.text
          };
        }
        return c;
      });

      setClauses(finalClauses);
      persistSession(finalClauses);

      if (voiceEnabled) {
        speakText(responseData.text);
      }
    } catch (err: any) {
      console.warn("Simulator call failed, generating fallback response:", err);
      // Generate fallback local simulator counters
      const clientMsg: MsgType = {
        sender: "client",
        text: "I hear your point, but we need more balanced terms. Let's find a mutual compromise value.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      const finalHistory = [...updatedHistory, clientMsg];
      const finalClauses = clauses.map((c, idx) => {
        if (idx === activeIndex) return { ...c, chatHistory: finalHistory };
        return c;
      });
      setClauses(finalClauses);
      persistSession(finalClauses);
    } finally {
      setIsTyping(false);
    }
  };

  const skipClause = () => {
    if (activeIndex < clauses.length - 1) {
      setActiveIndex(prev => prev + 1);
      triggerToast("Moving to the next clause simulation...");
    } else {
      triggerToast("All contract clauses evaluated!");
    }
  };

  // Export Simulation report as printable document window
  const exportNegotiation = () => {
    if (typeof window === "undefined") return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Nexus AI - Negotiation Agent Report</title>
          <style>
            body { font-family: 'system-ui', sans-serif; background: #0F172A; color: #F8FAFC; padding: 40px; }
            h1 { color: #06B6D4; border-bottom: 2px solid #1E293B; padding-bottom: 12px; }
            .section { margin-bottom: 30px; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; color: #94A3B8; }
            .bubble { padding: 12px; margin-bottom: 10px; border-radius: 8px; font-size: 13px; max-width: 85%; }
            .bubble.client { background: rgba(255,255,255,0.05); color: #F8FAFC; }
            .bubble.nexus { background: rgba(79, 70, 229, 0.15); color: #F8FAFC; margin-left: auto; text-align: right; }
            .label { font-weight: bold; color: #818CF8; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px; }
            .savings { font-size: 18px; color: #10B981; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Contract Negotiation Simulation Report</h1>
          <div class="header-info">
            <span>Agreement: ${contractResult?.contractName || "Operational Contract"}</span>
            <span>Client: ${contractResult?.brandName || "Acme Corp"}</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>

          ${clauses.map((c, i) => `
            <div class="section">
              <h2>Clause ${i + 1}: ${c.category}</h2>
              <div style="margin-bottom: 12px;">
                <span class="label">Original Clause</span>
                <p>"${c.originalClause}"</p>
              </div>
              <div style="margin-bottom: 12px;">
                <span class="label">Agreed Version Wording</span>
                <p style="color: #A7F3D0; font-weight: 500;">"${c.finalVersion || "Pending agreement..."}"</p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                  <span class="label">Business Impact</span>
                  <p>${c.businessImpact}</p>
                </div>
                <div>
                  <span class="label">Savings Offset / Protection Value</span>
                  <p class="savings">${c.savings || (c.moneySaved ? `$${c.moneySaved}` : "Unquantified")}</p>
                </div>
              </div>
              
              <span class="label">Negotiation Chat Transcript</span>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${c.chatHistory.map(h => `
                  <div class="bubble ${h.sender}">
                    <strong>${h.sender === "client" ? "Client Representative" : "Contractor (Nexus AI)"}:</strong> ${h.text}
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <AppShell>
      <style jsx global>{`
        .sim-grid {
          display: grid;
          grid-template-columns: 290px 1fr 340px;
          gap: 16px;
          height: calc(100vh - 130px);
          overflow: hidden;
          position: relative;
        }
        .sim-sidebar-left {
          border-right: 1px solid var(--glass-border);
          padding-right: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }
        .sim-main {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          border-right: 1px solid var(--glass-border);
          border-left: 1px solid var(--glass-border);
          padding: 0 16px;
        }
        .sim-sidebar-right {
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }
        .sim-chat-viewport {
          flex: 1;
          overflow-y: auto;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bubble-sim {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.55;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .bubble-sim.client {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          color: var(--text);
          border-top-left-radius: 3px;
        }
        .bubble-sim.nexus {
          align-self: flex-end;
          background: rgba(79, 70, 229, 0.12);
          border: 1px solid rgba(79, 70, 229, 0.25);
          color: #F8FAFC;
          border-top-right-radius: 3px;
          box-shadow: 0 3px 12px rgba(79,70,229,0.15);
        }
        .sim-action-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .sim-action-btn.primary {
          background: linear-gradient(135deg, var(--violet), var(--blue));
          border: none;
          color: #fff;
        }
        .sim-action-btn.secondary {
          background: var(--glass2);
          border: 1px solid var(--glass-border2);
          color: var(--text);
        }
        .sim-action-btn:hover {
          transform: translateY(-0.5px);
        }
        .sim-action-btn.primary:hover {
          box-shadow: 0 4px 15px rgba(79,70,229,0.3);
        }
        .sim-action-btn.secondary:hover {
          background: var(--glass);
        }
        
        .sim-clause-card {
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          font-size: 12.5px;
        }
        .sim-clause-card.active {
          background: rgba(79, 70, 229, 0.1);
          border-color: rgba(79, 70, 229, 0.25);
          color: var(--text);
        }
        .sim-clause-card:hover:not(.active) {
          background: rgba(255,255,255,0.03);
          color: var(--text);
        }

        .toast-banner {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: #06B6D4;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          z-index: 200;
          box-shadow: 0 10px 25px rgba(0,0,0,0.35);
          animation: fadein 0.2s ease-out;
        }

        .diff-btn {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          color: var(--text2);
          transition: all 0.15s;
        }
        .diff-btn.active {
          background: rgba(6,182,212,0.12);
          border-color: rgba(6,182,212,0.3);
          color: #06B6D4;
        }

        .sim-metric-val {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }

        @media (max-width: 1024px) {
          .sim-grid {
            grid-template-columns: 210px 1fr 260px;
          }
        }

        @media (max-width: 820px) {
          .sim-grid {
            grid-template-columns: 1fr !important;
          }
          .sim-sidebar-left {
            position: fixed;
            top: 110px;
            left: 0;
            bottom: 0;
            width: 260px;
            background: rgba(15,23,42,0.96);
            backdrop-filter: blur(24px);
            z-index: 150;
            padding: 16px !important;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-right: 1px solid var(--glass-border);
          }
          .sim-sidebar-left.show { transform: translateX(0); }
          
          .sim-sidebar-right {
            position: fixed;
            top: 110px;
            right: 0;
            bottom: 0;
            width: 280px;
            background: rgba(15,23,42,0.96);
            backdrop-filter: blur(24px);
            z-index: 150;
            padding: 16px !important;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 1px solid var(--glass-border);
          }
          .sim-sidebar-right.show { transform: translateX(0); }

          .backdrop-sim {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 120;
            backdrop-filter: blur(2px);
          }
        }
      `}</style>

      {/* Toast Alert */}
      {toastMsg && <div className="toast-banner">{toastMsg}</div>}

      {/* Backdrop overlay for mobile */}
      {(showLeftMobile || showRightMobile) && (
        <div className="backdrop-sim" onClick={() => { setShowLeftMobile(false); setShowRightMobile(false); }} />
      )}

      <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
        {/* Header section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "var(--violet2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Agreements</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text3)" }} />
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: 12 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--emerald)" }} />
                <span style={{ fontSize: 9.5, fontWeight: 600, color: "var(--emerald)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Active Simulator</span>
              </div>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 6 }}>AI Negotiation Simulator</h1>
            <p style={{ fontSize: "13.5px", color: "var(--text2)" }}>AI negotiates risky clauses on your behalf.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Difficulty Controls */}
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)", padding: 3, borderRadius: 8 }}>
              {(["easy", "medium", "hard"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d); triggerToast(`Negotiation mode switched to ${d.toUpperCase()}`); }}
                  className={`diff-btn ${difficulty === d ? "active" : ""}`}
                >
                  {d.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Mobile panel toggles */}
            <div style={{ display: "flex", gap: 8 }} className="md:hidden">
              <button
                onClick={() => { setShowLeftMobile(!showLeftMobile); setShowRightMobile(false); }}
                className="sim-action-btn secondary"
                style={{ padding: "6px 12px", fontSize: 11.5 }}
              >
                <i className="ti ti-list" /> Clauses
              </button>
              <button
                onClick={() => { setShowRightMobile(!showRightMobile); setShowLeftMobile(false); }}
                className="sim-action-btn secondary"
                style={{ padding: "6px 12px", fontSize: 11.5 }}
              >
                <i className="ti ti-file-text" /> Details
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Simulator Workspace */}
        <div className="sim-grid">
          {/* 1. Left Sidebar: Clauses list */}
          <div className={`sim-sidebar-left ${showLeftMobile ? "show" : ""}`}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" }}>Risky Clauses</span>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              {clauses.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => { setActiveIndex(i); setShowLeftMobile(false); }}
                  className={`sim-clause-card ${activeIndex === i ? "active" : ""}`}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Badge color={c.severity === "red" ? "red" : "amber"}>{c.severity === "red" ? "High Risk" : "Caution"}</Badge>
                    <span style={{ fontSize: 10.5, color: "var(--text3)" }}>Clause {i+1} of {clauses.length}</span>
                  </div>
                  <span style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>{c.category}</span>
                  <p style={{ fontSize: 11.5, color: "var(--text2)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{c.originalClause}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 12, marginTop: "auto" }}>
              <span style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 4 }}>Simulator Progress</span>
              <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${((activeIndex + 1) / clauses.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, var(--violet), var(--blue))", transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
              </div>
            </div>
          </div>

          {/* 2. Center Workspace: Conversation Simulator */}
          <div className="sim-main">
            {/* active clause banner */}
            <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>Active Topic: {activeClause?.category}</span>
              <Badge color={activeClause?.severity === "red" ? "red" : "amber"}>{activeClause?.severity?.toUpperCase()}</Badge>
            </div>

            {/* Chat list viewport */}
            <div className="sim-chat-viewport">
              {activeClause?.chatHistory.map((m, idx) => (
                <div key={idx} className={`bubble-sim ${m.sender === "client" ? "client" : "nexus"}`}>
                  <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 4, display: "flex", gap: 6, fontWeight: 600 }}>
                    <span>{m.sender === "client" ? "Client Contact" : "Nexus AI"}</span>
                    <span>·</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div>{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="bubble-sim client" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ borderTopColor: "#06B6D4", width: 12, height: 12 }} />
                  <span>Client representative is typing counter proposals...</span>
                </div>
              )}
            </div>

            {/* Input Composer Box */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Type your counter proposal arguments..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(input);
                }}
                style={{
                  flex: 1,
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#F8FAFC",
                  outline: "none",
                }}
              />
              <button
                onClick={toggleListening}
                style={{
                  background: isListening ? "rgba(239, 68, 68, 0.18)" : "rgba(255,255,255,0.03)",
                  border: isListening ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--glass-border)",
                  color: isListening ? "#EF4444" : "var(--text2)",
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                title={isListening ? "Listening... click to stop" : "Record spoken proposal"}
              >
                <i className="ti ti-microphone" style={{ fontSize: 16 }} />
              </button>
              <button
                onClick={() => handleSend(input)}
                className="btn-primary"
                style={{ padding: "10px 16px", borderRadius: 10, height: 40 }}
              >
                Send
              </button>
            </div>

            {/* Bottom Action Composer Bar */}
            <div style={{ borderTop: "1px solid var(--glass-border)", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (voiceEnabled) stopSpeaking();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className="sim-action-btn secondary"
                  title="Enable speech synthesizer for client counter offers"
                >
                  <i className={voiceEnabled ? "ti ti-volume" : "ti ti-volume-off"} /> {voiceEnabled ? "Mute" : "Speak Replies"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={skipClause} className="sim-action-btn secondary">
                  Skip
                </button>
                <button onClick={exportNegotiation} className="sim-action-btn secondary">
                  <i className="ti ti-download" /> Export Report
                </button>
              </div>
            </div>
          </div>

          {/* 3. Right Sidebar: Summary Cards & Dynamic metrics */}
          <div className={`sim-sidebar-right ${showRightMobile ? "show" : ""}`}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" }}>Live Negotiation Metrics</span>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div style={{ background: "rgba(0,0,0,0.2)", border: "0.5px solid var(--glass-border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 4 }}>Success Deal</div>
                <div className="sim-metric-val">{activeClause?.successRate || 10}%</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", border: "0.5px solid var(--glass-border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 4 }}>Protection</div>
                <div className="sim-metric-val">{activeClause?.protectionRate || 15}%</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", border: "0.5px solid var(--glass-border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 4 }}>Risk Reduced</div>
                <div className="sim-metric-val">{activeClause?.riskReduced || 5}%</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", border: "0.5px solid var(--glass-border)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 4 }}>Savings Offset</div>
                <div className="sim-metric-val" style={{ color: "var(--emerald)" }}>
                  {activeClause?.moneySaved ? `$${activeClause.moneySaved}` : "$0"}
                </div>
              </div>
            </div>

            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" }}>Clause Details</span>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <GlassCard>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Original Agreement Clause</span>
                <p style={{ fontSize: 12.5, color: "var(--text2)", fontStyle: "italic", lineHeight: 1.5 }}>
                  "{activeClause?.originalClause}"
                </p>
              </GlassCard>

              <GlassCard>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--violet2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Recommended Proposal</span>
                <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.5 }}>
                  {activeClause?.nexusProposal}
                </p>
              </GlassCard>

              <GlassCard style={{ borderLeft: "3.5px solid var(--emerald)" }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--emerald)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Agreed Version Wording</span>
                <p style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 500, lineHeight: 1.5 }}>
                  {activeClause?.agreed ? activeClause.finalVersion : "Negotiation in progress..."}
                </p>
              </GlassCard>

              <GlassCard>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Business Impact</span>
                <p style={{ fontSize: 12.5, color: "var(--text2)" }}>{activeClause?.businessImpact}</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
function setLastQuery(text: string) {
  // dummy helper for regenerate trackers
}
