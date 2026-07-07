# AI-Powered Client Feedback Routing System

An n8n automation that pulls in client feedback from a Google Form, runs it through an AI model to determine sentiment, risk level, and next steps, then sorts it automatically into separate Google Sheets — with a live dashboard that updates itself.

> Built with **n8n · Google Forms · Google Sheets · Mistral AI · Google Apps Script**

## Project Assets

- [Setup guide](docs/SETUP.md) - step-by-step rebuild instructions
- [Workflow export checklist](docs/WORKFLOW_EXPORT_CHECKLIST.md) - how to safely publish a scrubbed n8n export
- [Sample form responses](sample-data/form_responses.csv) - fabricated input data
- [Sample analyzed output](sample-data/analyzed_feedback.csv) - fabricated AI-enriched rows
- [Dashboard Apps Script](apps-script/dashboard.gs) - Google Sheets dashboard builder
- [Screenshots](screenshots/) - workflow canvas and dashboard preview

> **Workflow note:** the public repo is structured for a safe portfolio release. Add your real exported `workflow.json` only after scrubbing Sheet IDs, credential IDs, webhook URLs, and instance IDs using the checklist in `docs/WORKFLOW_EXPORT_CHECKLIST.md`.

---

## Who This Works For

Any business that collects customer or client feedback and needs to act on it quickly — without manually reading every response.

| Sector | Why It Fits |
|--------|-------------|
| E-commerce & Retail | High feedback volume; urgent complaints need fast response |
| SaaS & Software | Churn risk detection from dissatisfied users is critical |
| Education & E-learning | Student satisfaction directly affects retention and referrals |
| Hospitality (Hotels, Restaurants) | Reviews and ratings drive reputation — negative ones need immediate action |
| Healthcare & Clinics | Patient feedback affects trust, compliance, and care quality |
| Professional Services (Consulting, Law, Finance) | Client satisfaction is the core of repeat business |
| Real Estate | Long sales cycles make client sentiment tracking essential |
| Fitness & Wellness | Member retention depends on catching dissatisfaction early |
| Event Management | Post-event feedback must be triaged fast for future improvement |
| Automotive Services | Repeat customers rely on trust — complaints must not be missed |
| Food Delivery & Restaurants | Rating drops signal operational issues that need urgent fixes |
| Customer Support Teams | Automates the first-pass triage that agents currently do manually |

**If your business uses a feedback form and someone has to read through it manually — this workflow automates that first step.**

---

> **Note:** This is a portfolio project, not real client work. Names, emails, and feedback are all made up ("Alladi" is a placeholder brand name). Data rows in screenshots are blurred to avoid publishing anything that looks like real client data.

---

## What Problem Does This Solve?

When a company collects feedback through a Google Form, someone eventually has to read through it and decide what matters. That works at small scale — but once you're getting dozens or hundreds of responses, it becomes slow and inconsistent. One person might flag something as urgent; another might miss it entirely.

This workflow handles that first pass automatically. When someone submits the form:

1. It picks up the new response immediately — no manual checking needed
2. It reads the star rating and routes the feedback into a positive or negative branch
3. It sends the comment to an AI model, which reads it like a junior analyst — extracting sentiment, the actual problem, a suggested fix, churn risk, and priority level
4. It writes that analysis into the correct sheet (positive or negative)
5. A dashboard tab keeps a running total of everything, so you can see at a glance how things are trending without scrolling through individual rows

---

## How It Works

```
Google Form
     │  (client submits feedback)
     ▼
Google Sheets (Form_Responses tab)
     │
     ▼
Google Sheets Trigger  ──▶  fires when a new row is added
     │
     ▼
Switch node  ──▶  checks the star rating
     │
     ├── Rating ≥ 4  ──▶  Positive branch
     │                        │
     │                        ▼
     │                  AI Agent (Mistral)
     │                  analyzes: sentiment, problem,
     │                  solution, risk level, priority
     │                        │
     │                        ▼
     │                  Code node (JavaScript)
     │                  parses AI output into clean fields
     │                        │
     │                        ▼
     │                  Append row → Positive Feedback sheet
     │
     └── Rating < 4  ──▶  Negative branch
                              │
                              ▼
                        AI Agent (Negative) + Memory
                        same analysis, tuned for
                        complaints and churn risk
                              │
                              ▼
                        Code node (JavaScript)
                        parses AI output into clean fields
                              │
                              ▼
                        Append row → Negative Feedback sheet

     Both sheets feed into:
     ▼
Dashboard tab (Google Apps Script)
→ totals, urgency buckets (Urgent / Watch / Good),
  average ratings — updated automatically
```

Think of the Switch node as a mail sorter — it reads the rating and decides which pile the feedback goes into. Each pile has its own AI reader that summarizes what happened and what to do about it. Both piles land in their own sheet, and a third tab counts and averages everything automatically.

---

## The AI Analysis

Each feedback comment is passed to a Mistral model prompted to behave like a senior customer-success consultant. It reads the rating, what the client liked, and what they want improved — all together — and returns a fixed, plain-text structure that the Code node then splits into columns:

| Field | What it captures |
|-------|------------------|
| **Name** | Client name (carried through from the form) |
| **Email** | Client email (carried through from the form) |
| **Rating** | The star rating given (1–5) |
| **Sentiment** | Positive · Neutral · Negative |
| **Priority** | Critical · High · Medium · Low |
| **Problem** | 1–2 sentences on the core issue, praise, or opportunity |
| **Solution** | 1–2 practical, consultant-style next steps |
| **Risk Level** | One sentence on how likely the client is to churn, and why |

The model is instructed to stay specific to each client, avoid markdown, and never invent details that aren't in the feedback — which keeps the parsed columns clean and reliable.

---

## Google Sheets Structure

The system uses **one spreadsheet with four tabs**. Column order below matches the live sheets exactly.

### Tab 1 — `Form_Responses` (raw input from Google Form)

| Col | Header |
|-----|--------|
| A | Timestamp |
| B | Name |
| C | What is your email? |
| D | How would you rate your experience with Alladi? |
| E | What did you like most about Alladi? |
| F | What could we improve? |

This tab is written by Google Forms and read by the n8n trigger. Headers are the exact question text — that's why the workflow placeholders (`YOUR_RATING_FORM_FIELD`, etc.) must match your questions word-for-word.

### Tab 2 — `Positive Feedback` (rating ≥ 4, AI-analyzed)

| Col | Header |
|-----|--------|
| A | Name |
| B | Email |
| C | Rating |
| D | Sentiment |
| E | Problem |
| F | Solution |
| G | Risk Level |
| H | Priority |

### Tab 3 — `Negative Feedback` (rating < 4, AI-analyzed)

Identical column structure to `Positive Feedback` — same eight columns in the same order:

`Name · Email · Rating · Sentiment · Problem · Solution · Risk Level · Priority`

### Tab 4 — `Dashboard` (auto-generated summary)

Built by the Apps Script. Combines both feedback tabs, sorts by rating (most urgent first), and shows:

- **Totals** — all feedback, count from positive sheet, count from negative sheet
- **By Rating** — Urgent (1–2 stars) · Watch (3 stars) · Good (4–5 stars)
- **Averages** — overall average rating, lowest, highest
- **Color key** + the full detail table (`Name · Email · Rating · Sentiment · Problem · Solution · Risk Level · Priority`)

> **Column-order note:** the AI prompt and the n8n Code node emit fields in the order `Name · Email · Rating · Sentiment · Priority · Problem · Solution · Risk Level`. The Google Sheets "Append" nodes map by **header name**, not position, so each value lands in the correct column regardless of order — which is why the physical sheet shows `Priority` in the last column while the AI output lists it earlier. Both are correct; nothing needs reordering.

---

## Tech Stack

| Tool | Role |
|------|------|
| **n8n** | Connects everything and runs the workflow |
| **Google Forms** | Collects the raw feedback |
| **Google Sheets** | Stores raw responses, AI-analyzed data, and the dashboard |
| **Google Sheets API** (via n8n) | Lets n8n read new form rows and write results back |
| **Mistral AI** (via n8n's Mistral Cloud Chat Model node) | Reads each comment and writes the analysis |
| **n8n Code node (JavaScript)** | Splits the AI's text answer into clean columns using regex |
| **Google Apps Script** | Powers the dashboard tab — totals, urgency buckets, averages |

---

## Screenshots

**1. The workflow / automation flow**

![Automation flow diagram: a Google Sheets trigger feeds into a Switch node, which splits into a Positive branch and a Negative branch — each with its own Mistral-powered AI Agent and JavaScript Code node — before appending results to separate Google Sheets tabs. A shared Mistral Cloud model and a Simple Memory node support the agents.](screenshots/workflow-canvas.png)

**2. Live dashboard (client data blurred)**

![Google Sheets dashboard tab showing total feedback count, urgency breakdown (Urgent / Watch / Good), and average ratings — all color-coded and auto-updated. Client names, emails, and free-text columns are blurred.](screenshots/dashboard.png)

> These two images are clean diagram renders included with the repo. If you'd rather show your own n8n canvas and Sheets dashboard, just replace the two files in `screenshots/` with your own captures — keep the same filenames and the README links keep working. **Blur name/email columns before uploading real captures.**

---

## Setup

**What you'll need:**

- An n8n account (cloud or self-hosted) — [n8n.io](https://n8n.io)
- A Google account with access to Sheets and Forms
- A Mistral AI API key — [mistral.ai](https://mistral.ai)

### Step 1 — Set Up Your Google Sheet

Create a new sheet with these tabs (names matter — the workflow references them):

- `Form_Responses` — where the form sends answers
- `Positive Feedback` — positive AI-analyzed rows land here
- `Negative Feedback` — negative AI-analyzed rows land here
- `Dashboard` — the summary tab

Grab your Sheet ID from the URL — it's the long string between `/d/` and `/edit`.

### Step 2 — Connect Your Form

Create a Google Form with fields for name, email, star rating, what they liked, and what could improve. Link it to the `Form_Responses` tab (Forms → Responses → Google Sheets icon).

### Step 3 — Build or Import the Workflow

Use the flow in [docs/SETUP.md](docs/SETUP.md) to recreate the workflow in n8n. If you already have a real n8n export, scrub it with [docs/WORKFLOW_EXPORT_CHECKLIST.md](docs/WORKFLOW_EXPORT_CHECKLIST.md), save it as `workflow.json`, and then import it into n8n.

Open n8n → create a new workflow → click the `...` menu → **Import from File** → select the scrubbed `workflow.json`. The nodes will appear but won't run until you add credentials.

### Step 4 — Add Your Credentials

The workflow ships with placeholders instead of real values. Swap them in:

| Placeholder | Replace with |
|-------------|-------------|
| `YOUR_GOOGLE_SHEET_ID` | Your Sheet ID from Step 1 |
| `YOUR_SHEET_TAB_ID` | The `gid` of your `Form_Responses` tab |
| `YOUR_GOOGLE_SHEETS_TRIGGER_CREDENTIAL_ID` | Google account connected via n8n credentials |
| `YOUR_GOOGLE_SHEETS_CREDENTIAL_ID` | Same Google account, used by the write/append nodes |
| `YOUR_MISTRAL_CREDENTIAL_ID` | Your Mistral API key credential |
| `YOUR_RATING_FORM_FIELD` | Exact column name of the rating question |
| `YOUR_EMAIL_FORM_FIELD` | Exact column name of the email field |
| `YOUR_LIKED_FORM_FIELD` | Exact column name of the "what did you like" field |
| `YOUR_IMPROVE_FORM_FIELD` | Exact column name of the "what could improve" field |
| `YOUR_N8N_INSTANCE_ID` | Filled in automatically by your own n8n instance |

> Tip: the field placeholders (`YOUR_RATING_FORM_FIELD`, etc.) must match your form's question text **exactly**, since Google Sheets uses the question as the column header.

### Step 5 — Set Up the Dashboard Script

In your Google Sheet → **Extensions → Apps Script** → paste the code from `apps-script/dashboard.gs` → save and run once to authorize. Then add a time-based trigger (Triggers → Add Trigger → `buildDashboard` → Time-driven) so it refreshes automatically.

### Step 6 — Test It

Submit a test response through the form, execute the workflow in n8n, and check that a new row appears in the correct sheet with AI analysis — then verify the dashboard totals updated.

---

## Repo Structure

```
ai-feedback-routing-system/
├── README.md
├── LICENSE
├── .gitignore
├── apps-script/
│   └── dashboard.gs          ← Apps Script for the dashboard tab
├── docs/
│   ├── SETUP.md              ← Rebuild instructions
│   └── WORKFLOW_EXPORT_CHECKLIST.md
├── sample-data/
│   ├── form_responses.csv    ← Fake raw form inputs
│   └── analyzed_feedback.csv ← Fake AI-analyzed outputs
└── screenshots/
    ├── workflow-canvas.png
    └── dashboard.png

Optional:

└── workflow.json             ← Add only after scrubbing real IDs and credentials
```

---

## Security & Credential Hygiene

This repo is safe to make public. Before publishing a real workflow export:

- Every credential ID, Sheet ID, webhook URL, and instance ID in `workflow.json` should be replaced with a `YOUR_...` placeholder — no OAuth tokens, API keys, or real IDs should be committed.
- All names, emails, and feedback in the screenshots and sample data are fabricated.
- `.gitignore` excludes local env files and any exported workflow that might still contain real credentials, so you don't accidentally commit a live copy.

If you fork this and export your own workflow from n8n, **re-scrub it** before pushing — n8n exports can embed real credential and instance IDs.

---

## What This Project Demonstrates

- Multi-branch automation with conditional routing logic
- Wiring an LLM (Mistral AI) into a real automation workflow
- Turning unstructured AI text output into structured spreadsheet data
- Building a live reporting layer on top of automated data
- Credential hygiene — scrubbing sensitive data, using placeholders, keeping real-looking data out of public screenshots

---

## License

MIT — free to use, modify, and share. See [LICENSE](LICENSE).

---

## Author

Built by **Akshay**.
