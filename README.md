# 🛡️ Nexus AI

**AI-Powered Business Intelligence & Trust Platform**

An AI-powered business trust intelligence platform. Nexus AI scans business agreements (vendor, service, SaaS, employment, NDAs, and creator contracts), flags one-sided clauses across 12+ risk categories, estimates financial impact, and drafts ready-to-send negotiation language — all from the business user's perspective.

> Clients have legal teams. Your business should too. Nexus AI levels the playing field.

---

## Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 18+ → https://nodejs.org
- (Optional but recommended) An NVIDIA API key → https://build.nvidia.com

### 2. Install dependencies
```bash
npm install
```

### 3. Add your API key
```bash
cp .env.local.example .env.local
```
Open `.env.local` and add your real key:
```
NVIDIA_API_KEY=nvapi-...
```

**No key? No problem.** Nexus AI ships with a keyword-based fallback analysis
engine. If `NVIDIA_API_KEY` is missing or the API call fails for any reason, every
endpoint automatically falls back to local analysis — the demo never breaks.

### 4. Run the dev server
```bash
npm run dev
```

Open → **http://localhost:3000**

---

## Backend curl test

```bash
curl -X POST http://localhost:3000/api/analyze-contract \
  -H "Content-Type: application/json" \
  -d '{
    "contractText": "Creator hereby grants Brand a perpetual, irrevocable, worldwide license to use the Content for paid advertising, whitelisting, and dark posting. Payment will be issued within 90 days of final content approval at Brand sole discretion. There is no kill fee. Brand may cancel without further financial obligation. Creator agrees to 12 months exclusivity with competing brands. All Content shall be considered work-for-hire and Brand shall own all intellectual property rights."
  }'
```

Expect a JSON response with `overallRiskLevel: "High"`, `riskScore` ~90+, and 5-6 flags.

Try a fair contract and confirm a low score:
```bash
curl -X POST http://localhost:3000/api/analyze-contract \
  -H "Content-Type: application/json" \
  -d '{
    "contractText": "This Agreement is between Brand and Creator. Brand shall pay Creator within 10 days of content delivery. The license granted is non-exclusive and limited to 60-day organic use only. A cancellation fee of 50% applies if Brand cancels after production begins. Creator retains all ownership and copyright of the Content created."
  }'
```
Expect `overallRiskLevel: "Low"`, `riskScore` ~10-20.

---

## Demo Flow (for judges)

1. **`/`** — Landing page. Headline, fake contract preview with highlighted risks, pricing.
2. **`/profile`** — Create an organization profile (name, category, industry, organization size). Saves to localStorage.
3. **`/scanner`** — Click **"Use sample agreement"** → pre-fills a high-risk client agreement. Click **"Analyze Agreement"** → watch the AI checklist animate through 7 categories.
4. **`/results`** — Risk score, flag cards (expand any red flag to see clause, explanation, business impact, **estimated financial impact**, counter-language). Try **"Rewrite Clause Fairly"** on a red flag. Switch negotiation tone (Friendly/Firm/Professional). Check the contract highlight panel on the right.
5. **`/dashboard`** — Shows your saved scan in Recent Business Assessments, plus risk distribution and business health trend charts.
6. **`/history`** — Search/filter your scan history. Try **Export CSV**.
7. **`/brand-insights`** — Client leaderboard (Aero Audio = low risk, Lumen Beauty = high risk), common agreement risks chart.
8. **`/negotiation-toolkit`** — Pick a clause category + tone → generates WhatsApp, email, and firm message variants.
9. **`/legal-help`** — Filter lawyers and compliance advisors by specialization, location, language, budget. Click "Book consultation."
10. **`/reports`** — Printable report view of your latest analysis. Download as `.txt`.

---

## Project Structure

```
nexus-ai/
├── app/
│   ├── api/
│   │   ├── analyze-contract/route.ts   ← Core AI engine (NVIDIA + fallback)
│   │   ├── rewrite-clause/route.ts     ← AI clause rewrite + fallback
│   │   └── negotiation-toolkit/route.ts← Tone-based message generator + fallback
│   ├── page.tsx                        ← Landing
│   ├── scanner/page.tsx
│   ├── results/page.tsx
│   ├── dashboard/page.tsx
│   ├── profile/page.tsx
│   ├── history/page.tsx
│   ├── brand-insights/page.tsx
│   ├── negotiation-toolkit/page.tsx
│   ├── legal-help/page.tsx
│   ├── reports/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Sidebar.tsx / AppShell.tsx       ← App-wide nav shell
│   ├── Navbar.tsx                       ← Landing-page nav
│   └── ui.tsx                           ← Shared primitives (cards, badges, buttons)
├── lib/
│   ├── types.ts
│   ├── fallback-analysis.ts             ← Keyword-based risk engine (12+ categories)
│   ├── client-negotiation.ts            ← Client-side tone-variant builder
│   ├── storage.ts                       ← localStorage helpers + CSV export
│   ├── sample.ts                        ← High-risk sample contract
│   └── mock-data.ts                     ← Lawyers + brand records
├── .env.local.example
└── package.json
```

---

## AI Engine Behavior

- **Primary**: NVIDIA API (`meta/llama-3.1-8b-instruct`) via OpenAI-compatible
  `/v1/chat/completions` endpoint, with a structured-JSON system prompt covering
  12+ risk categories, financial impact estimation, and negotiation message generation.
- **Fallback**: If the API key is missing, the request times out (25s), or the
  response can't be parsed as valid JSON, Nexus AI automatically runs a
  keyword/negation-aware local analyzer (`lib/fallback-analysis.ts`). This guarantees
  **different agreements always produce different scores** — a fair agreement scores
  ~10-20, an exploitative one scores 90+ — even with zero API connectivity.
- Every API response includes a `source: "ai" | "fallback"` field so the UI can be
  transparent about which engine produced the result (see the badge on `/results`).

---

## Tech Stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (utility classes available; most UI uses inline styles + CSS vars for the dark-luxury design system)
- **Recharts** for dashboard/brand-insights charts
- **NVIDIA API** (OpenAI-compatible chat completions)
- **localStorage / sessionStorage** for MVP persistence (profile, history, last result)
- **Tabler Icons** (webfont CDN)

---

## Disclaimer

Nexus AI does not provide legal advice. It helps business users identify common
negotiation points and understand agreement risks. Always consult a qualified
attorney before signing any agreement.
