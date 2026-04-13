# Launchbox CRM

A simple, lightweight CRM built for coworking spaces. Manage leads, track follow-ups, and visualize your sales pipeline — all running locally with zero external dependencies.

## Features

- **Dashboard** — Overview stats (total leads, won deals, conversion rate, pipeline value), leads by stage/source charts, upcoming visits & follow-ups
- **Kanban Board** — Drag-and-drop pipeline with 7 stages: New → Contacted → Tour Scheduled → Toured → Negotiation → Won → Lost
- **Lead Management** — Add, view, edit, and delete leads with full details (name, email, phone, company, source, plan type, rate quoted, visit status, follow-up dates)
- **Activity Log** — Track every interaction per lead (calls, emails, visits, meetings, notes, status changes, follow-ups) with a visual timeline
- **Source Tracking** — Track where leads come from: Walk-in, Website, Referral, Social Media, Broker, Other
- **Rate Tracking** — Record quoted rates per lead with plan types (Hot Desk, Dedicated Desk, Private Office, Meeting Room, Virtual Office)

## Tech Stack

- **Next.js** (App Router)
- **Tailwind CSS**
- **SQLite** via better-sqlite3 (zero-config, file-based)
- **dnd-kit** (drag-and-drop for Kanban)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/hashimkha1/launchbox-crm.git
cd launchbox-crm

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The SQLite database is created automatically at `data/crm.db` on first run.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats, charts, and upcoming items |
| `/kanban` | Drag-and-drop pipeline board |
| `/leads` | Searchable & filterable leads table |
| `/leads/new` | Add a new lead |
| `/leads/[id]` | View lead details + activity timeline |
| `/leads/[id]/edit` | Edit lead information |

## License

MIT
