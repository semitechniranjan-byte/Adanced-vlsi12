# Advanced VLSI — everything you need to do, in order

The prototype you have is the **frontend reference**: it shows exactly how every screen
should look and behave. What you're building now is the real version, with a database
that survives a browser refresh and payments that actually reach your bank account.

Read Phase 0 today. It contains the one thing that will block you if you delay it.

---

## Phase 0 — Do this today (30 minutes)

### 0.1 Start Razorpay KYC immediately

This takes **3 to 7 working days** and cannot be rushed. If you start it in week 3,
you will be sitting idle in week 4 with a finished site that can't take money.

Go to razorpay.com, create an account, and submit:

| Document | Notes |
|---|---|
| PAN card | Business PAN if Advanced VLSI is a registered company, else your personal PAN |
| Bank account proof | Cancelled cheque or bank statement — name must match the PAN |
| Business registration | Incorporation certificate, GST certificate, or Udyam/MSME certificate |
| Address proof | Utility bill or rent agreement for the business address |
| Website URL | You can submit the domain before the site is live |

Choose business category **Education → Online courses**.

Razorpay will reject the application if your website has no Terms, Privacy and Refund
pages. Those are in Phase 8 — but they check at approval time, so have them up before
you request activation.

### 0.2 Buy your domain

Namecheap, GoDaddy or Cloudflare. Around ₹800–1,200/year.
Suggested: `learn.advancedvlsi.com` as a subdomain of your existing site, or a fresh domain.

### 0.3 Decide your first batch

Don't build seven courses. Pick **one** course, one batch, 15–20 seats.
Write down: course title, fee, start date, class days and times, and the syllabus
broken into modules and lessons. You'll need all of this as seed data in Phase 3.

---

## Phase 1 — Create the free accounts (1 hour)

All of these have free tiers that comfortably handle your first few hundred students.

| Service | What it's for | Free tier | Sign up at |
|---|---|---|---|
| **GitHub** | Code storage | Unlimited private repos | github.com |
| **Hostinger** | Hosting | You already have this | hpanel.hostinger.com |
| **Neon** | PostgreSQL database | 0.5 GB storage | neon.tech |
| **Cloudflare R2** | Files (photos, certificates) | 10 GB storage | dash.cloudflare.com |
| **Resend** | Emails | 3,000/month | resend.com |
| **Google Workspace** | Live classes on Meet | Paid — see below | workspace.google.com |

**On Google Meet — read this carefully.** A free Google account cuts off any call with
three or more people at **60 minutes**. Your classes are 2–3 hours, so the free tier will
disconnect your entire class mid-session. Any paid Google Workspace plan raises the limit
to 24 hours.

You only need a paid seat for **whoever hosts the class** — one or two licences, not one
per student. Students join with any ordinary Gmail address, free.

India pricing, per user per month, before 18% GST (check the current rate — Google runs
introductory offers):

| Plan | Roughly | Meet participants | Recording |
|---|---|---|---|
| Free personal account | ₹0 | 100, but **60-minute cap** | No |
| Base (India only) | ~₹99 | 100 | No |
| Starter | ~₹270 | 100 | No |
| Standard | ~₹1,080 | 150 | **Yes** |

**Which to pick.** You've promised students that recordings stay available for a year, and
only Standard records to Drive automatically. Two sensible paths:

- **Standard** for the host account — recording just works, no extra effort.
- **Starter or Base** and record locally with OBS (free), then upload to an unlisted
  YouTube video or Drive and paste the link into the session. Cheaper, but someone has to
  remember to press record every single class.

Start with Starter for your first batch. Upgrade to Standard once recordings become the
thing students actually ask for.

Sign up for all of these with the **same email address** so you're not hunting for logins later.

---

## Phase 2 — Set up your computer (1 hour)

Install, in this order:

1. **Node.js LTS** from nodejs.org — version 20 or newer
2. **Git** from git-scm.com
3. **VS Code** from code.visualstudio.com

Check both installed correctly:

```bash
node -v      # should print v20.x.x or higher
git --version
```

Then create the project:

```bash
npx create-next-app@latest advancedvlsi-learn --typescript --tailwind --app --eslint
cd advancedvlsi-learn
npm i @prisma/client next-auth@beta bcryptjs razorpay resend sharp xlsx
npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm i -D prisma @types/bcryptjs
npx prisma init
npm run dev
```

Open `http://localhost:3000`. If you see the Next.js welcome page, you're set up correctly.

Push it to GitHub right away, before you write any code:

```bash
git add -A
git commit -m "Initial setup"
gh repo create advancedvlsi-learn --private --source=. --push
```

---

## Phase 3 — Database (half a day)

1. In Neon, create a project. Copy the connection string it gives you.
2. Put it in `.env` as `DATABASE_URL`.
3. Copy the full schema from `production-integration.md` section 2 into `prisma/schema.prisma`.
4. Add the `Teacher` model from section 3 and the `Certificate` model from section 8.
5. Run the migration:

```bash
npx prisma migrate dev --name init
npx prisma studio          # opens a visual database browser at localhost:5555
```

6. Write `prisma/seed.ts` to insert your first course, its modules and lessons, one
   teacher, and your admin user. Run it once.

**Critical:** confirm `.env` is listed in `.gitignore`. If your database URL and
Razorpay secret reach GitHub, anyone can drain both. Check before your next commit:

```bash
git check-ignore .env      # should print: .env
```

---

## Phase 4 — Authentication (half a day)

Set up NextAuth with the credentials provider plus Google login.

- Hash every password with `bcrypt` — 10 salt rounds. Never store plain text.
- Put `role` (`STUDENT` / `TEACHER` / `ADMIN`) in the session token.
- Add `middleware.ts` that blocks `/admin/*` unless `role === "ADMIN"`.

Test the gate properly: log in as a student, then type `/admin` in the address bar.
If you see the admin panel, your middleware is wrong. Fix it before moving on — this
is the single most common way small platforms leak their entire student database.

---

## Phase 5 — Build the screens (1 to 2 weeks)

Work in this order. Each step is usable on its own, so you always have something working.

1. **Public pages** — landing, course list, course detail
2. **Student dashboard** — my courses, progress, schedule
3. **Admin: teachers** — add, edit, photo upload
4. **Admin: courses** — create, edit, modules and lessons, thumbnail
5. **Admin: sessions** — schedule classes, Google Meet links
6. **Admin: students and certificates**
7. **Excel export**

The prototype is your specification. Open it beside your editor and copy the layout,
spacing, colours and wording screen by screen. All the logic that matters — the
15-minute join window, the segmented progress bar, the seat counter, the coupon
maths — is already written there and correct.

---

## Phase 6 — File storage (2 hours)

In Cloudflare R2, create **two separate buckets**:

| Bucket | Access | Holds |
|---|---|---|
| `avlsi-public` | Public | Teacher photos, course thumbnails |
| `avlsi-private` | Private | Certificates |

This split is not optional. Certificates must only be reachable through a signed URL
that expires in five minutes. If they sit in the public bucket, anyone who guesses a
filename can download another student's certificate.

Resize images on upload with `sharp` — 400×400 for photos, 1280×720 for thumbnails.
A student uploading a 6 MB phone photo should end up as a 50 KB file in your bucket.

---

## Phase 7 — Payments (1 day)

Build it in this order and test each piece before the next:

1. `POST /api/payments/order` — create the Razorpay order. **Calculate the amount on
   the server.** Never accept an amount the browser sends you.
2. Client-side checkout using Razorpay's script.
3. `POST /api/payments/verify` — verify the HMAC signature, then create the enrollment.
4. `POST /api/payments/webhook` — the same enrollment logic, triggered by Razorpay.

Step 4 is the one people skip and regret. If a student closes their browser the instant
after paying, `verify` never runs — you have taken their money and given them nothing.
The webhook catches it. Use `upsert` so both paths can't create two enrollments.

Test in Razorpay **test mode** with card `4111 1111 1111 1111`, any future expiry, any CVV.

Store money in **paise**: ₹24,999 is `2499900`. Using floats for currency produces
rounding errors that will not match your bank statement.

---

## Phase 8 — Legal pages (2 hours)

Razorpay will not activate your account without these, and they must be reachable
from your footer:

- **Terms & Conditions**
- **Privacy Policy**
- **Refund & Cancellation Policy** — state the actual rule, e.g. "full refund if
  requested before the second class, no refund after"
- **Contact Us** — a real address, phone number and email

Write them for your actual business. Copying another site's policy and forgetting to
change the company name is a common and embarrassing rejection reason.

---

## Phase 9 — Deploy (2 hours)

You already pay for Hostinger, so use it. Vercel's free Hobby plan is for
**non-commercial** projects; selling courses would need Vercel Pro (~₹1,700/month).
Hostinger costs you nothing extra and now supports Next.js properly.

### 9.1 Check your Hostinger plan

hPanel → **Websites** → **Add Website**. Look for **"Node.js app"** or **"Web apps"**.

| Plan | Works? |
|---|---|
| Web Hosting (Premium / Business / Cloud) | Yes — GitHub deploy from hPanel |
| VPS | Yes — you manage Nginx, PM2 and SSL yourself |
| Website Builder only | No — upgrade needed |

Supported Node versions: 18.x, 20.x, 22.x, 24.x. Pick 20 or 22.

### 9.2 Keep the database on Neon, not Hostinger MySQL

Hostinger provides MySQL. Our schema uses PostgreSQL array columns:

```prisma
expertise String[]     // Postgres only — MySQL does not support this
```

Moving to MySQL means rewriting those as JSON columns or separate tables, plus other
Prisma differences. Neon's free Postgres connects fine from Hostinger. Point
`DATABASE_URL` at Neon and change nothing else.

### 9.3 Optimise the build for shared hosting

In `next.config.js`:

```js
module.exports = { output: 'standalone' };
```

This produces a much smaller build — it matters when you don't have a whole server to
yourself.

### 9.4 Deploy

1. Push your code to a private GitHub repo.
2. hPanel → Websites → Add Website → **Node.js app**.
3. Connect GitHub, select the repo and the `main` branch.
4. Build command `npm run build`, start command `npm start`.
5. Add every environment variable from `.env` in hPanel. Use a **different**
   `NEXTAUTH_SECRET` than the one on your laptop, and set `NEXTAUTH_URL` to
   `https://www.advancedvlsi.com`.
6. Point the domain at the app and enable Hostinger's free SSL.
7. Deploy. After changing any environment variable, redeploy — they are read at boot.

Confirm HTTPS works before going further. Razorpay will not process payments on
a page served over plain HTTP.

### 9.5 Scheduled jobs

Vercel Cron doesn't exist here. Use hPanel → **Advanced** → **Cron Jobs** to hit your
reminder endpoint hourly:

```bash
0 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://www.advancedvlsi.com/api/cron/reminders
```

Check that header inside the route, or anyone who finds the URL can trigger your
email sending.

### 9.6 When to move up

Shared hosting is fine for your first few hundred students. If the site slows down when
a class is about to start, switch to a Hostinger **VPS** — same provider, just a plan
change, and your deployment process barely changes.

## Phase 10 — Go live (1 day)

Work through this before you accept a single rupee:

- [ ] Razorpay KYC approved, live keys added in hPanel, test-mode keys removed
- [ ] Made one **real** payment of ₹10 with your own card, end to end
- [ ] Confirmed that payment reached your bank account
- [ ] Webhook configured on the live domain and tested
- [ ] Logged in as a student and confirmed `/admin` is blocked
- [ ] Certificate download works, and the URL expires afterwards
- [ ] Google Workspace active on the host account; ran a **3-hour test Meet** with three
      devices joined to confirm no 60-minute cutoff
- [ ] Join link stays hidden until 15 minutes before class
- [ ] Meet **Quick access ON** and **Host management ON** — otherwise you admit thirty
      students one by one while the class waits
- [ ] Neon automatic backups enabled
- [ ] Site opens correctly on a phone — most of your students will be on mobile
- [ ] Excel export downloads and opens without error

---

## Phase 11 — After launch

**Weekly:** download the Excel export and keep a copy. It's your independent record if
anything ever goes wrong with the database.

**Watch for:** attendance dropping in week 3. It happens in almost every online cohort.
A WhatsApp group and a nudge from the teacher fixes more of it than any feature will.

**Add later, only when students ask:** recordings library, 1-on-1 mentor booking,
quizzes, mobile app, certificate verification page. Don't build these before launch.

---

## Running costs

| Item | Monthly |
|---|---|
| Google Workspace (1 host seat, Starter) | ~₹320 with GST |
| Domain | ~₹80 (₹1,000/year) |
| Hostinger | already paid |
| Neon, R2, Resend | ₹0 on free tiers |
| Razorpay | 2% + GST per transaction, no monthly fee |
| **Total fixed** | **~₹400/month** |

On a ₹19,999 course, Razorpay keeps roughly ₹470. Everything else is yours.

On Standard instead of Starter, that becomes roughly ₹1,350/month.

At 500+ students you'll outgrow the free tiers — budget around ₹3,000/month at that
point. That's a good problem.

---

## Scaling — what to do as registrations grow

You will not hit any of these limits in your first year. Bookmark this and come back
when the numbers say so.

### Where you are at each stage

| Students | What changes | What it costs |
|---|---|---|
| **0 – 500** | Nothing. Free tiers handle this comfortably. | ~₹1,350/month (Workspace only) |
| **500 – 5,000** | Neon paid tier, Hostinger VPS, R2 starts billing | ~₹4,000/month |
| **5,000 – 50,000** | Read replica, Redis cache, background job queue | ~₹15,000/month |
| **50,000+** | Dedicated database, CDN tuning, a real ops person | Talk to someone who does this full time |

### Do these three things now — they cost nothing and save you later

**1. Index the columns you filter on.** Without indexes, every "show me this student's
courses" query scans the whole table. At 200 rows nobody notices; at 200,000 the page
takes eight seconds. Add these to your Prisma schema today:

```prisma
model Enrollment {
  // ...
  @@index([userId])
  @@index([batchId])
  @@index([createdAt])
}

model Payment {
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Attendance {
  @@index([sessionId])
  @@index([userId])
}

model Session {
  @@index([batchId, startAt])
}
```

**2. Never write a query inside a loop.** This is the single most common way a working
site becomes a slow site:

```ts
// Wrong — 1 query for the list, then 1 more per student. 500 students = 501 queries.
const enrollments = await prisma.enrollment.findMany();
for (const e of enrollments) {
  const user = await prisma.user.findUnique({ where: { id: e.userId } });
}

// Right — one query, everything joined
const enrollments = await prisma.enrollment.findMany({
  include: { user: true, batch: { include: { course: true } } },
});
```

**3. Paginate every admin list.** Your Students table works fine at 50 rows. At 5,000 it
will freeze the browser. Use cursor pagination from the start:

```ts
const students = await prisma.user.findMany({
  where: { role: "STUDENT" },
  orderBy: { createdAt: "desc" },
  take: 50,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
});
```

### Do these when you cross 500 students

**Connection pooling.** Under load your app opens many database connections at once.
Neon's free tier allows a limited number, and past that new requests simply fail. Use
Neon's pooled connection string — it ends in `-pooler`:

```bash
DATABASE_URL="postgresql://...-pooler.neon.tech/advancedvlsi?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://....neon.tech/advancedvlsi?sslmode=require"   # migrations only
```

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

This one change prevents the most common "the site is down and I changed nothing" incident.

**Move the Excel export to the server.** Building the workbook in the browser is fine up
to a few thousand rows. Past that, generate it in an API route (section 10 of the backend
guide) so you aren't shipping the whole database to the admin's laptop.

**Cache the landing page.** Course listings barely change. Add
`export const revalidate = 300` to your public pages and Next.js serves a cached copy for
five minutes, taking that load off the database entirely.

### Do these when you cross 5,000 students

- **Read replica in Neon** — point analytics and Excel exports at it so a heavy report
  never slows down a student trying to pay.
- **Redis (Upstash)** for session data and the course catalog.
- **Background jobs (Inngest or Trigger.dev)** for reminder emails and exports, so a
  request never waits on them.
- **Recordings off Drive.** At 3 hours per class, recordings become your largest storage
  cost. Move them to Cloudflare Stream or unlisted YouTube.

### The scaling problem that isn't technical

At 500 students, one person cannot answer every "I can't find my link" message. Before you
need a bigger database, you will need either a support person or a good FAQ page and a
WhatsApp group per batch. Plan for that first — it arrives sooner than the database limits.

---

## Realistic timeline

| Week | Work |
|---|---|
| **1** | Razorpay KYC submitted, accounts created, project set up, database and auth working |
| **2** | Public pages and student dashboard |
| **3** | Admin panel — teachers, courses, sessions, certificates |
| **4** | Payments, file storage, Excel export, legal pages, deploy |
| **5** | Testing, KYC approval, first batch enrollment opens |

Five weeks is achievable if you work on it daily. Four is possible if you launch with
one course and skip everything optional.

---

## The three things that actually derail launches

1. **Starting Razorpay KYC late.** Everything else can be compressed. This can't.
2. **Committing `.env` to GitHub.** Check `.gitignore` before your next commit.
3. **Building all seven courses before launching one.** Launch with one. The feedback
   from twenty real students will change what you build next more than a month of
   guessing.
