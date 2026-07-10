export interface Flag {
  id: string;
  severity: "red" | "yellow" | "green";
  category: string;
  clause: string;
  explanation: string;
  creatorImpact: string;
  suggestedCounterLanguage: string;
  estimatedFinancialImpact?: string;
}

export interface AnalysisResult {
  overallRiskLevel: "Low" | "Moderate" | "High";
  riskScore: number;
  summary: string;
  flags: Flag[];
  negotiationMessage: string;
  recommendedActions: string[];
  source?: "ai" | "fallback";
  contractName?: string;
  brandName?: string;
  scannedAt?: string;
  contractText?: string;
}

export interface CreatorProfile {
  name: string;
  category: string;
  platforms: string[];
  followers: string;
  location: string;
  avgDealValue?: string;
  negotiationTone?: "Friendly" | "Firm" | "Professional";
}

export interface HistoryEntry {
  id: string;
  contractName: string;
  brandName: string;
  date: string;
  type: string;
  riskScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  status: "Reviewed" | "Negotiating" | "Signed" | "Declined";
  result: AnalysisResult;
}

export interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  location: string;
  languages: string[];
  fee: string;
  email: string;
  rating: number;
  bio: string;
}

export interface BrandRecord {
  name: string;
  riskLevel: "Low" | "Medium" | "High";
  avgUsageWindow: string;
  dealsTracked: number;
  commonIssues: string[];
}
