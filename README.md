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
├── workflow.json             ← credential-free n8n workflow
├── apps-script/
│   └── dashboard.gs          ← Apps Script for the dashboard tab
└── screenshots/
    ├── workflow-canvas.png
    └── dashboard.png
```

---

## Security & Credential Hygiene

This repo is safe to make public. Before publishing:

- Every credential ID, Sheet ID, and instance ID in `workflow.json` was replaced with a `YOUR_...` placeholder — no OAuth tokens, API keys, or real IDs are committed.
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
