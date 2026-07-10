import { AnalysisResult, CreatorProfile, HistoryEntry } from "./types";

const KEYS = {
  PROFILE: "cg_profile",
  HISTORY: "cg_history",
  LAST_RESULT: "cg_last_result",
};

// ---------- Profile ----------
export function saveProfile(profile: CreatorProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function getProfile(): CreatorProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------- History ----------
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const existing = getHistory();
  const next = [entry, ...existing].slice(0, 50); // cap at 50 entries
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(next));
}

export function updateHistoryStatus(id: string, status: HistoryEntry["status"]) {
  if (typeof window === "undefined") return;
  const existing = getHistory();
  const next = existing.map((h) => (h.id === id ? { ...h, status } : h));
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(next));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.HISTORY);
}

// ---------- Last analysis result (for /results page handoff) ----------
export function saveLastResult(result: AnalysisResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEYS.LAST_RESULT, JSON.stringify(result));
}

export function getLastResult(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEYS.LAST_RESULT);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------- CSV export ----------
export function historyToCSV(entries: HistoryEntry[]): string {
  const header = ["Contract Name", "Brand", "Date", "Type", "Risk Score", "Risk Level", "Status"];
  const rows = entries.map((e) => [
    e.contractName,
    e.brandName,
    e.date,
    e.type,
    String(e.riskScore),
    e.riskLevel,
    e.status,
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Dashboard derived metrics ----------
export function computeDashboardMetrics(history: HistoryEntry[]) {
  if (history.length === 0) {
    return {
      contractsScanned: 0,
      riskyClausesFound: 0,
      moneyProtected: 0,
      negotiationSuccessRate: 0,
      avgRiskScore: 0,
      hasData: false,
    };
  }
  const contractsScanned = history.length;
  const riskyClausesFound = history.reduce(
    (sum, h) => sum + h.result.flags.filter((f) => f.severity !== "green").length,
    0
  );
  const avgRiskScore = Math.round(
    history.reduce((sum, h) => sum + h.riskScore, 0) / history.length
  );
  const negotiating = history.filter((h) => h.status === "Negotiating" || h.status === "Signed").length;
  const negotiationSuccessRate = Math.round((negotiating / history.length) * 100);
  // rough estimate: each red flag ~ $400 of protected value, each yellow ~ $150
  const moneyProtected = history.reduce((sum, h) => {
    const reds = h.result.flags.filter((f) => f.severity === "red").length;
    const yellows = h.result.flags.filter((f) => f.severity === "yellow").length;
    return sum + reds * 400 + yellows * 150;
  }, 0);

  return {
    contractsScanned,
    riskyClausesFound,
    moneyProtected,
    negotiationSuccessRate,
    avgRiskScore,
    hasData: true,
  };
}
