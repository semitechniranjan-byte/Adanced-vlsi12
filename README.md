# Advanced VLSI — learning platform

Live training and internship platform for [advancedvlsi.com](https://www.advancedvlsi.com).
Students register, enrol in courses or six-month internships, join live Google Meet
sessions, track progress and download certificates. Admins manage teachers, courses,
sessions, certificates and payments, and export everything to Excel.

## Status

This repo currently contains the **working prototype**: every screen of both panels,
fully interactive, with data stored in the browser. It is the specification you build
the real backend against — not the production data layer.

| Part | State |
|---|---|
| Student panel — courses, internships, schedule, certificates | Built |
| Admin panel — teachers, courses, sessions, students, certificates, payments, export | Built |
| Google Meet join flow with 15-minute window | Built |
| Excel export with per-program sheets | Built |
| Database (Postgres + Prisma) | To build — `docs/production-integration.md` |
| Authentication (Auth.js) | To build |
| Payments (Razorpay) | To build |
| File storage (Cloudflare R2) | To build |

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To see the admin panel, register with **admin@advancedvlsi.com** (any password).
Any other email registers as a student.

Data lives in your browser's localStorage. Clearing site data resets everything,
which is a convenient way to start fresh while testing.

## Project structure

```
app/                  Next.js routes
  layout.jsx
  page.jsx            Renders the prototype
components/
  AdvancedVlsiLearn.jsx   The whole prototype — both panels
lib/
  storage.js          Dev shim; delete once the real API exists
docs/
  SETUP-STEPS.md              Accounts, KYC, hosting, launch checklist, scaling
  production-integration.md   Prisma schema and API route code
public/
  logo.jpg
.env.example          Copy to .env and fill in
```

## What to build next

Work through `docs/SETUP-STEPS.md` in order. Phase 0 is time-critical: Razorpay KYC
takes 3–7 working days and blocks your launch if you start it late.

Then replace the browser storage one feature at a time. Each swap is independent, so
the app keeps working throughout:

1. Database and Prisma schema
2. Authentication with Auth.js
3. Courses and sessions read from the database
4. Razorpay checkout and the signature-verification webhook
5. File uploads to R2 — public bucket for photos and thumbnails, **private** bucket
   for certificates
6. Excel export moved to a server route

## Environment variables

Copy `.env.example` to `.env` and fill it in. `.env` is gitignored — keep it that way.
`DATABASE_URL` and `RAZORPAY_KEY_SECRET` give full access to your data and your money.

Verify before every commit:

```bash
git check-ignore .env      # must print: .env
```

## Deployment

Hostinger, via hPanel → Websites → Add Website → Node.js app, deploying from this
repo. `next.config.js` already sets `output: "standalone"` for smaller builds on
shared hosting. Full steps are in `docs/SETUP-STEPS.md`, Phase 9.

## Licence

Private and proprietary. © Advanced VLSI.
