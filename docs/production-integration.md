# Advanced VLSI — production backend

The app you're running stores everything in browser storage. This is the real backend it maps onto.

Stack: **Next.js 14 (App Router) + Prisma + PostgreSQL + Razorpay + NextAuth + Cloudflare R2**.

```bash
npx create-next-app@latest advancedvlsi-learn --typescript --tailwind --app
cd advancedvlsi-learn
npm i @prisma/client next-auth bcryptjs razorpay resend sharp
npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm i -D prisma
npx prisma init
```

Two panels come out of one codebase: `/dashboard/*` is the student panel, `/admin/*` is the admin panel, and middleware gates `/admin/*` on `role === "ADMIN"`.

## 1. Environment variables (`.env`)

```bash
DATABASE_URL="postgresql://user:pass@host:5432/advancedvlsi"

NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="https://learn.advancedvlsi.com"

# Razorpay dashboard -> Settings -> API Keys
RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"   # only the key id is exposed to the client
RAZORPAY_WEBHOOK_SECRET="the secret you set when creating the webhook"

RESEND_API_KEY="re_xxxxxxxx"                       # for class reminder emails
```

Never import `RAZORPAY_KEY_SECRET` into a client component.

---

## 2. Core database schema (`prisma/schema.prisma`)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { STUDENT TEACHER ADMIN }
enum PaymentStatus { CREATED CAPTURED FAILED REFUNDED }

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  phone        String?
  college      String?
  passwordHash String?
  role         Role     @default(STUDENT)
  createdAt    DateTime @default(now())

  enrollments  Enrollment[]
  payments     Payment[]
  attendance   Attendance[]
  teaching     Batch[]      @relation("BatchTeacher")
}

model Course {
  id          String  @id @default(cuid())
  slug        String  @unique
  title       String
  track       String              // electronics | ai | cse
  description String
  price       Int                 // store in paise: 2499900 = Rs 24,999
  weeks       Int
  level       String
  published   Boolean @default(false)

  modules Module[]
  batches Batch[]
}

model Module {
  id       String  @id @default(cuid())
  courseId String
  title    String
  order    Int
  course   Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons  Lesson[]
}

model Lesson {
  id       String @id @default(cuid())
  moduleId String
  title    String
  order    Int
  module   Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress LessonProgress[]
}

model Batch {
  id        String   @id @default(cuid())
  courseId  String
  teacherId String?
  name      String                // "VLSI DV - Batch 7"
  startDate DateTime
  endDate   DateTime
  capacity  Int      @default(30)
  zoomUrl   String?               // one recurring link serves the whole batch
  zoomId    String?

  course      Course       @relation(fields: [courseId], references: [id])
  teacher     User?        @relation("BatchTeacher", fields: [teacherId], references: [id])
  sessions    Session[]
  enrollments Enrollment[]
}

model Session {
  id          String   @id @default(cuid())
  batchId     String
  title       String
  startAt     DateTime
  durationMin Int      @default(90)
  joinUrl     String?               // falls back to the batch zoomUrl
  recordingUrl String?

  batch      Batch        @relation(fields: [batchId], references: [id], onDelete: Cascade)
  attendance Attendance[]
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  batchId   String
  paymentId String?  @unique
  createdAt DateTime @default(now())
  completedAt DateTime?
  certificateId String? @unique

  user     User             @relation(fields: [userId], references: [id])
  batch    Batch            @relation(fields: [batchId], references: [id])
  payment  Payment?         @relation(fields: [paymentId], references: [id])
  progress LessonProgress[]

  @@unique([userId, batchId])       // one student can join a batch only once
}

model LessonProgress {
  id           String   @id @default(cuid())
  enrollmentId String
  lessonId     String
  completedAt  DateTime @default(now())

  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  lesson     Lesson     @relation(fields: [lessonId], references: [id])

  @@unique([enrollmentId, lessonId])
}

model Payment {
  id            String        @id @default(cuid())
  userId        String
  batchId       String
  amount        Int                        // paise
  currency      String        @default("INR")
  rzpOrderId    String        @unique
  rzpPaymentId  String?
  rzpSignature  String?
  status        PaymentStatus @default(CREATED)
  coupon        String?
  createdAt     DateTime      @default(now())

  user       User        @relation(fields: [userId], references: [id])
  enrollment Enrollment?
}

model Attendance {
  id        String   @id @default(cuid())
  sessionId String
  userId    String
  joinedAt  DateTime @default(now())
  minutes   Int      @default(0)

  session Session @relation(fields: [sessionId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([sessionId, userId])
}
```

```bash
npx prisma migrate dev --name init
```

---

## 3. Teachers and photo upload

Teachers are a first-class model — the admin creates them, assigns them to courses, and uploads a photo.

```prisma
model Teacher {
  id         String   @id @default(cuid())
  name       String
  title      String                  // "Senior Verification Engineer"
  experience String?                 // "9 years"
  expertise  String[]                // ["UVM", "SystemVerilog"]
  bio        String?
  photoKey   String?                 // R2 object key, null = show initials
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())

  courses Course[]
}
```

Add `teacherId String?` and the relation to `Course`, plus `Course.published Boolean @default(false)` so you can build a course before it goes live, and `Course.thumbnailKey String?` for the card artwork.

**Course thumbnails** use the same upload route as teacher photos, only with a 16:9 crop:

```ts
const buf = await sharp(Buffer.from(await file.arrayBuffer()))
  .resize(1280, 720, { fit: "cover", position: "attention" })
  .jpeg({ quality: 82 })
  .toBuffer();
const key = `courses/${courseId}.jpg`;
```

Serve both from the public bucket. Append `?v=<updatedAt>` so a replaced image is not served from the CDN cache.

**Photo upload.** Resize on the server with `sharp` — never store the raw phone photo:

```ts
// app/api/admin/teachers/[id]/photo/route.ts
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const form = await req.formData();
  const file = form.get("photo") as File;
  if (!file?.type?.startsWith("image/"))
    return Response.json({ error: "Upload a PNG or JPG" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024)
    return Response.json({ error: "Image must be under 10 MB" }, { status: 400 });

  // Square crop, 400px, JPEG — a 6 MB phone photo becomes about 50 KB
  const buf = await sharp(Buffer.from(await file.arrayBuffer()))
    .resize(400, 400, { fit: "cover", position: "attention" })
    .jpeg({ quality: 85 })
    .toBuffer();

  const key = `teachers/${params.id}.jpg`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!, Key: key, Body: buf, ContentType: "image/jpeg",
  }));

  await prisma.teacher.update({ where: { id: params.id }, data: { photoKey: key } });
  return Response.json({ ok: true, photoKey: key });
}
```

Teacher photos are public content, so serve them from a **public** bucket or a CDN path (`https://cdn.advancedvlsi.com/teachers/<id>.jpg`) — no signed URL needed. Keep certificates in a **separate private bucket**; those must never be publicly readable.

Append a cache-busting version (`?v=<updatedAt>`) to the photo URL, otherwise a replaced photo keeps showing the old one from the CDN cache.

## 4. Razorpay — creating the order

`app/api/payments/order/route.ts`

```ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const COUPONS: Record<string, number> = { AVLSI20: 20, EARLYBIRD: 15, STUDENT10: 10 };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { batchId, coupon } = await req.json();

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { course: true, _count: { select: { enrollments: true } } },
  });
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  if (batch._count.enrollments >= batch.capacity)
    return NextResponse.json({ error: "This batch is full" }, { status: 409 });

  const already = await prisma.enrollment.findUnique({
    where: { userId_batchId: { userId: session.user.id, batchId } },
  });
  if (already) return NextResponse.json({ error: "You are already enrolled" }, { status: 409 });

  // Always compute the amount on the server. Never trust an amount sent by the client.
  const discount = coupon && COUPONS[coupon] ? COUPONS[coupon] : 0;
  const base = Math.round(batch.course.price * (1 - discount / 100));
  const amount = Math.round(base * 1.18);          // 18% GST, in paise

  const order = await rzp.orders.create({
    amount, currency: "INR",
    receipt: `enr_${session.user.id.slice(0, 8)}_${Date.now()}`,
    notes: { batchId, userId: session.user.id, course: batch.course.title },
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id, batchId, amount,
      rzpOrderId: order.id, coupon: coupon || null, status: "CREATED",
    },
  });

  return NextResponse.json({ orderId: order.id, amount, keyId: process.env.RAZORPAY_KEY_ID });
}
```

## 5. Razorpay — opening checkout (client)

```tsx
"use client";
export function EnrollButton({ batchId, coupon }: { batchId: string; coupon?: string }) {
  async function pay() {
    // Load the Razorpay script once
    if (!(window as any).Razorpay) {
      await new Promise((res) => {
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = res; document.body.appendChild(s);
      });
    }

    const r = await fetch("/api/payments/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId, coupon }),
    });
    const data = await r.json();
    if (!r.ok) return alert(data.error);

    new (window as any).Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: "INR",
      name: "Advanced VLSI",
      description: "Course enrollment",
      order_id: data.orderId,
      handler: async (resp: any) => {
        const v = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resp),
        });
        if (v.ok) window.location.href = "/dashboard?enrolled=1";
        else alert("We could not verify that payment. Please contact support.");
      },
      theme: { color: "#0A5C8A" },
    }).open();
  }

  return <button onClick={pay} className="btn btn-p">Enroll now</button>;
}
```

## 6. Razorpay — verifying the signature

`app/api/payments/verify/route.ts`

```ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  // This signature check is the actual security boundary. Without it anyone can forge an enrollment.
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    await prisma.payment.updateMany({
      where: { rzpOrderId: razorpay_order_id }, data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { rzpOrderId: razorpay_order_id },
    data: { rzpPaymentId: razorpay_payment_id, rzpSignature: razorpay_signature, status: "CAPTURED" },
  });

  await prisma.enrollment.create({
    data: { userId: payment.userId, batchId: payment.batchId, paymentId: payment.id },
  });

  return NextResponse.json({ ok: true });
}
```

**Add the webhook too.** If a student closes the browser right after paying, `verify` never runs and you have taken money without creating an enrollment. Point a `payment.captured` webhook at `https://learn.advancedvlsi.com/api/payments/webhook` and run the same enrollment logic there, using `upsert` so it cannot double-create.

---

## 7. Google Meet links and attendance

Store the link on the batch, not on every session. Create **one Google Meet link per batch**
and reuse it for every class in that batch — the link never expires.

```prisma
model Batch {
  // ...
  meetUrl String?        // https://meet.google.com/abc-defg-hij
}

model Session {
  // ...
  meetUrl String?        // optional override; falls back to batch.meetUrl
}
```

**Creating the link.** Two options:

1. **Manual (start here).** Go to meet.google.com, click "New meeting" → "Create a meeting
   for later", copy the link, paste it into the batch. Takes ten seconds and needs no code.
2. **Automatic (later).** The Google Calendar API creates a Meet link when you insert an
   event with `conferenceDataVersion=1`. This also puts the class on the teacher's calendar
   and emails invites to students:

```ts
const event = await calendar.events.insert({
  calendarId: "primary",
  conferenceDataVersion: 1,
  requestBody: {
    summary: `${course.title} — ${session.title}`,
    start: { dateTime: session.startAt.toISOString(), timeZone: "Asia/Kolkata" },
    end:   { dateTime: endAt.toISOString(),           timeZone: "Asia/Kolkata" },
    attendees: enrolledStudents.map((s) => ({ email: s.email })),
    conferenceData: {
      createRequest: { requestId: session.id, conferenceSolutionKey: { type: "hangoutsMeet" } },
    },
  },
});
const meetUrl = event.data.hangoutLink;   // save this on the session
```

**Protect the link.** Never render it in the page HTML. Route students through an endpoint
that checks enrollment and the time window, and records attendance on the way past:

```ts
// app/api/sessions/[id]/join/route.ts
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const auth_ = await auth();
  const s = await prisma.session.findUnique({
    where: { id: params.id },
    include: { batch: { include: { enrollments: true } } },
  });
  if (!s) return new Response("Not found", { status: 404 });

  const enrolled = s.batch.enrollments.some((e) => e.userId === auth_?.user?.id);
  if (!enrolled) return new Response("Not enrolled", { status: 403 });

  const open  = s.startAt.getTime() - 15 * 60_000;
  const close = s.startAt.getTime() + s.durationMin * 60_000;
  const now = Date.now();
  if (now < open || now > close) return new Response("This class is not open yet", { status: 403 });

  await prisma.attendance.upsert({
    where: { sessionId_userId: { sessionId: s.id, userId: auth_!.user!.id } },
    create: { sessionId: s.id, userId: auth_!.user!.id },
    update: {},
  });

  return Response.redirect(s.meetUrl ?? s.batch.meetUrl!);   // attendance recorded on the way through
}
```

Link to `/api/sessions/{id}/join` from the frontend and you get attendance for free.

**Two Google Meet settings that matter.** In Google Calendar, open the event's Meet settings:

- Turn **Host management** on, so students can't mute or remove each other.
- Leave **Quick access** on. With it off, every student who joins sits in a waiting room
  the teacher must admit one by one — unworkable with thirty students.

Students do **not** need a Workspace account. Any Gmail address can join. Only the teacher
hosting the class needs a paid seat.

## 8. Certificates — admin uploads, student downloads

The system does not generate certificates. An admin uploads a file per student and course; the student only gets a download.

Use a dedicated model rather than a field on `Enrollment`:

```prisma
model Certificate {
  id           String   @id @default(cuid())
  userId       String
  courseId     String
  certNo       String   @unique          // QSL-2026-000148
  fileKey      String                    // private bucket object key
  fileName     String
  mimeType     String
  sizeBytes    Int
  uploadedById String
  uploadedAt   DateTime @default(now())

  user       User   @relation(fields: [userId],  references: [id])
  course     Course @relation(fields: [courseId], references: [id])
  uploadedBy User   @relation("CertUploader", fields: [uploadedById], references: [id])

  @@unique([userId, courseId])            // one certificate per student per course
}
```

Do not put the file in the database. Store it in object storage (Cloudflare R2 or AWS S3) and keep that bucket **private**.

**Admin upload:**

```ts
// app/api/admin/certificates/route.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File;
  const userId = form.get("userId") as string;
  const courseId = form.get("courseId") as string;
  const certNo = (form.get("certNo") as string) || `QSL-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type))
    return Response.json({ error: "PDF, PNG or JPG only" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024)
    return Response.json({ error: "File must be under 8 MB" }, { status: 400 });

  // Verify the student is actually enrolled in this course
  const enrolled = await prisma.enrollment.findFirst({
    where: { userId, batch: { courseId } },
  });
  if (!enrolled) return Response.json({ error: "Student is not enrolled in this course" }, { status: 400 });

  const key = `certificates/${userId}/${courseId}/${crypto.randomUUID()}-${file.name}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!, Key: key,
    Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type,
  }));

  const cert = await prisma.certificate.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, certNo, fileKey: key, fileName: file.name,
              mimeType: file.type, sizeBytes: file.size, uploadedById: session.user.id },
    update: { certNo, fileKey: key, fileName: file.name,
              mimeType: file.type, sizeBytes: file.size, uploadedById: session.user.id },
  });

  // Email the student that their certificate is ready
  return Response.json({ ok: true, cert });
}
```

**Student download** — never hand out a direct bucket URL. Issue a short-lived signed URL:

```ts
// app/api/certificates/[id]/download/route.ts
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const cert = await prisma.certificate.findUnique({ where: { id: params.id } });
  if (!cert) return new Response("Not found", { status: 404 });

  // Students can only fetch their own; admins can fetch any
  if (cert.userId !== session?.user?.id && session?.user?.role !== "ADMIN")
    return new Response("Forbidden", { status: 403 });

  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: process.env.R2_BUCKET!, Key: cert.fileKey,
    ResponseContentDisposition: `attachment; filename="${cert.fileName}"`,
  }), { expiresIn: 300 });          // expires in 5 minutes

  return Response.redirect(url);
}
```

**Public verification page** (`/verify/[certNo]`): show only the student name, course and issue date — never the file. A recruiter can confirm a certificate number is real without being able to download anyone else's certificate.

## 9. Class reminder emails

Run a Vercel cron (`vercel.json`) every hour:

```json
{ "crons": [{ "path": "/api/cron/reminders", "schedule": "0 * * * *" }] }
```

The route finds sessions starting in the next 60-90 minutes, emails the enrolled students via Resend, and sets a `reminderSentAt` flag on the session so nobody gets the same reminder twice.

---

## 10. Excel export

The admin export builds the workbook in the browser with SheetJS, which is fine up to a few thousand rows. Past that, generate it on the server so you are not shipping the whole database to the client:

```ts
// app/api/admin/export/route.ts
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const courses = await prisma.course.findMany({
    include: {
      teacher: true,
      batches: {
        include: {
          enrollments: { include: { user: true, payment: true, progress: true } },
          course: { include: { modules: { include: { lessons: true } } } },
        },
      },
    },
  });

  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summary = courses.map((c) => {
    const enrs = c.batches.flatMap((b) => b.enrollments);
    return {
      Course: c.title,
      Teacher: c.teacher?.name ?? "Unassigned",
      Enrolled: enrs.length,
      "Revenue (INR)": enrs.reduce((a, e) => a + (e.payment?.amount ?? 0), 0) / 100,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary");

  // One sheet per course
  for (const c of courses) {
    const totalLessons = c.batches[0]?.course.modules.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
    const rows = c.batches.flatMap((b) =>
      b.enrollments.map((e) => ({
        Student: e.user.name,
        Email: e.user.email,
        Phone: e.user.phone ?? "",
        Batch: b.name,
        "Enrolled on": e.createdAt.toISOString().slice(0, 10),
        "Progress %": totalLessons ? Math.round((e.progress.length / totalLessons) * 100) : 0,
        "Paid (INR)": (e.payment?.amount ?? 0) / 100,
      }))
    );
    // Sheet names are capped at 31 characters and cannot contain : \ / ? * [ ]
    const name = c.title.replace(/[:\\/?*[\]]/g, "-").slice(0, 31);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: "No enrollments" }]), name);
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="advancedvlsi-report-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
```

Amounts are stored in paise, so divide by 100 on the way out — otherwise every revenue figure in the sheet is a hundred times too large.

## 10. Pre-launch checklist

- [ ] Razorpay KYC complete — **start today, it takes 3-7 days**
- [ ] Webhook configured, and one full payment tested in test mode
- [ ] A different `NEXTAUTH_SECRET` in production
- [ ] Passwords hashed with `bcrypt`, never stored in plain text
- [ ] `/admin/*` gated by middleware on `role === "ADMIN"`
- [ ] Automated database backups enabled
- [ ] Refund policy page — Razorpay requires it
- [ ] Terms, Privacy and Contact pages — mandatory for gateway approval
- [ ] Certificate bucket private, teacher-photo bucket public
