# AI-Powered Client Feedback Routing System

An n8n automation that pulls in client feedback from a Google Form, runs it through an AI model to figure out sentiment, risk, and next steps, and then sorts it automatically into Google Sheets  with a dashboard on top that updates itself.

I built this as a portfolio project to show what I can do with no-code automation and AI integration.

**Note:** This is a practice project, not a real client's work. Names, emails, and feedback are all made up ("Alladi" is just a placeholder brand name). I've also blurred/left out the actual spreadsheet rows in the screenshots below, just to be safe about not publishing anything that looks like real client data.

## What problem does this solve?

If a company collects feedback through a Google Form, someone eventually has to read through it and figure out what matters. That's fine at first, but once you're getting dozens or hundreds of responses, it gets slow and inconsistent — one person might flag something as urgent, another might miss it entirely.

This workflow handles that first pass automatically. When someone submits the form:

1. It picks up the new response right away, no manual checking needed.
2. It looks at the star rating and sorts the feedback into positive or negative.
3. It sends the comment to an AI model, which reads it like a junior analyst would — pulling out the sentiment, the actual problem, a suggested fix, how much risk there is of losing the client, and a priority level.
4. It writes that analysis into the right sheet (positive or negative).
5. A dashboard tab keeps a running total of everything, so you can see at a glance how things are trending without digging through individual rows.

## How it works

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
     ├── Rating ≥ 4  ──▶  "Positive" branch
     │                        │
     │                        ▼
     │                  AI Agent (Mistral Cloud Chat Model)
     │                  analyzes: sentiment, problem, solution,
     │                  risk level, priority
     │                        │
     │                        ▼
     │                  Code node (JavaScript)
     │                  parses the AI's text response into
     │                  clean, separate fields
     │                        │
     │                        ▼
     │                  Append row to "Positive Feedback" sheet
     │
     └── Rating < 4  ──▶  "Negative" branch
                              │
                              ▼
                        AI Agent (Negative) + Memory
                        (same kind of analysis, tuned for
                        complaints / risk of churn)
                              │
                              ▼
                        Code node (JavaScript)
                        parses the response
                              │
                              ▼
                        Append row to "Negative Feedback" sheet

     Both sheets feed into:
     ▼
Dashboard tab (Google Apps Script)
  → totals, urgency buckets (Urgent / Watch / Good),
    and average ratings — updated automatically
```

Think of the Switch node as a mail sorter — it looks at the rating and decides which pile the feedback goes into. Each pile has its own AI "reader" that summarizes what happened and what to do about it. Both piles land in their own sheet, and a third tab just counts and averages what's in them.

## Tech stack

| Tool | Role in this project |
|---|---|
| **n8n** | Connects everything and runs the workflow |
| **Google Forms** | Collects the raw feedback |
| **Google Sheets** | Stores the raw responses, the AI-analyzed data, and the dashboard |
| **Google Sheets API** (via n8n's Google Sheets node) | Lets n8n read new form rows and write results back |
| **Mistral AI** (via n8n's Mistral Cloud Chat Model node) | Reads each comment and writes the analysis |
| **n8n Code node (JavaScript)** | Splits the AI's text answer into clean columns (Sentiment, Problem, Solution, Risk Level, Priority) using regex |
| **Google Apps Script** | Runs the dashboard tab — totals, urgency buckets, averages, all automatic |

## Screenshots

**1. The n8n workflow canvas**

![n8n workflow canvas showing the full automation: a Google Sheets trigger feeds into a Switch node, which splits into two branches — a Positive Feedback AI Agent and a Negative Feedback AI Agent (each connected to a Mistral Cloud Chat Model and a Code node) — before appending results to separate Google Sheets tabs.](screenshots/workflow-canvas.png)

The full automation end to end: a new form row triggers it, the Switch node routes by rating, and each branch runs its own AI analysis before writing back to Google Sheets.

**2. Live dashboard**

![Google Sheets dashboard tab showing total feedback count, a breakdown by urgency (Urgent, Watch, Good), and average/lowest/highest ratings, all color-coded and updated automatically. Individual client data rows are blurred to protect privacy.](screenshots/dashboard.png)

The dashboard tab, built with Google Apps Script, sums everything up at a glance — no need to scroll through rows to know how things are going. (Client data blurred for privacy.)

## Setup

You don't need to write code to get this running — just follow along.

**What you'll need:**
- An n8n account (cloud or self-hosted) — [n8n.io](https://n8n.io)
- A Google account with access to Sheets and Forms
- A Mistral AI API key — [mistral.ai](https://mistral.ai)

**1. Set up your Google Sheet**

Create a new sheet with these tabs (names matter, since the workflow references them):
- `Form_Responses` — where the form sends its answers
- `Positive Feedback` — positive AI-analyzed rows land here
- `Negative Feedback` — negative AI-analyzed rows land here
- `Dashboard` — the summary tab

Grab your Sheet ID from the URL — it's the long string between `/d/` and `/edit`.

**2. Connect your form to the sheet**

Make a Google Form with fields for email, rating, what they liked, and what could improve. Link its responses to the `Form_Responses` tab (Forms → Responses → Google Sheets icon).

**3. Import the workflow into n8n**

Open n8n, create a new workflow, click the "..." menu → Import from File, and select `workflow.json` from this repo. The nodes will show up but won't run yet — you still need your own credentials.

**4. Add your credentials**

The workflow ships with placeholders instead of real credentials. Swap in:

| Placeholder | Replace with |
|---|---|
| `YOUR_GOOGLE_SHEET_ID_HERE` | Your Sheet ID from step 1 |
| Google Sheets credential | Your own Google account, connected via n8n's credential manager |
| Mistral Cloud Chat Model credential | Your own Mistral API key |

To connect a credential: click the node → click the credential dropdown → Create New Credential → sign in or paste your key.

**5. Set up the dashboard script**

In your sheet, go to Extensions → Apps Script, paste in the code from `apps-script/dashboard.gs`, save, and run it once to authorize. Optionally set up a time-based trigger so it refreshes on its own.

**6. Test it**

Submit a test response through the form, run the workflow in n8n, and check that a new row shows up in the right sheet with the AI's analysis — then check that the dashboard totals updated.

## Repo structure

```
ai-feedback-routing-system/
├── README.md
├── LICENSE
├── .gitignore
├── workflow.json          ← exported, credential-free n8n workflow
├── apps-script/
│   └── dashboard.gs        ← Apps Script code for the dashboard tab
└── screenshots/
    ├── workflow-canvas.png
    └── dashboard.png
```

## What this project shows

- Building a multi-branch automation with conditional logic
- Wiring an LLM (Mistral) into a real workflow, not just a chatbot
- Turning unstructured AI output into structured spreadsheet data
- Building a simple reporting layer on top of automated data
- Basic privacy hygiene — scrubbing credentials, using placeholders, and keeping real-looking data out of public screenshots

## License

MIT — see [LICENSE](LICENSE).
