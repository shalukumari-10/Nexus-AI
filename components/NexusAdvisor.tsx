"use client";
import React, { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui";
import { AnalysisResult } from "@/lib/types";
import { ChatMessage as MsgType, generateAdvisorResponse } from "@/lib/chat-context";
import ChatMessage, { HolographicAvatar } from "./ChatMessage";

interface AdvisorProps {
  analysisResult: AnalysisResult;
}

interface ContractConversation {
  id: string;
  contractScannedAt: string;
  title: string;
  messages: MsgType[];
  createdAt: string;
}

const CHIPS = [
  "Is this contract safe?",
  "Explain in simple language",
  "Biggest business risk",
  "What should I negotiate?",
  "Can I sign this?",
  "Estimate my financial exposure"
];

// Helper methods to manage persistent DB
const getChatsDB = (): ContractConversation[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("nexus_chats_db");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveChatsDB = (db: ContractConversation[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nexus_chats_db", JSON.stringify(db));
};

export default function NexusAdvisor({ analysisResult }: AdvisorProps) {
  const contractId = analysisResult.scannedAt || "default-contract";
  
  const [messages, setMessages] = useState<MsgType[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState<ContractConversation[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  
  // Voice AI states
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nexus_voice_replies_enabled");
      return stored === "true";
    }
    return false;
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sidebar visibility drawer state
  const [showSidebar, setShowSidebar] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<any>(null);

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Save Voice preferences to local storage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_voice_replies_enabled", String(voiceEnabled));
    }
  }, [voiceEnabled]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat DB and setup current conversation on mount/load
  useEffect(() => {
    const db = getChatsDB();
    const contractChats = db.filter(c => c.contractScannedAt === contractId);

    if (contractChats.length > 0) {
      const sorted = [...contractChats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setConversations(contractChats);
      setCurrentChatId(sorted[0].id);
      setMessages(sorted[0].messages);
    } else {
      createNewChat(db);
    }
  }, [contractId]);

  // Helper: Speech Recognition Toggle
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

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      if (text) {
        setInput(text);
      }
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Helper: Speech Synthesis speak
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const cleanText = text.replace(/\*\*|\*/g, ""); // strip bold markers
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Helper: Create a brand new conversation
  const createNewChat = (customDB?: ContractConversation[]) => {
    const db = customDB || getChatsDB();
    const newId = `chat-${Date.now()}`;
    const newChat: ContractConversation = {
      id: newId,
      contractScannedAt: contractId,
      title: `Conversation ${db.filter(c => c.contractScannedAt === contractId).length + 1}`,
      messages: [
        {
          id: "initial-msg",
          sender: "nexus",
          text: `Hello! I'm **Nexus**, your Business Trust Intelligence Advisor. I've audited this agreement and mapped its key operational and legal terms. \n\nHow can I assist you today? You can select any of the suggestion chips below or ask me a custom question about the agreement.`,
          timestamp: new Date()
        }
      ],
      createdAt: new Date().toISOString()
    };

    const updated = [...db, newChat];
    saveChatsDB(updated);
    
    // Update local states
    setConversations(updated.filter(c => c.contractScannedAt === contractId));
    setCurrentChatId(newId);
    setMessages(newChat.messages);
    stopSpeaking();
  };

  // Helper: Load specific conversation
  const loadConversation = (id: string) => {
    const db = getChatsDB();
    const found = db.find(c => c.id === id);
    if (found) {
      setCurrentChatId(id);
      setMessages(found.messages);
      stopSpeaking();
    }
  };

  // Helper: Delete single conversation
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const db = getChatsDB();
    const filtered = db.filter(c => c.id !== id);
    saveChatsDB(filtered);

    const remaining = filtered.filter(c => c.contractScannedAt === contractId);
    setConversations(remaining);

    if (currentChatId === id) {
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
        setMessages(remaining[0].messages);
      } else {
        createNewChat(filtered);
      }
    }
  };

  // Helper: Clear all chats for only this contract
  const clearContractChats = () => {
    if (!confirm("Are you sure you want to clear all conversations for this contract?")) return;
    const db = getChatsDB();
    const filtered = db.filter(c => c.contractScannedAt !== contractId);
    saveChatsDB(filtered);
    createNewChat(filtered);
  };

  // Dispatch message sender
  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setLastQuery(text);
    const userMsg: MsgType = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: new Date()
    };

    // Prepend user message in state and save
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    // Save history immediately
    const db = getChatsDB();
    const chatIndex = db.findIndex(c => c.id === currentChatId);
    if (chatIndex !== -1) {
      db[chatIndex].messages = updatedMessages;
      // Auto generate title on first user query
      if (db[chatIndex].title.startsWith("Conversation")) {
        db[chatIndex].title = text.slice(0, 30) + (text.length > 30 ? "..." : "");
      }
      saveChatsDB(db);
      setConversations(db.filter(c => c.contractScannedAt === contractId));
    }

    try {
      const profileStored = typeof window !== "undefined" ? localStorage.getItem("nexus_creator_profile") : null;
      const profile = profileStored ? JSON.parse(profileStored) : undefined;

      const res = await fetch("/api/business-advisor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ sender: m.sender, text: m.text })),
          analysisResult,
          contractText: analysisResult.contractText,
          profile
        }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to get response.");

      const replyText = responseData.text || "I was unable to retrieve a response. Please try again.";
      const nexusMsg: MsgType = {
        id: `msg-${Date.now()}-nexus`,
        sender: "nexus",
        text: replyText,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, nexusMsg];
      setMessages(finalMessages);

      // Save to persistent storage
      const finalDB = getChatsDB();
      const finalChatIdx = finalDB.findIndex(c => c.id === currentChatId);
      if (finalChatIdx !== -1) {
        finalDB[finalChatIdx].messages = finalMessages;
        saveChatsDB(finalDB);
      }

      // Voice response speak if enabled
      if (voiceEnabled) {
        speakText(replyText);
      }
    } catch (err) {
      console.error("Advisor request failed, falling back client-side:", err);
      const fallbackText = generateAdvisorResponse(text, analysisResult);
      const nexusMsg: MsgType = {
        id: `msg-${Date.now()}-nexus`,
        sender: "nexus",
        text: fallbackText,
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, nexusMsg];
      setMessages(finalMessages);

      const finalDB = getChatsDB();
      const finalChatIdx = finalDB.findIndex(c => c.id === currentChatId);
      if (finalChatIdx !== -1) {
        finalDB[finalChatIdx].messages = finalMessages;
        saveChatsDB(finalDB);
      }

      if (voiceEnabled) {
        speakText(fallbackText);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Search filtered conversations
  const filteredChats = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Determine dynamic glow class and avatar states
  const riskLevel = (analysisResult.overallRiskLevel || "Low").toLowerCase();
  let glowColorClass = "glow-blue";
  if (isTyping) {
    glowColorClass = "glow-cyan";
  } else if (riskLevel === "low") {
    glowColorClass = "glow-emerald";
  } else if (riskLevel === "moderate") {
    glowColorClass = "glow-amber";
  } else if (riskLevel === "high") {
    glowColorClass = "glow-red";
  }

  let avatarState: "idle" | "listening" | "speaking" | "thinking" = "idle";
  if (isListening) avatarState = "listening";
  else if (isSpeaking) avatarState = "speaking";
  else if (isTyping) avatarState = "thinking";

  const isChatEmpty = messages.length <= 1;

  return (
    <GlassCard style={{ padding: 0, marginTop: "1.25rem", border: "1px solid var(--glass-border2)", overflow: "hidden", height: "650px", display: "flex", flexDirection: "column" }} className="animate-float-in">
      <style jsx global>{`
        .chat-workspace {
          display: flex;
          height: 100%;
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        .history-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 320px;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(24px);
          WebkitBackdropFilter: blur(24px);
          z-index: 100;
          border-right: 1px solid var(--glass-border);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .history-sidebar.show {
          transform: translateX(0);
        }
        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          z-index: 99;
          animation: fadein 0.2s ease-out;
        }
        .chat-main-area {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        .advisor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--glass-border);
          padding: 16px 24px;
          background: rgba(15, 23, 42, 0.2);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }
        .avatar-holder {
          position: relative;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: hover-float 4s infinite alternate ease-in-out;
          transition: all 0.4s ease-in-out;
          flex-shrink: 0;
        }
        
        /* Glow Colors */
        .glow-blue {
          --orb-color-stop-1: rgba(79, 70, 229, 0.7);
          --orb-color-stop-2: rgba(79, 70, 229, 0.2);
          --orb-shadow: 0 0 16px rgba(79, 70, 229, 0.55);
          --ring-border: rgba(79, 70, 229, 0.4);
        }
        .glow-cyan {
          --orb-color-stop-1: rgba(6, 182, 212, 0.75);
          --orb-color-stop-2: rgba(6, 182, 212, 0.2);
          --orb-shadow: 0 0 20px rgba(6, 182, 212, 0.7);
          --ring-border: rgba(6, 182, 212, 0.5);
        }
        .glow-emerald {
          --orb-color-stop-1: rgba(16, 185, 129, 0.7);
          --orb-color-stop-2: rgba(16, 185, 129, 0.15);
          --orb-shadow: 0 0 16px rgba(16, 185, 129, 0.55);
          --ring-border: rgba(16, 185, 129, 0.35);
        }
        .glow-amber {
          --orb-color-stop-1: rgba(245, 158, 11, 0.7);
          --orb-color-stop-2: rgba(245, 158, 11, 0.15);
          --orb-shadow: 0 0 16px rgba(245, 158, 11, 0.55);
          --ring-border: rgba(245, 158, 11, 0.35);
        }
        .glow-red {
          --orb-color-stop-1: rgba(239, 68, 68, 0.75);
          --orb-color-stop-2: rgba(239, 68, 68, 0.2);
          --orb-shadow: 0 0 18px rgba(239, 68, 68, 0.65);
          --ring-border: rgba(239, 68, 68, 0.4);
        }
        
        .avatar-holder {
          box-shadow: var(--orb-shadow);
        }
        
        .pulse-ring-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid var(--ring-border);
          animation: avatar-pulse-glow 2.5s infinite ease-in-out;
        }

        .analyzing-indicator {
          display: inline-flex;
          align-items: center;
          background: rgba(6, 182, 212, 0.06);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 0px 12px 12px 12px;
          padding: 12px 18px;
          font-size: 13px;
          color: #06B6D4;
          font-weight: 500;
          animation: pulse-border 1.5s infinite alternate ease-in-out;
        }

        .chip-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          color: var(--text2);
          padding: 7px 14px;
          border-radius: 20px;
          font-size: 11.5px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .chip-btn:hover {
          background: rgba(79, 70, 229, 0.1);
          border-color: rgba(79, 70, 229, 0.25);
          color: var(--text);
          transform: translateY(-1px);
        }

        .reset-btn, .voice-toggle-btn {
          color: var(--text3);
          transition: color 0.15s ease-in-out;
        }
        .reset-btn:hover, .voice-toggle-btn:hover {
          color: var(--text) !important;
        }

        .sidebar-chat-item {
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          color: var(--text2);
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease-in-out;
          height: 38px;
        }
        .sidebar-chat-item.active {
          background: rgba(79, 70, 229, 0.1);
          border-color: rgba(79, 70, 229, 0.25);
          color: var(--text);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .sidebar-chat-item:hover:not(.active) {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text);
        }

        @keyframes hover-float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-4px); }
        }
        @keyframes avatar-pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.15; }
        }
        @keyframes pulse-border {
          0% { border-color: rgba(6, 182, 212, 0.2); box-shadow: 0 0 4px rgba(6, 182, 212, 0.05); }
          100% { border-color: rgba(6, 182, 212, 0.5); box-shadow: 0 0 12px rgba(6, 182, 212, 0.15); }
        }
        @keyframes orbit-1 {
          0% { transform: rotate(0deg) translate(30px) rotate(0deg); }
          100% { transform: rotate(360deg) translate(30px) rotate(-360deg); }
        }
        @keyframes orbit-2 {
          0% { transform: rotate(180deg) translate(32px) rotate(-180deg); }
          100% { transform: rotate(540deg) translate(32px) rotate(-540deg); }
        }
        @keyframes orbit-3 {
          0% { transform: rotate(90deg) translate(22px) rotate(-90deg); }
          100% { transform: rotate(450deg) translate(22px) rotate(-450deg); }
        }
        .orbit-node-1 { animation: orbit-1 6s infinite linear; transform-origin: 50px 50px; }
        .orbit-node-2 { animation: orbit-2 5s infinite linear; transform-origin: 50px 50px; }
        .orbit-node-3 { animation: orbit-3 7s infinite linear; transform-origin: 50px 50px; }

        /* Soundwaves speak animation */
        @keyframes soundwave-pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .voice-wave-1 { animation: soundwave-pulse 1.8s infinite ease-out; transform-origin: 50px 50px; }
        .voice-wave-2 { animation: soundwave-pulse 1.8s infinite ease-out; animation-delay: 0.9s; transform-origin: 50px 50px; }

        /* Listening ring animation */
        @keyframes ring-dash {
          0% { stroke-dashoffset: 24; transform: rotate(0deg); }
          100% { stroke-dashoffset: 0; transform: rotate(360deg); }
        }
        .listening-ring { animation: ring-dash 4s infinite linear; transform-origin: 50px 50px; }
        .listening-ring-outer { animation: ring-dash 8s infinite linear reverse; transform-origin: 50px 50px; }

        /* Thinking indicator */
        @keyframes spin-think {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .thinking-arc { animation: spin-think 1.5s infinite linear; transform-origin: 50px 50px; }

        /* Welcome Cards Empty State */
        .welcome-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 14px 18px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .welcome-card:hover {
          background: rgba(79, 70, 229, 0.08) !important;
          border-color: rgba(79, 70, 229, 0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .welcome-card:hover .arrow-icon {
          color: var(--text) !important;
          transform: translateX(3px);
        }
        .arrow-icon {
          transition: transform 0.2s ease-in-out, color 0.2s;
        }

        .chips-container {
          display: flex;
          gap: 8px;
          padding: 4px 24px;
          margin-bottom: 12px;
          overflow-x: auto;
          flex-wrap: wrap;
        }

        .speaking-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #818CF8;
          animation: speak-pulse 1s infinite alternate ease-in-out;
        }
        @keyframes speak-pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        .messages-viewport {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
          padding: 24px;
          background: rgba(0, 0, 0, 0.1);
        }

        @keyframes fadein {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .chips-container {
            padding: 4px 16px;
            flex-wrap: nowrap;
          }
        }
      `}</style>

      {/* Slide-over drawer overlay backdrop */}
      {showSidebar && (
        <div className="sidebar-backdrop" onClick={() => setShowSidebar(false)} />
      )}

      {/* Main viewport-like container */}
      <div className="chat-workspace">
        {/* Fixed position sidebar slide drawer */}
        <div className={`history-sidebar ${showSidebar ? "show" : ""}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Conversations</span>
            <button
              onClick={() => {
                createNewChat();
                setShowSidebar(false);
              }}
              className="chat-action-btn"
              title="Create a new conversation thread"
              style={{ padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 6 }}
            >
              <i className="ti ti-plus" style={{ fontSize: 11 }} /> New Chat
            </button>
          </div>

          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid var(--glass-border)",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              color: "var(--text)",
              outline: "none"
            }}
          />

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }} className="no-scrollbar">
            {filteredChats.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  loadConversation(c.id);
                  setShowSidebar(false);
                }}
                className={`sidebar-chat-item ${currentChatId === c.id ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", flex: 1 }}>
                  <i className="ti ti-message" style={{ fontSize: 13, flexShrink: 0, opacity: 0.7 }} />
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {c.title}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteConversation(c.id, e)}
                  style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: "2px 4px", transition: "color 0.2s" }}
                  className="hover:text-red-400"
                  title="Delete chat thread"
                >
                  <i className="ti ti-trash" style={{ fontSize: 11 }} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={clearContractChats}
            className="chat-action-btn"
            style={{ justifyContent: "center", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "8px 0", borderRadius: 8, marginTop: "auto", fontSize: 12 }}
          >
            <i className="ti ti-trash" style={{ fontSize: 12 }} /> Clear Contract History
          </button>
        </div>

        {/* Right Side: Main Chat Copilot interface */}
        <div className="chat-main-area">
          {/* Sticky Header */}
          <div className="advisor-header" style={{ paddingRight: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Hamburger Button always visible to trigger slide drawer */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text2)",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Toggle conversation list"
              >
                <i className="ti ti-menu-2" />
              </button>

              <HolographicAvatar glowClass={glowColorClass} state={avatarState} size={42} />
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#F8FAFC", marginBottom: 1, letterSpacing: "0.02em" }}>NEXUS</h3>
                <p style={{ fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--emerald)", display: "inline-block" }} />
                  Business Intelligence Copilot
                </p>
              </div>
            </div>

            {speechSupported && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isSpeaking && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#818CF8", fontSize: 11.5, fontWeight: 500 }}>
                    <span className="speaking-dot" />
                    <span>Speaking...</span>
                  </div>
                )}
                
                {/* Audio Synthesis Toggle */}
                <button
                  onClick={() => {
                    if (voiceEnabled) stopSpeaking();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className="voice-toggle-btn"
                  style={{
                    background: "none",
                    border: "none",
                    color: voiceEnabled ? "#06B6D4" : "var(--text3)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title={voiceEnabled ? "Mute voice replies" : "Enable voice replies"}
                >
                  <i className={voiceEnabled ? "ti ti-volume" : "ti ti-volume-off"} style={{ fontSize: 15 }} />
                  <span>Voice replies: {voiceEnabled ? "ON" : "OFF"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Message Box */}
          <div className="messages-viewport">
            {isChatEmpty ? (
              /* Premium Welcome Screen State */
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "2.5rem 1rem",
                height: "100%",
                animation: "fadeslide 0.4s ease-out"
              }}>
                <HolographicAvatar glowClass={glowColorClass} state={avatarState} size={64} />
                <h2 style={{ fontSize: "1.75rem", fontWeight: 650, color: "#F8FAFC", marginTop: "1.25rem", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
                  Welcome to Nexus AI
                </h2>
                <p style={{ fontSize: "13.5px", color: "var(--text2)", marginBottom: "2.25rem", maxWidth: 420 }}>
                  Ask anything about your agreement. Get risk scores, payment reviews, and negotiation plans.
                </p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 12,
                  width: "100%",
                  maxWidth: 580
                }} className="welcome-grid">
                  {CHIPS.map((chip, idx) => {
                    const icons = [
                      "ti-shield-check",
                      "ti-text-recognition",
                      "ti-alert-octagon",
                      "ti-arrows-left-right",
                      "ti-signature",
                      "ti-coin"
                    ];
                    return (
                      <div
                        key={chip}
                        onClick={() => handleSend(chip)}
                        className="welcome-card"
                      >
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <i className={`ti ${icons[idx]}`} style={{ color: "#06B6D4", fontSize: 15 }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{chip}</span>
                        </div>
                        <i className="ti ti-chevron-right arrow-icon" style={{ color: "var(--text3)", fontSize: 14 }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Conversation Messages List */
              <>
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onSpeak={() => {
                      if (isSpeaking) stopSpeaking();
                      else speakText(msg.text);
                    }}
                    onRegenerate={msg.sender === "nexus" && lastQuery ? () => handleSend(lastQuery) : undefined}
                    isSpeakingMsg={isSpeaking && utteranceRef.current?.text === msg.text.replace(/\*\*|\*/g, "")}
                    glowClass={glowColorClass}
                  />
                ))}
                {isTyping && (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24, width: "100%" }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      <HolographicAvatar glowClass={glowColorClass} state="thinking" size={40} />
                    </div>
                    <div className="analyzing-indicator">
                      <span className="spinner" style={{ marginRight: 10, borderTopColor: "#06B6D4", width: 14, height: 14 }} />
                      Analyzing Agreement...
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Sticky Composer Section */}
          <div style={{ padding: "12px 0 24px", background: "rgba(15, 23, 42, 0.2)", borderTop: "1px solid var(--glass-border)", flexShrink: 0 }}>
            {/* Show suggestions chips ONLY when thread has active conversation messages */}
            {!isChatEmpty && (
              <div className="chips-container no-scrollbar">
                {CHIPS.map((chip) => (
                  <button key={chip} onClick={() => handleSend(chip)} className="chip-btn">
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Composer Box */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "0 24px" }}>
              <input
                type="text"
                placeholder="Ask Nexus about payment security, IP exposure, or contract clauses..."
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
                  padding: "11px 16px",
                  fontSize: 13.5,
                  color: "#F8FAFC",
                  outline: "none",
                }}
              />
              
              {/* Microphone Speak button */}
              <button
                onClick={toggleListening}
                style={{
                  background: isListening ? "rgba(239, 68, 68, 0.18)" : "rgba(255,255,255,0.03)",
                  border: isListening ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--glass-border)",
                  color: isListening ? "#EF4444" : "var(--text2)",
                  borderRadius: 10,
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  flexShrink: 0
                }}
                title={isListening ? "Listening... click to stop" : "Record spoken question"}
              >
                <i className="ti ti-microphone" style={{ fontSize: 18 }} />
              </button>

              <button
                onClick={() => handleSend(input)}
                className="btn-primary"
                style={{ padding: "10px 20px", borderRadius: 10, height: 42, flexShrink: 0 }}
              >
                <i className="ti ti-send" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
