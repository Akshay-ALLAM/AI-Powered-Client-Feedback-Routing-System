# Setup Guide

This guide explains how to recreate the AI-powered client feedback routing system from scratch.

## Prerequisites

- n8n Cloud or a self-hosted n8n instance
- Google account with access to Forms and Sheets
- Mistral AI API key
- A Google Sheet connected to a Google Form

## Google Form Fields

Create a Google Form with these questions:

| Field | Suggested question |
| --- | --- |
| Name | Name |
| Email | What is your email? |
| Rating | How would you rate your experience with Alladi? |
| Positive comment | What did you like most about Alladi? |
| Improvement comment | What could we improve? |

The exact question text becomes the Google Sheets column header. If you change the wording, update the matching n8n field references.

## Google Sheet Tabs

Use one spreadsheet with four tabs:

1. `Form_Responses`
2. `Positive Feedback`
3. `Negative Feedback`
4. `Dashboard`

The positive and negative tabs should use this header order:

```text
Name, Email, Rating, Sentiment, Problem, Solution, Risk Level, Priority
```

## n8n Workflow Build

Create the workflow with this high-level flow:

```text
Google Sheets Trigger
  -> Switch on rating
    -> Positive branch
      -> Mistral AI analysis
      -> Code node to parse fields
      -> Append row to Positive Feedback
    -> Negative branch
      -> Mistral AI analysis
      -> Code node to parse fields
      -> Append row to Negative Feedback
```

Suggested rating rule:

- Rating greater than or equal to `4`: positive branch
- Rating less than `4`: negative branch

## AI Output Contract

Ask the model to return plain text in this fixed format:

```text
Name:
Email:
Rating:
Sentiment:
Priority:
Problem:
Solution:
Risk Level:
```

This makes the Code node easier to parse into spreadsheet columns.

## Dashboard

Open the Google Sheet, go to `Extensions -> Apps Script`, and paste the code from `apps-script/dashboard.gs`.

Run `buildDashboard` once manually to authorize it. Then add a time-driven trigger so the dashboard refreshes automatically.

## Test Checklist

- Submit one 5-star response and confirm it lands in `Positive Feedback`.
- Submit one 1-star response and confirm it lands in `Negative Feedback`.
- Confirm each row includes sentiment, priority, problem, solution, and risk level.
- Run `buildDashboard` and confirm totals, average rating, and urgency buckets update.
- Check screenshots before publishing and blur any real names, emails, or comments.
