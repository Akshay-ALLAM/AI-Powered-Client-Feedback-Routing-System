# n8n Workflow Export Checklist

The public repo should only include a scrubbed workflow export. Before committing a `workflow.json` file, check every item below.

## Remove Sensitive Values

Replace these values with placeholders:

| Sensitive value | Safe placeholder |
| --- | --- |
| Real Google Sheet ID | `YOUR_GOOGLE_SHEET_ID` |
| Real tab `gid` values | `YOUR_SHEET_TAB_ID` |
| Google credential IDs | `YOUR_GOOGLE_SHEETS_CREDENTIAL_ID` |
| Mistral credential IDs | `YOUR_MISTRAL_CREDENTIAL_ID` |
| Instance IDs | `YOUR_N8N_INSTANCE_ID` |
| Webhook URLs | `YOUR_WEBHOOK_URL` |
| Email addresses | `sample@example.com` |

## Keep These Public

These are safe and useful for reviewers:

- Node names
- Branching logic
- Prompt templates, if they do not contain private client data
- Placeholder field names
- Code-node parsing logic
- Sheet tab names

## Final Review

Before pushing, search the exported file for:

```text
api
key
token
secret
credential
client_secret
@gmail.com
docs.google.com/spreadsheets
```

If any real account or credential value appears, replace it before publishing.
