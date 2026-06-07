# Automated Cold Email Outreach Pipeline

A command-line tool that takes one company domain and automatically finds similar companies, sources decision-maker emails, and sends personalized cold outreach — zero manual steps after the initial input.

## How It Works

```
node index.js example.com
```

```
Stage 1 → CompanyEnrich   finds X similar companies
Stage 2 → Prospeo         finds CEO/CTO/VP + LinkedIn URLs
Stage 3 → Hunter.io       resolves and verifies work emails
Stage 4 → Brevo           sends personalized cold emails
```

Each stage's output feeds directly into the next. A confirmation prompt before Stage 4 lets you review emails before they fire.

## Prerequisites

- Node.js v18+
- Accounts on: [CompanyEnrich](https://companyenrich.com), [Prospeo](https://prospeo.io), [Hunter.io](https://hunter.io), [Brevo](https://brevo.com)

## Setup

```bash
git clone <repo-url>
cd outreach-pipeline
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
COMPANY_ENRICH_API_KEY=
PROSPEO_API_KEY=
HUNTER_API_KEY=
BREVO_API_KEY=
SENDER_EMAIL=
SENDER_NAME=
```

Verify your sender email inside Brevo (Senders & IP → Add Sender) before running.

## Usage

```bash
node index.js <domain>

# Examples
node index.js stripe.com
node index.js microsoft.com
node index.js nvidia.com
```

## Project Structure

```
outreach-pipeline/
├── index.js                    ← entry point, runs all 4 stages
├── config.js                   ← loads API keys from .env
├── stages/
│   ├── stageOne.js             ← lookalike company discovery
│   ├── stageTwo.js             ← decision maker + LinkedIn URL finder
│   ├── stageThree.js           ← email resolver and verifier
│   └── stageFour.js            ← email sender
├── utils/
│   └── helper.js               ← shared utilities
└── data/                       ← auto-created, stores stage outputs
    ├── companies.json
    ├── prospects.json
    ├── verified_contacts.json
    └── email_preview.json      ← review this before approving send
```

## Data Flow

| File | Created by | Used by |
|------|-----------|---------|
| `companies.json` | Stage 1 | Stage 2 |
| `prospects.json` | Stage 2 | Stage 3 |
| `verified_contacts.json` | Stage 3 | Stage 4 |
| `email_preview.json` | Stage 4 | You (review before sending) |