import React, { useState, useEffect, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Cpu, Brain, Code2, Calendar, Award, BookOpen, Settings, LogOut, Check, Lock,
  CreditCard, Video, Plus, Users, Download, ChevronRight, X, ArrowLeft, Clock,
  Trash2, Upload, FileCheck, GraduationCap, Pencil, TrendingUp, Copy, Link2,
  FileSpreadsheet, Image as ImageIcon
} from "lucide-react";

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
const C = {
  ink: "#22201D",
  ink2: "#46433C",
  muted: "#6E6A61",
  panel: "#F1F0EA",
  surface: "#FFFFFF",
  line: "#DAD7CC",
  brand: "#66693B",
  brandDeep: "#4E5130",
  led: "#D62828",
  brass: "#9A7B18",
  olive: "#8A8D56",
  oliveLight: "#B9BC85",
  ok: "#0F7B5A",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.ql * { box-sizing: border-box; }
.ql { font-family: 'IBM Plex Sans', system-ui, sans-serif; color: ${C.ink}; background: ${C.panel}; min-height: 100vh; -webkit-font-smoothing: antialiased; }
.ql h1,.ql h2,.ql h3,.ql h4,.ql .disp { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.02em; margin: 0; }
.ql p { margin: 0; }
.ql button { font-family: inherit; cursor: pointer; border: 0; background: none; color: inherit; }
.ql input, .ql select, .ql textarea { font-family: inherit; font-size: 15px; width: 100%; padding: 10px 13px; border: 1px solid ${C.line}; border-radius: 7px; background: #fff; color: ${C.ink}; }
.ql textarea { resize: vertical; line-height: 1.5; }
.ql input:focus, .ql select:focus, .ql textarea:focus { outline: 2px solid ${C.brand}; outline-offset: 1px; border-color: ${C.brand}; }
.ql button:focus-visible, .ql a:focus-visible { outline: 2px solid ${C.brand}; outline-offset: 2px; }
.ql a { color: inherit; text-decoration: none; }
.ql input:disabled, .ql select:disabled { background: #F2F1EA; color: ${C.muted}; }

.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 19px; border-radius:7px; font-weight:600; font-size:15px; transition: background .15s, border-color .15s; }
.btn-p { background:${C.brand}; color:#fff; }
.btn-p:hover { background:${C.brandDeep}; }
.btn-p:disabled { background:#B5B2A6; cursor:not-allowed; }
.btn-o { border:1px solid ${C.line}; background:#fff; color:${C.ink}; }
.btn-o:hover { border-color:${C.ink2}; }
.btn-sm { padding:7px 13px; font-size:13.5px; border-radius:6px; }

.card { background:${C.surface}; border:1px solid ${C.line}; border-radius:10px; }
.lab { font-size:12.5px; color:${C.muted}; font-weight:500; }
.hr { height:1px; background:${C.line}; border:0; }

.tick { position:relative; padding-left:18px; }
.tick:before { content:''; position:absolute; left:0; top:4px; bottom:4px; width:3px; border-radius:2px; background:${C.line}; }
.tick-live:before { background:${C.led}; }
.tick-done:before { background:${C.ok}; }

.led { width:8px; height:8px; border-radius:50%; background:${C.led}; display:inline-block; box-shadow:0 0 0 0 rgba(214,40,40,.55); animation: pulse 1.9s infinite; }
@keyframes pulse { 70% { box-shadow:0 0 0 8px rgba(214,40,40,0); } 100% { box-shadow:0 0 0 0 rgba(214,40,40,0); } }
@media (prefers-reduced-motion: reduce) { .led { animation:none; } }

.seg { display:flex; gap:3px; }
.seg i { flex:1; height:7px; border-radius:2px; background:#E0DED2; }
.seg i.on { background:${C.brand}; }

.grid { display:grid; gap:16px; }
.sheet { position:fixed; inset:0; background:rgba(34,32,29,.55); display:flex; align-items:center; justify-content:center; padding:18px; z-index:60; }
.sheetc { background:#fff; border-radius:12px; width:100%; max-width:460px; max-height:92vh; overflow:auto; }

.side { width:210px; flex-shrink:0; }
.snav { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:7px; font-size:14.5px; font-weight:500; color:${C.ink2}; width:100%; text-align:left; }
.snav:hover { background:#E7E5DA; }
.snav.on { background:${C.ink}; color:#fff; }

.tag { display:inline-block; padding:3px 9px; border-radius:20px; font-size:12px; font-weight:600; }
table.t { width:100%; border-collapse:collapse; font-size:14px; }
table.t th { text-align:left; font-weight:600; color:${C.muted}; font-size:12.5px; padding:9px 12px; border-bottom:1px solid ${C.line}; }
table.t td { padding:11px 12px; border-bottom:1px solid #EDEBE2; vertical-align:middle; }

@media (max-width: 820px) {
  .side { width:100%; }
  .shell { flex-direction:column; }
  .snavwrap { display:flex !important; overflow-x:auto; gap:6px; padding-bottom:6px; }
  .snav { white-space:nowrap; width:auto; }
  .hide-sm { display:none !important; }
}
`;

/* ================================================================== */
/*  SEED DATA                                                          */
/* ================================================================== */
const TRACKS = {
  electronics: { name: "Electronics & VLSI", icon: Cpu },
  ai: { name: "AI & Data", icon: Brain },
  cse: { name: "CSE & Software", icon: Code2 },
};

const SEED_TEACHERS = [
  { id: "t1", name: "Ananya Ravi", title: "Senior Verification Engineer", experience: "9 years", expertise: ["SystemVerilog", "UVM", "Coverage closure"], bio: "Works on SoC verification for a semiconductor company. Has taped out four chips and mentors students moving into the verification industry.", photo: false },
  { id: "t2", name: "Karthik Menon", title: "ASIC Design Engineer", experience: "7 years", expertise: ["Verilog", "Synthesis", "FPGA"], bio: "Designs RTL blocks for networking chips. Teaches beginners how to write synthesizable code that a real tool will accept.", photo: false },
  { id: "t3", name: "Faizan Ahmed", title: "Firmware Lead", experience: "8 years", expertise: ["ARM Cortex-M", "FreeRTOS", "IoT"], bio: "Builds production firmware for connected devices. Strong believer in learning with the board in front of you, not just a simulator.", photo: false },
  { id: "t4", name: "Sneha Deshmukh", title: "Machine Learning Engineer", experience: "6 years", expertise: ["Python", "Deep learning", "MLOps"], bio: "Ships ML models to production at a product company. Focuses on the parts of ML that courses usually skip: evaluation and deployment.", photo: false },
  { id: "t5", name: "Rohit Bansal", title: "AI Solutions Architect", experience: "10 years", expertise: ["LLMs", "RAG", "Agents"], bio: "Designs LLM systems for enterprise customers. Teaches how to make these systems reliable, not just impressive in a demo.", photo: false },
  { id: "t6", name: "Priyanka Nair", title: "Full Stack Lead", experience: "7 years", expertise: ["React", "Node.js", "System design"], bio: "Leads a product engineering team. Every student leaves her course with three deployed projects and a clean GitHub profile.", photo: false },
  { id: "t7", name: "Aditya Verma", title: "SDE-2, product company", experience: "5 years", expertise: ["DSA", "Interview prep", "System design"], bio: "Has taken over 200 mock interviews. Teaches problem patterns rather than problem lists.", photo: false },
];

const mod = (title, lessons) => ({ title, lessons });

const SEED_COURSES = [
  {
    id: "vlsi-dv", title: "VLSI Design & Verification", track: "electronics", teacherId: "t1",
    price: 24999, weeks: 12, hoursPerWeek: 8, level: "Intermediate", seats: 30,
    schedule: "Mon / Wed / Fri · 8:00 PM IST", published: true,
    blurb: "Go from RTL to full functional verification. Write UVM testbenches, close coverage, and verify a complete IP block you can put in your portfolio.",
    outcomes: ["Build an industry-grade testbench in SystemVerilog and UVM", "Run coverage-driven verification and write assertions", "Produce a verification plan for a real SoC sub-block"],
    syllabus: [
      mod("Digital design refresher", ["CMOS and logic families", "FSM design patterns", "Timing basics: setup, hold, skew"]),
      mod("SystemVerilog for design", ["Data types and interfaces", "Always blocks and synthesis rules", "Parameterised RTL"]),
      mod("Verification methodology", ["Testbench architecture", "Constrained random stimulus", "Functional coverage"]),
      mod("UVM deep dive", ["Agents, drivers, monitors", "Sequences and virtual sequencers", "Scoreboard and RAL"]),
      mod("Capstone project", ["Verify an APB protocol IP", "Coverage closure report", "Portfolio review and mock interview"]),
    ],
  },
  {
    id: "rtl-verilog", title: "RTL Design with Verilog & SystemVerilog", track: "electronics", teacherId: "t2",
    price: 18999, weeks: 8, hoursPerWeek: 6, level: "Beginner", seats: 40,
    schedule: "Tue / Thu · 8:30 PM IST", published: true,
    blurb: "Start from Verilog basics, learn to write synthesizable RTL, and see your own design running on an FPGA board.",
    outcomes: ["Write RTL that synthesis tools accept", "Read and fix timing reports", "Deploy a working design to an FPGA"],
    syllabus: [
      mod("Verilog fundamentals", ["Modules and ports", "Blocking vs non-blocking", "Simulation basics"]),
      mod("Combinational and sequential logic", ["Adders, muxes, decoders", "Counters and shift registers", "FSM coding styles"]),
      mod("Synthesis and timing", ["Synthesis-friendly code", "Static timing analysis", "Clock domain crossing"]),
      mod("FPGA project", ["UART transmitter design", "Board bring-up", "Debugging with a logic analyzer"]),
    ],
  },
  {
    id: "embedded-iot", title: "Embedded Systems & IoT with ARM Cortex-M", track: "electronics", teacherId: "t3",
    price: 16999, weeks: 10, hoursPerWeek: 6, level: "Beginner", seats: 35,
    schedule: "Sat / Sun · 11:00 AM IST", published: true,
    blurb: "Bare-metal firmware, peripheral drivers, an RTOS, and a connected IoT device — built with hardware in your hands.",
    outcomes: ["Write register-level peripheral drivers", "Design tasks correctly under FreeRTOS", "Ship an MQTT-based IoT device"],
    syllabus: [
      mod("Cortex-M architecture", ["Memory map and startup code", "Interrupts and the NVIC", "Toolchain setup"]),
      mod("Peripheral drivers", ["GPIO, UART, SPI, I2C", "Timers and PWM", "ADC and sensor interfacing"]),
      mod("RTOS concepts", ["Tasks and scheduling", "Queues, semaphores, mutexes", "Debugging race conditions"]),
      mod("IoT capstone", ["WiFi module integration", "MQTT telemetry", "Dashboard and OTA basics"]),
    ],
  },
  {
    id: "applied-ai", title: "Applied AI & Machine Learning", track: "ai", teacherId: "t4",
    price: 22999, weeks: 12, hoursPerWeek: 8, level: "Beginner", seats: 45,
    schedule: "Mon / Wed / Sat · 8:00 PM IST", published: true,
    blurb: "From the maths to a deployed model. Regression, trees, neural networks, and a live ML service you can show a recruiter.",
    outcomes: ["Build an end-to-end ML pipeline", "Evaluate and tune models properly", "Deploy a model behind a FastAPI service"],
    syllabus: [
      mod("Foundations", ["Python for ML", "NumPy and Pandas workflows", "The statistics you actually use"]),
      mod("Classical ML", ["Regression and regularisation", "Trees, random forests, boosting", "Feature engineering"]),
      mod("Deep learning", ["How neural networks train", "CNNs for vision", "Transfer learning"]),
      mod("MLOps basics", ["Experiment tracking", "Model serving with FastAPI", "Monitoring and drift"]),
      mod("Capstone", ["Choosing a problem", "Build and evaluate", "Deploy and demo day"]),
    ],
  },
  {
    id: "genai-llm", title: "Generative AI & LLM Engineering", track: "ai", teacherId: "t5",
    price: 27999, weeks: 10, hoursPerWeek: 8, level: "Advanced", seats: 25,
    schedule: "Tue / Thu / Sun · 9:00 PM IST", published: true,
    blurb: "RAG systems, agents, fine-tuning and evaluation — the full stack for building LLM applications that survive real users.",
    outcomes: ["Build a production RAG pipeline", "Design agent and tool-calling systems", "Set up an LLM evaluation framework"],
    syllabus: [
      mod("LLM fundamentals", ["Transformer intuition", "Tokenisation and context", "Prompt design patterns"]),
      mod("RAG systems", ["Chunking strategies", "Vector databases", "Tuning retrieval quality"]),
      mod("Agents and tools", ["Tool calling", "Multi-step planning", "Guardrails and failure handling"]),
      mod("Fine-tuning and evaluation", ["LoRA fine-tuning", "Building eval datasets", "Cost and latency optimisation"]),
      mod("Capstone", ["Build a domain assistant", "Evaluate and iterate", "Deploy and demo"]),
    ],
  },
  {
    id: "fullstack", title: "Full Stack Development (MERN)", track: "cse", teacherId: "t6",
    price: 19999, weeks: 14, hoursPerWeek: 8, level: "Beginner", seats: 50,
    schedule: "Mon / Wed / Fri · 9:00 PM IST", published: true,
    blurb: "React, Node and MongoDB, with three deployed projects. Authentication and payments included, because every real product needs them.",
    outcomes: ["Build production React applications", "Write REST APIs with real authentication", "Deploy and monitor on the cloud"],
    syllabus: [
      mod("Web foundations", ["HTML, CSS, responsive layout", "JavaScript deep dive", "Git workflow"]),
      mod("Frontend with React", ["Components and state", "Routing and forms", "API integration"]),
      mod("Backend with Node", ["Express APIs", "MongoDB data modelling", "JWT authentication"]),
      mod("Going to production", ["Payment gateway integration", "Deployment and CI", "Performance basics"]),
      mod("Capstone", ["Full product build", "Code review", "Portfolio polish"]),
    ],
  },
  {
    id: "dsa-placement", title: "DSA & Placement Bootcamp", track: "cse", teacherId: "t7",
    price: 12999, weeks: 8, hoursPerWeek: 10, level: "Intermediate", seats: 60,
    schedule: "Daily · 7:00 AM IST", published: true,
    blurb: "300+ curated problems, weekly mock interviews, and resume and HR round preparation. Built for placement season.",
    outcomes: ["Solve problems by pattern, not by memory", "Handle basic system design rounds", "Walk in with an interview-ready resume"],
    syllabus: [
      mod("Arrays and strings", ["Two pointers", "Sliding window", "Prefix sums"]),
      mod("Trees and graphs", ["Traversals", "BFS and DFS patterns", "Shortest paths"]),
      mod("DP and greedy", ["1D and 2D DP", "Greedy proofs", "Common interview DPs"]),
      mod("Interview preparation", ["System design intro", "Mock interviews", "Resume and HR round"]),
    ],
  },
];

/* Internship programs — 6 months, hands-on project work, certificate at the end.
   Same data shape as a course, marked with type "internship". */
const SEED_INTERNSHIPS = [
  {
    id: "intern-vlsi", type: "internship", title: "VLSI Design Internship", track: "electronics",
    teacherId: "t1", price: 999, months: 6, weeks: 26, hoursPerWeek: 10,
    level: "Beginner to Intermediate", seats: 50, published: true,
    schedule: "Sat / Sun · 11:00 AM IST + weekday mentor reviews",
    blurb: "Six months of guided VLSI work on a real design flow. You finish with a completed project, a mentor review trail, and an internship certificate.",
    outcomes: [
      "Work through a complete RTL-to-verification flow on a live project",
      "Weekly one-to-one reviews with a practising design engineer",
      "Internship completion certificate and a project you can defend in interviews",
    ],
    syllabus: [
      mod("Month 1 — Foundations", ["Digital design refresher", "Verilog coding standards", "Toolchain and simulator setup"]),
      mod("Month 2 — Your project brief", ["Pick a design block", "Write the specification", "Micro-architecture review"]),
      mod("Month 3-4 — Build", ["RTL implementation", "Weekly mentor code review", "Lint and synthesis clean-up"]),
      mod("Month 5 — Verify", ["Testbench development", "Coverage closure", "Bug triage and fixes"]),
      mod("Month 6 — Wrap up", ["Documentation and report", "Final project defence", "Interview preparation"]),
    ],
  },
  {
    id: "intern-ai", type: "internship", title: "AI & Machine Learning Internship", track: "ai",
    teacherId: "t4", price: 999, months: 6, weeks: 26, hoursPerWeek: 10,
    level: "Beginner to Intermediate", seats: 50, published: true,
    schedule: "Sat / Sun · 2:00 PM IST + weekday mentor reviews",
    blurb: "Six months building and shipping a real ML product, from messy data to a deployed service, with a working engineer reviewing your code every week.",
    outcomes: [
      "Ship one ML service end to end, from dataset to deployed API",
      "Weekly code reviews and experiment critiques from a practising ML engineer",
      "Internship completion certificate and a deployed project link for your resume",
    ],
    syllabus: [
      mod("Month 1 — Foundations", ["Python and data handling", "Statistics that matter", "Git and project setup"]),
      mod("Month 2 — Problem and data", ["Choose your problem", "Data collection and cleaning", "Baseline model"]),
      mod("Month 3-4 — Modelling", ["Feature engineering", "Model selection and tuning", "Weekly experiment reviews"]),
      mod("Month 5 — Deployment", ["FastAPI service", "Monitoring and logging", "Load and error handling"]),
      mod("Month 6 — Wrap up", ["Write-up and documentation", "Final project defence", "Interview preparation"]),
    ],
  },
  {
    id: "intern-fullstack", type: "internship", title: "Software Development Internship", track: "cse",
    teacherId: "t6", price: 999, months: 6, weeks: 26, hoursPerWeek: 10,
    level: "Beginner to Intermediate", seats: 50, published: true,
    schedule: "Sat / Sun · 5:00 PM IST + weekday mentor reviews",
    blurb: "Six months working like a junior developer on a real product — tickets, pull requests, code review and deployment, not tutorial projects.",
    outcomes: [
      "Build and deploy a full product with authentication and payments",
      "Work through real pull-request reviews from a senior developer",
      "Internship completion certificate and a clean GitHub profile",
    ],
    syllabus: [
      mod("Month 1 — Foundations", ["JavaScript and React essentials", "Git workflow and branching", "Reading an existing codebase"]),
      mod("Month 2 — Your first tickets", ["Small features and bug fixes", "Writing a good pull request", "Responding to review comments"]),
      mod("Month 3-4 — Feature ownership", ["Design your own feature", "Backend API and database", "Testing and edge cases"]),
      mod("Month 5 — Production", ["Deployment and CI", "Monitoring and error tracking", "Performance basics"]),
      mod("Month 6 — Wrap up", ["Documentation", "Final project defence", "Portfolio and interview preparation"]),
    ],
  },
];

const SEED_PROGRAMS = [
  ...SEED_COURSES.map((c) => ({ ...c, type: "course" })),
  ...SEED_INTERNSHIPS,
];

const mkTime = (dayOffset, h, m) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

const SEED_SESSIONS = [
  { id: "s1", courseId: "vlsi-dv", title: "UVM sequences and virtual sequencers", start: Date.now() + 6 * 60000, dur: 180, meetUrl: "https://meet.google.com/kqm-avdr-xyz" },
  { id: "s2", courseId: "vlsi-dv", title: "Scoreboard and RAL basics", start: mkTime(2, 20, 0), dur: 180, meetUrl: "https://meet.google.com/pfn-bxtc-hqa" },
  { id: "s3", courseId: "applied-ai", title: "Transfer learning, hands on", start: mkTime(0, 20, 0), dur: 150, meetUrl: "https://meet.google.com/rwd-jmoe-tzb" },
  { id: "s4", courseId: "applied-ai", title: "Model serving with FastAPI", start: mkTime(3, 20, 0), dur: 150, meetUrl: "https://meet.google.com/cvg-nkla-ypd" },
  { id: "s5", courseId: "genai-llm", title: "Tuning retrieval quality", start: mkTime(1, 21, 0), dur: 180, meetUrl: "https://meet.google.com/xhb-tqre-mwn" },
  { id: "s6", courseId: "dsa-placement", title: "Sliding window patterns", start: mkTime(1, 7, 0), dur: 120, meetUrl: "https://meet.google.com/jdl-vcsp-agk" },
  { id: "s7", courseId: "fullstack", title: "JWT authentication end to end", start: mkTime(2, 21, 0), dur: 150, meetUrl: "https://meet.google.com/znt-ferb-qih" },
  { id: "s8", courseId: "rtl-verilog", title: "UART transmitter design", start: mkTime(1, 20, 30), dur: 180, meetUrl: "https://meet.google.com/muy-abkl-rvc" },
  { id: "s9", courseId: "embedded-iot", title: "I2C sensor interfacing", start: mkTime(4, 11, 0), dur: 180, meetUrl: "https://meet.google.com/tcp-hswn-odj" },
  { id: "s10", courseId: "intern-vlsi", title: "Month 1 kickoff and project briefs", start: mkTime(1, 11, 0), dur: 180, meetUrl: "https://meet.google.com/wqe-nzlf-bmt" },
  { id: "s11", courseId: "intern-vlsi", title: "Weekly mentor review", start: mkTime(5, 11, 0), dur: 120, meetUrl: "https://meet.google.com/wqe-nzlf-bmt" },
  { id: "s12", courseId: "intern-ai", title: "Month 1 kickoff and dataset selection", start: mkTime(1, 14, 0), dur: 180, meetUrl: "https://meet.google.com/hgb-rmtc-vlo" },
  { id: "s13", courseId: "intern-fullstack", title: "Month 1 kickoff and repo walkthrough", start: mkTime(2, 17, 0), dur: 180, meetUrl: "https://meet.google.com/ydk-qspa-cfn" },
];

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */
const inr = (n) => "₹" + n.toLocaleString("en-IN");
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtSize = (b) => (b < 1048576 ? Math.round(b / 1024) + " KB" : (b / 1048576).toFixed(1) + " MB");

function fmtDay(ts) {
  const d = new Date(ts), t = new Date(), y = new Date(Date.now() + 864e5);
  if (d.toDateString() === t.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
const fmtTime = (ts) => new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtFullDate = (ts) => new Date(ts).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const endOf = (s) => s.start + s.dur * 60000;
const fmtRange = (s) => `${fmtTime(s.start)} – ${fmtTime(endOf(s))}`;

function fmtDur(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${h}h ${m}m`;
}

/* Time until a session's join window opens */
function countdown(ms) {
  if (ms <= 0) return "now";
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
  if (d > 0) return `${d} day${d > 1 ? "s" : ""} ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function sessionState(s, now) {
  const open = s.start - 15 * 60000, end = s.start + s.dur * 60000;
  if (now > end) return "over";
  if (now >= open) return "live";
  return "upcoming";
}
const lessonCount = (c) => c.syllabus.reduce((a, m) => a + m.lessons.length, 0);
const isIntern = (c) => c?.type === "internship";
const durationText = (c) => (isIntern(c) ? `${c.months} months` : `${c.weeks} weeks`);
const kindLabel = (c) => (isIntern(c) ? "Internship" : "Course");
const initials = (n) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

/* ---- blob storage (photos, certificate files) --------------------- */
const photoKey = (id) => `avlsi:photo:${id}`;
const certKey = (id) => `avlsi:cert:${id}`;
const thumbKey = (id) => `avlsi:thumb:${id}`;

async function putBlob(key, dataUrl) { await window.storage.set(key, dataUrl); }
async function getBlob(key) {
  try { const r = await window.storage.get(key); return r && r.value ? r.value : null; }
  catch (e) { return null; }
}
async function delBlob(key) { try { await window.storage.delete(key); } catch (e) { /* already gone */ } }

function downloadDataUrl(dataUrl, fileName) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
}

/* Crops to fill the target box and downscales, so a 6 MB phone photo
   becomes a ~60 KB thumbnail. Used for teacher photos and course art. */
function fileToCoverJpeg(file, outW, outH, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = outW; cv.height = outH;
      const g = cv.getContext("2d");
      const scale = Math.max(outW / img.width, outH / img.height);
      const w = img.width * scale, h = img.height * scale;
      g.drawImage(img, (outW - w) / 2, (outH - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(cv.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}

const fileToSquareJpeg = (file, size = 400) => fileToCoverJpeg(file, size, size);
const fileToThumb = (file) => fileToCoverJpeg(file, 800, 450, 0.82);

/* ================================================================== */
/*  PERSISTENCE                                                        */
/* ================================================================== */
const KEY = "avlsi:db:v2";
const emptyDB = () => ({
  users: [], enrollments: [], payments: [], certificates: [],
  teachers: SEED_TEACHERS, courses: SEED_PROGRAMS, sessions: SEED_SESSIONS,
});

async function loadDB() {
  try {
    const r = await window.storage.get(KEY);
    if (r && r.value) return { ...emptyDB(), ...JSON.parse(r.value) };
  } catch (e) { /* first run */ }
  return emptyDB();
}
async function saveDB(db) {
  try { await window.storage.set(KEY, JSON.stringify(db)); }
  catch (e) { console.error("Could not save:", e); }
}

/* ================================================================== */
/*  SHARED UI                                                          */
/* ================================================================== */
const LOGO_SRC = "data:image/png;base64,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";

function Logo({ light, size = 32 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img src={LOGO_SRC} alt="" width={size} height={size}
        style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />
      <span className="disp" style={{ fontWeight: 700, fontSize: 16.5, color: light ? "#fff" : C.ink, lineHeight: 1.1 }}>
        Advanced <span style={{ color: light ? C.oliveLight : C.olive }}>VLSI</span>
      </span>
    </div>
  );
}

const photoCache = new Map();

function Avatar({ id, name, size = 44, hasPhoto }) {
  const [src, setSrc] = useState(() => photoCache.get(id) || null);
  useEffect(() => {
    let live = true;
    if (!id || !hasPhoto) { setSrc(null); return; }
    if (photoCache.has(id)) { setSrc(photoCache.get(id)); return; }
    getBlob(photoKey(id)).then((d) => { photoCache.set(id, d); if (live) setSrc(d); });
    return () => { live = false; };
  }, [id, hasPhoto]);

  const base = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    objectFit: "cover", display: "block", border: `1px solid ${C.line}`,
  };
  if (src) return <img src={src} alt={name} style={base} />;
  return (
    <div style={{ ...base, background: "#E3E2D2", color: C.brandDeep, display: "grid", placeItems: "center", fontWeight: 600, fontSize: size * 0.36, fontFamily: "'Space Grotesk', sans-serif" }}>
      {initials(name || "?")}
    </div>
  );
}

const thumbCache = new Map();

/* Course artwork. If the admin hasn't uploaded one, we draw a calm
   track-coloured panel instead of showing a broken box. */
function Thumb({ id, hasThumb, track, height = 152, radius = "9px 9px 0 0" }) {
  const [src, setSrc] = useState(() => thumbCache.get(id) || null);
  useEffect(() => {
    let live = true;
    if (!id || !hasThumb) { setSrc(null); return; }
    if (thumbCache.has(id)) { setSrc(thumbCache.get(id)); return; }
    getBlob(thumbKey(id)).then((d) => { thumbCache.set(id, d); if (live) setSrc(d); });
    return () => { live = false; };
  }, [id, hasThumb]);

  const box = { width: "100%", height, borderRadius: radius, display: "block", objectFit: "cover" };
  if (src) return <img src={src} alt="" style={box} />;

  const Icon = (TRACKS[track] || TRACKS.cse).icon;
  const tint = { electronics: "#6B6E3E", ai: "#4F5A3C", cse: "#44433A" }[track] || C.ink2;
  return (
    <div style={{ ...box, background: `linear-gradient(135deg, ${tint} 0%, ${C.ink} 100%)`, display: "grid", placeItems: "center" }}>
      <Icon size={30} color="rgba(255,255,255,.42)" />
    </div>
  );
}

function Seg({ done, total }) {
  return (
    <div className="seg" aria-label={`${done} of ${total} lessons complete`}>
      {Array.from({ length: total }).map((_, i) => <i key={i} className={i < done ? "on" : ""} />)}
    </div>
  );
}

function TrackTag({ track }) {
  const t = TRACKS[track] || TRACKS.cse;
  const Icon = t.icon;
  return (
    <span className="tag" style={{ background: "#EAEBDB", color: C.brandDeep, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <Icon size={12} /> {t.name}
    </span>
  );
}

function Sheet({ children, onClose, wide }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="sheet" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheetc" style={wide ? { maxWidth: 620 } : undefined}>{children}</div>
    </div>
  );
}

function Empty({ icon: Icon, children, action }) {
  return (
    <div className="card" style={{ padding: 30, marginTop: 18, textAlign: "center" }}>
      {Icon && <Icon size={22} color={C.muted} />}
      <p style={{ fontSize: 15, color: C.muted, marginTop: 10, lineHeight: 1.55 }}>{children}</p>
      {action}
    </div>
  );
}

/* ================================================================== */
/*  AUTH                                                               */
/* ================================================================== */
function Auth({ mode, setMode, db, setDB, onDone, onClose }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", college: "", password: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit() {
    setErr("");
    const email = f.email.trim().toLowerCase();
    if (!email || !f.password) return setErr("Enter your email and password.");

    if (mode === "login") {
      const u = db.users.find((x) => x.email === email);
      if (!u) return setErr("No account found for that email. Register first.");
      if (u.password !== f.password) return setErr("That password is incorrect.");
      return onDone(u);
    }
    if (!f.name.trim()) return setErr("Enter your full name as it should appear on your certificate.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("That email address doesn't look right.");
    if (f.password.length < 6) return setErr("Use a password of at least 6 characters.");
    if (db.users.some((x) => x.email === email)) return setErr("That email is already registered. Log in instead.");

    const u = {
      id: uid(), name: f.name.trim(), email, phone: f.phone.trim(), college: f.college.trim(),
      password: f.password, role: email === "admin@advancedvlsi.com" ? "admin" : "student", joined: Date.now(),
    };
    const next = { ...db, users: [...db.users, u] };
    setDB(next); saveDB(next);
    onDone(u);
  }

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: "22px 24px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 21 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
              {mode === "login" ? "Get back to your courses and live classes." : "Registration is free. You only pay when you enroll in a course."}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: C.muted, marginTop: 2 }}><X size={19} /></button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {mode === "register" && (
            <>
              <label>
                <span className="lab">Full name — this goes on your certificate</span>
                <input value={f.name} onChange={set("name")} placeholder="Rahul Kumar Singh" style={{ marginTop: 5 }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label><span className="lab">Phone</span>
                  <input value={f.phone} onChange={set("phone")} placeholder="98765 43210" style={{ marginTop: 5 }} /></label>
                <label><span className="lab">College</span>
                  <input value={f.college} onChange={set("college")} placeholder="NIT Patna" style={{ marginTop: 5 }} /></label>
              </div>
            </>
          )}
          <label><span className="lab">Email</span>
            <input value={f.email} onChange={set("email")} type="email" placeholder="rahul@example.com" style={{ marginTop: 5 }} /></label>
          <label><span className="lab">Password</span>
            <input value={f.password} onChange={set("password")} type="password" onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••" style={{ marginTop: 5 }} /></label>

          {err && <div style={{ background: "#FDECEC", color: "#8E1B1B", padding: "9px 12px", borderRadius: 7, fontSize: 13.5 }}>{err}</div>}

          <button className="btn btn-p" onClick={submit} style={{ marginTop: 4 }}>
            {mode === "login" ? "Log in" : "Create account"}
          </button>

          <p style={{ fontSize: 13.5, color: C.muted, textAlign: "center" }}>
            {mode === "login" ? "New here? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }} style={{ color: C.brand, fontWeight: 600, fontSize: 13.5 }}>
              {mode === "login" ? "Create one" : "Log in"}
            </button>
          </p>
          <p style={{ fontSize: 12, color: C.muted, textAlign: "center", borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
            To see the admin panel, register with <b>admin@advancedvlsi.com</b>.
          </p>
        </div>
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  CHECKOUT                                                           */
/* ================================================================== */
const COUPONS = { AVLSI20: 20, EARLYBIRD: 15, STUDENT10: 10 };

function Checkout({ course, user, onPaid, onClose }) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState("summary");

  const off = applied ? Math.round(course.price * (COUPONS[applied] / 100)) : 0;
  const base = course.price - off;
  const tax = Math.round(base * 0.18);
  const total = base + tax;

  function apply() {
    const c = code.trim().toUpperCase();
    if (COUPONS[c]) { setApplied(c); setNote(`${COUPONS[c]}% off applied.`); }
    else { setApplied(null); setNote("That coupon code isn't valid."); }
  }

  function pay() {
    setStage("processing");
    // In production this opens Razorpay:
    //   new window.Razorpay({ key, order_id, amount, handler }).open()
    setTimeout(() => {
      setStage("done");
      setTimeout(() => onPaid({
        id: uid(), rzpPaymentId: "pay_" + uid().toUpperCase(), courseId: course.id,
        userId: user.id, amount: total, coupon: applied, at: Date.now(), status: "captured",
      }), 1100);
    }, 1600);
  }

  const Row = ({ k, v, strong, green }) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: strong ? 16 : 14.5, fontWeight: strong ? 600 : 400, color: green ? C.ok : C.ink }}>
      <span>{k}</span><span>{v}</span>
    </div>
  );

  return (
    <Sheet onClose={stage === "summary" ? onClose : () => {}}>
      <div style={{ padding: "22px 24px 26px" }}>
        {stage === "summary" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20 }}>Complete your enrollment</h2>
              <button onClick={onClose} aria-label="Close" style={{ color: C.muted }}><X size={19} /></button>
            </div>

            <div className="card" style={{ padding: 14, background: "#F8F7F2", marginBottom: 16 }}>
              <TrackTag track={course.track} />
              <h3 style={{ fontSize: 16.5, marginTop: 8 }}>{course.title}</h3>
              <p style={{ fontSize: 13.5, color: C.muted, marginTop: 5 }}>
                {durationText(course)} · {course.schedule} · live on Google Meet
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" style={{ textTransform: "uppercase" }} />
              <button className="btn btn-o btn-sm" onClick={apply} style={{ flexShrink: 0 }}>Apply</button>
            </div>
            {note && <p style={{ fontSize: 13, color: applied ? C.ok : "#8E1B1B", marginBottom: 12 }}>{note}</p>}

            <div style={{ display: "grid", gap: 9, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
              <Row k="Course fee" v={inr(course.price)} />
              {applied && <Row k={`Discount (${applied})`} v={"− " + inr(off)} green />}
              <Row k="GST (18%)" v={inr(tax)} />
              <hr className="hr" />
              <Row k="Total payable" v={inr(total)} strong />
            </div>

            <button className="btn btn-p" onClick={pay} style={{ width: "100%", marginTop: 18 }}>
              <CreditCard size={17} /> Pay {inr(total)}
            </button>
            <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 10 }}>
              Secured by Razorpay · UPI, cards, netbanking, EMI
            </p>
            <p style={{ fontSize: 11.5, color: C.muted, textAlign: "center", marginTop: 6, background: "#FFF8E6", padding: "7px 10px", borderRadius: 6 }}>
              Demo mode — no money is charged. The backend guide shows how to connect your live Razorpay keys.
            </p>
          </>
        )}

        {stage === "processing" && (
          <div style={{ padding: "42px 0", textAlign: "center" }}>
            <div style={{ width: 34, height: 34, border: `3px solid ${C.line}`, borderTopColor: C.brand, borderRadius: "50%", margin: "0 auto 18px", animation: "spin .8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <h3 style={{ fontSize: 17 }}>Verifying your payment</h3>
            <p style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>Don't close this window.</p>
          </div>
        )}

        {stage === "done" && (
          <div style={{ padding: "42px 0", textAlign: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#E3F4ED", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <Check size={24} color={C.ok} />
            </div>
            <h3 style={{ fontSize: 18 }}>You're enrolled</h3>
            <p style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{course.title} is now in your dashboard.</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  LANDING                                                            */
/* ================================================================== */
function Landing({ db, onOpenCourse, onAuth, nextLive }) {
  const [filter, setFilter] = useState("all");
  const published = db.courses.filter((c) => c.published !== false);
  const internships = published.filter(isIntern);
  const courses = published.filter((c) => !isIntern(c)).filter((c) => filter === "all" || c.track === filter);
  const teacherOf = (c) => db.teachers.find((t) => t.id === c.teacherId);
  const activeTeachers = db.teachers.filter((t) => published.some((c) => c.teacherId === t.id));

  return (
    <div>
      <header style={{ background: C.ink, color: "#fff" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo light />
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn btn-sm" style={{ color: "#CFCCBF" }} onClick={() => onAuth("login")}>Log in</button>
            <button className="btn btn-sm" style={{ background: "#fff", color: C.ink, fontWeight: 600 }} onClick={() => onAuth("register")}>Register</button>
          </div>
        </div>

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 22px 56px" }}>
          <div style={{ maxWidth: 620 }}>
            <h1 style={{ fontSize: "clamp(30px, 5.2vw, 47px)", lineHeight: 1.08, color: "#fff" }}>
              Learn VLSI from engineers who build chips for a living.
            </h1>
            <p style={{ fontSize: 17.5, color: "#BDB9AC", marginTop: 18, lineHeight: 1.6, maxWidth: 560 }}>
              VLSI, embedded, AI and software. Small batches, live on Google Meet, every session recorded.
              Finish the course and Advanced VLSI issues your certificate.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
              <button className="btn" style={{ background: "#fff", color: C.ink }} onClick={() => onAuth("register")}>Create a free account</button>
              <a href="#courses" className="btn" style={{ border: "1px solid #4A453B", color: "#fff" }}>Browse programs</a>
            </div>
          </div>

          {nextLive && (
            <div style={{ marginTop: 40, background: "#332F29", border: "1px solid #4A453B", borderRadius: 10, padding: "16px 18px", maxWidth: 620, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span className="led" />
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 13, color: "#A9A78F" }}>
                  {nextLive.state === "live" ? "A class is running right now" : `Next live class · ${fmtDay(nextLive.start)}, ${fmtRange(nextLive)}`}
                </p>
                <p style={{ fontSize: 15.5, fontWeight: 600, color: "#fff", marginTop: 3 }}>{nextLive.title}</p>
                <p style={{ fontSize: 13, color: "#A9A78F", marginTop: 2 }}>{nextLive.courseTitle}</p>
              </div>
              <button className="btn btn-sm" style={{ background: "#fff", color: C.ink }} onClick={() => onOpenCourse(nextLive.courseId)}>
                Join this course
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 22px 70px" }}>
        <section id="courses" style={{ paddingTop: 46 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 27 }}>Live training programs</h2>
              <p style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>Seats are capped in every batch so each student gets attention.</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["all", "All"], ...Object.entries(TRACKS).map(([k, v]) => [k, v.name])].map(([k, label]) => (
                <button key={k} onClick={() => setFilter(k)} className="btn btn-sm"
                  style={filter === k ? { background: C.ink, color: "#fff" } : { border: `1px solid ${C.line}`, background: "#fff", color: C.ink2 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {courses.map((c) => {
              const t = teacherOf(c);
              return (
                <button key={c.id} className="card" onClick={() => onOpenCourse(c.id)}
                  style={{ padding: 0, textAlign: "left", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <Thumb id={c.id} hasThumb={c.thumb} track={c.track} />
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  <TrackTag track={c.track} />
                  <h3 style={{ fontSize: 18, lineHeight: 1.25 }}>{c.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, flex: 1 }}>{c.blurb}</p>
                  {t && (
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <Avatar id={t.id} name={t.name} hasPhoto={t.photo} size={30} />
                      <span style={{ fontSize: 13.5, color: C.muted }}>{t.name} · {c.level}</span>
                    </div>
                  )}
                  <hr className="hr" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="disp" style={{ fontSize: 19, fontWeight: 700 }}>{inr(c.price)}</span>
                    <span style={{ fontSize: 13.5, color: C.brand, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                      {durationText(c)} <ChevronRight size={15} />
                    </span>
                  </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {internships.length > 0 && (
          <section id="internships" style={{ paddingTop: 56 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 6 }}>
              <div>
                <h2 style={{ fontSize: 27 }}>Internship programs</h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 6, maxWidth: 620, lineHeight: 1.55 }}>
                  Six months of supervised project work with weekly mentor reviews. Training is included,
                  and you finish with a completed project and an internship certificate.
                </p>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", marginTop: 20 }}>
              {internships.map((c) => {
                const tt = teacherOf(c);
                return (
                  <button key={c.id} className="card" onClick={() => onOpenCourse(c.id)}
                    style={{ padding: 0, textAlign: "left", display: "flex", flexDirection: "column", overflow: "hidden", borderTop: `3px solid ${C.olive}` }}>
                    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="tag" style={{ background: C.olive, color: "#fff", display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <GraduationCap size={12} /> Internship
                        </span>
                        <span className="tag" style={{ background: "#EAEBDB", color: C.brandDeep }}>{c.months} months</span>
                      </div>
                      <h3 style={{ fontSize: 18, lineHeight: 1.25 }}>{c.title}</h3>
                      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, flex: 1 }}>{c.blurb}</p>
                      {tt && (
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar id={tt.id} name={tt.name} hasPhoto={tt.photo} size={30} />
                          <span style={{ fontSize: 13.5, color: C.muted }}>Mentored by {tt.name}</span>
                        </div>
                      )}
                      <div style={{ display: "grid", gap: 6, paddingTop: 4 }}>
                        {["Live training sessions", "Weekly one-to-one mentor reviews", "Internship certificate on completion"].map((x) => (
                          <div key={x} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <Check size={14} color={C.ok} style={{ flexShrink: 0, marginTop: 3 }} />
                            <span style={{ fontSize: 13.5, color: C.ink2 }}>{x}</span>
                          </div>
                        ))}
                      </div>
                      <hr className="hr" />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span className="disp" style={{ fontSize: 22, fontWeight: 700 }}>{inr(c.price)}</span>
                          <span style={{ fontSize: 13, color: C.muted, marginLeft: 6 }}>total</span>
                        </div>
                        <span style={{ fontSize: 13.5, color: C.brand, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                          Details <ChevronRight size={15} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activeTeachers.length > 0 && (
          <section style={{ paddingTop: 56 }}>
            <h2 style={{ fontSize: 24 }}>Who teaches you</h2>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 6, marginBottom: 18, maxWidth: 620 }}>
              Every instructor works in the field they teach. They bring the problems they solved last week into the classroom.
            </p>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
              {activeTeachers.map((t) => (
                <div key={t.id} className="card" style={{ padding: 18 }}>
                  <Avatar id={t.id} name={t.name} hasPhoto={t.photo} size={54} />
                  <h3 style={{ fontSize: 16.5, marginTop: 12 }}>{t.name}</h3>
                  <p style={{ fontSize: 13.5, color: C.brand, fontWeight: 500, marginTop: 3 }}>{t.title}</p>
                  <p style={{ fontSize: 13.5, color: C.muted, marginTop: 8, lineHeight: 1.55 }}>{t.bio}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 11 }}>
                    {t.expertise.map((x) => (
                      <span key={x} className="tag" style={{ background: "#EFEDE4", color: C.ink2, fontWeight: 500 }}>{x}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ paddingTop: 56 }}>
          <h2 style={{ fontSize: 24, marginBottom: 18 }}>From registration to certificate</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
            {[
              ["Register", "Create a free account. No card details needed."],
              ["Pick a course", "Check the syllabus and batch timing, then pay the fee."],
              ["Attend live", "Your Google Meet link appears on the dashboard 15 minutes before class."],
              ["Get certified", "Finish the course and download the certificate Advanced VLSI issues you."],
            ].map(([t, d], i) => (
              <div key={t} style={{ borderTop: `2px solid ${C.ink}`, paddingTop: 13 }}>
                <span className="disp" style={{ fontSize: 13, color: C.brand, fontWeight: 600 }}>Step {i + 1}</span>
                <h3 style={{ fontSize: 16.5, marginTop: 5 }}>{t}</h3>
                <p style={{ fontSize: 14, color: C.muted, marginTop: 6, lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ background: C.ink, color: "#A9A78F", padding: "26px 22px", fontSize: 13.5 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <Logo light />
          <span>advancedvlsi.com · Advanced VLSI for better tomorrow</span>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  COURSE DETAIL                                                      */
/* ================================================================== */
function CourseDetail({ course, db, user, onBack, onEnroll, enrolled }) {
  const sessions = db.sessions.filter((s) => s.courseId === course.id).sort((a, b) => a.start - b.start);
  const taken = db.enrollments.filter((e) => e.courseId === course.id).length;
  const left = Math.max(0, course.seats - taken);
  const t = db.teachers.find((x) => x.id === course.teacherId);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 22px 70px" }}>
      <button onClick={onBack} className="btn btn-sm btn-o" style={{ marginBottom: 20 }}><ArrowLeft size={15} /> Back</button>

      <div className="cd-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(280px,1fr)", gap: 26 }}>
        <div>
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 18, border: `1px solid ${C.line}` }}>
            <Thumb id={course.id} hasThumb={course.thumb} track={course.track} height={240} radius="0" />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <TrackTag track={course.track} />
            {isIntern(course) && (
              <span className="tag" style={{ background: C.olive, color: "#fff", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <GraduationCap size={12} /> Internship · {course.months} months
              </span>
            )}
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,36px)", marginTop: 12, lineHeight: 1.12 }}>{course.title}</h1>
          <p style={{ fontSize: 16.5, color: C.ink2, marginTop: 14, lineHeight: 1.6 }}>{course.blurb}</p>

          {t && (
            <div className="card" style={{ padding: 16, marginTop: 22, background: "#F8F7F2", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <Avatar id={t.id} name={t.name} hasPhoto={t.photo} size={56} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 15.5 }}>{t.name}</p>
                <p style={{ fontSize: 14, color: C.brand, marginTop: 2 }}>{t.title} · {t.experience}</p>
                <p style={{ fontSize: 14, color: C.muted, marginTop: 7, lineHeight: 1.55 }}>{t.bio}</p>
              </div>
            </div>
          )}

          <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>What you'll be able to do</h2>
          <div style={{ display: "grid", gap: 9 }}>
            {course.outcomes.map((o) => (
              <div key={o} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Check size={17} color={C.ok} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 15, lineHeight: 1.5 }}>{o}</span>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>{isIntern(course) ? "Month by month" : "Syllabus"}</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {course.syllabus.map((m, i) => (
              <div key={m.title + i} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <h3 style={{ fontSize: 16 }}>{m.title}</h3>
                  <span style={{ fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>Module {i + 1}</span>
                </div>
                <ul style={{ margin: "9px 0 0", paddingLeft: 17, color: C.muted, fontSize: 14.5, lineHeight: 1.8 }}>
                  {m.lessons.map((l, li) => <li key={l + li}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {sessions.length > 0 && (
            <>
              <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>Scheduled live sessions</h2>
              <div className="card" style={{ padding: "6px 16px" }}>
                {sessions.map((s) => (
                  <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #EFEDE4", display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 14.5 }}>{s.title}</span>
                    <span style={{ fontSize: 13.5, color: C.muted, whiteSpace: "nowrap" }}>{fmtDay(s.start)} · {fmtRange(s)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside>
          <div className="card" style={{ padding: 20, position: "sticky", top: 20 }}>
            <p className="disp" style={{ fontSize: 30, fontWeight: 700 }}>{inr(course.price)}</p>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>+ 18% GST · one-time, no hidden charges</p>

            <div style={{ display: "grid", gap: 11, marginTop: 18, fontSize: 14.5 }}>
              {[
                [Calendar, `${durationText(course)} · about ${course.hoursPerWeek} hrs/week`],
                [Video, course.schedule],
                [Users, left > 0 ? `${left} of ${course.seats} seats left` : "Batch full — join the waitlist"],
                [Award, isIntern(course) ? "Internship certificate on completion" : "Certificate issued on completion"],
              ].map(([Icon, txt]) => (
                <div key={txt} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon size={16} color={C.brand} style={{ flexShrink: 0 }} />
                  <span>{txt}</span>
                </div>
              ))}
            </div>

            {enrolled ? (
              <div style={{ marginTop: 18, background: "#E3F4ED", color: "#0B5D45", padding: "11px 14px", borderRadius: 7, fontSize: 14.5, fontWeight: 600, textAlign: "center" }}>
                You're enrolled
              </div>
            ) : (
              <button className="btn btn-p" style={{ width: "100%", marginTop: 18 }} onClick={onEnroll} disabled={left === 0}>
                {left === 0 ? "Batch is full" : user ? (isIntern(course) ? "Apply and enroll" : "Enroll now") : "Log in to enroll"}
              </button>
            )}
            <p style={{ fontSize: 12.5, color: C.muted, marginTop: 10, textAlign: "center" }}>
              Recordings stay available for a year.
            </p>
          </div>
        </aside>
      </div>
      <style>{`@media(max-width:840px){.cd-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}

/* ================================================================== */
/*  SESSIONS                                                           */
/* ================================================================== */
function SessionRow({ s, courseTitle, now, onOpen }) {
  const st = sessionState(s, now);
  return (
    <div className={`tick ${st === "live" ? "tick-live" : st === "over" ? "tick-done" : ""}`}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "13px 0", flexWrap: "wrap" }}>
      <div style={{ minWidth: 190, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {st === "live" && <span className="led" />}
          <p style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</p>
        </div>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 3 }}>
          {courseTitle} · {fmtDay(s.start)}, {fmtRange(s)} · {fmtDur(s.dur)}
        </p>
      </div>
      {st === "over" ? (
        <span style={{ fontSize: 13.5, color: C.muted }}>Finished — recording coming soon</span>
      ) : st === "live" ? (
        <button className="btn btn-p btn-sm" onClick={() => onOpen(s)}><Video size={15} /> Join class</button>
      ) : (
        <button className="btn btn-o btn-sm" onClick={() => onOpen(s)}>
          <Clock size={14} /> Details
        </button>
      )}
    </div>
  );
}

/* ================================================================== */
/*  SESSION DETAIL — timing, duration and the meeting link             */
/* ================================================================== */
function SessionModal({ s, course, teacher, now, onClose }) {
  const [copied, setCopied] = useState("");
  const st = sessionState(s, now);
  const opensAt = s.start - 15 * 60000;

  async function copy() {
    try {
      await navigator.clipboard.writeText(s.meetUrl);
      setCopied("Link copied");
    } catch {
      setCopied("Select the link above and copy it manually");
    }
    setTimeout(() => setCopied(""), 2500);
  }

  const Line = ({ icon: Icon, k, v }) => (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <Icon size={16} color={C.brand} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <p className="lab">{k}</p>
        <p style={{ fontSize: 15, fontWeight: 500, marginTop: 1 }}>{v}</p>
      </div>
    </div>
  );

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: "22px 24px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ paddingRight: 10 }}>
            {st === "live" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <span className="led" />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.led }}>Live now</span>
              </span>
            )}
            <h2 style={{ fontSize: 19, lineHeight: 1.3 }}>{s.title}</h2>
            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{course ? course.title : ""}</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: C.muted }}><X size={19} /></button>
        </div>

        <div className="card" style={{ padding: 16, background: "#F8F7F2", display: "grid", gap: 14 }}>
          <Line icon={Calendar} k="Date" v={fmtFullDate(s.start)} />
          <Line icon={Clock} k="Time" v={`${fmtRange(s)} IST`} />
          <Line icon={Video} k="Duration" v={fmtDur(s.dur)} />
          {teacher && (
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <Avatar id={teacher.id} name={teacher.name} hasPhoto={teacher.photo} size={32} />
              <div>
                <p className="lab">Taught by</p>
                <p style={{ fontSize: 15, fontWeight: 500, marginTop: 1 }}>{teacher.name}</p>
              </div>
            </div>
          )}
        </div>

        {st === "over" ? (
          <div style={{ marginTop: 18, background: "#EFEDE4", padding: "12px 14px", borderRadius: 8, fontSize: 14.5, color: C.ink2 }}>
            This class has finished. The recording will be added to your course page.
          </div>
        ) : st === "live" ? (
          <>
            <div style={{ marginTop: 18 }}>
              <p className="lab" style={{ marginBottom: 6 }}>Meeting link</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={s.meetUrl} onFocus={(e) => e.target.select()} style={{ fontSize: 13.5, fontFamily: "ui-monospace, monospace" }} />
                <button className="btn btn-o btn-sm" onClick={copy} style={{ flexShrink: 0 }} aria-label="Copy link"><Copy size={15} /></button>
              </div>
              {copied && <p style={{ fontSize: 13, color: C.ok, marginTop: 7 }}>{copied}</p>}
            </div>
            <a className="btn btn-p" href={s.meetUrl} target="_blank" rel="noreferrer" style={{ width: "100%", marginTop: 14 }}>
              <Video size={17} /> Join class on Google Meet
            </a>
            <p style={{ fontSize: 12.5, color: C.muted, textAlign: "center", marginTop: 10 }}>
              Class ends at {fmtTime(endOf(s))}. This link is tied to your enrollment — please don't share it.
            </p>
          </>
        ) : (
          <>
            <div style={{ marginTop: 18, background: "#FFF8E6", padding: "13px 15px", borderRadius: 8 }}>
              <p style={{ fontSize: 14.5, fontWeight: 600 }}>Opens in {countdown(opensAt - now)}</p>
              <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
                The meeting link unlocks at {fmtTime(opensAt)}, fifteen minutes before the class starts.
              </p>
            </div>
            <button className="btn btn-p" disabled style={{ width: "100%", marginTop: 14 }}>
              <Lock size={16} /> Join class
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  CERTIFICATE VIEWER (admin-uploaded file)                           */
/* ================================================================== */
function CertViewer({ cert, course, onClose }) {
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => { getBlob(certKey(cert.id)).then((d) => (d ? setData(d) : setMissing(true))); }, [cert.id]);
  const isImg = (cert.mime || "").startsWith("image/");

  return (
    <Sheet onClose={onClose} wide>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 19 }}>{course ? course.title : "Certificate"}</h2>
            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 3 }}>
              {cert.certNo} · issued {fmtDate(cert.uploadedAt)}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: C.muted }}><X size={19} /></button>
        </div>

        {missing ? (
          <div style={{ background: "#FDECEC", color: "#8E1B1B", padding: "12px 14px", borderRadius: 7, fontSize: 14 }}>
            The file couldn't be found. Contact Advanced VLSI and ask them to upload it again.
          </div>
        ) : !data ? (
          <p style={{ color: C.muted, fontSize: 14.5, padding: "30px 0", textAlign: "center" }}>Opening file…</p>
        ) : isImg ? (
          <img src={data} alt="Certificate" style={{ width: "100%", borderRadius: 8, border: `1px solid ${C.line}`, display: "block" }} />
        ) : (
          <div className="card" style={{ padding: 26, textAlign: "center", background: "#F8F7F2" }}>
            <FileCheck size={26} color={C.brass} />
            <p style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>{cert.fileName}</p>
            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{fmtSize(cert.size)} · PDF</p>
          </div>
        )}

        {data && (
          <button className="btn btn-p" style={{ marginTop: 16 }} onClick={() => downloadDataUrl(data, cert.fileName)}>
            <Download size={16} /> Download
          </button>
        )}
      </div>
    </Sheet>
  );
}

/* ================================================================== */
/*  STUDENT — COURSE ROOM                                              */
/* ================================================================== */
function CourseRoom({ course, enr, db, now, cert, onToggle, onCert, onBack, onOpenSession }) {
  const total = lessonCount(course);
  const done = enr.done.length;
  const pct = Math.round((done / total) * 100);
  const sessions = db.sessions.filter((s) => s.courseId === course.id).sort((a, b) => a.start - b.start);
  const t = db.teachers.find((x) => x.id === course.teacherId);

  return (
    <div>
      <button onClick={onBack} className="btn btn-sm btn-o" style={{ marginBottom: 16 }}><ArrowLeft size={15} /> Dashboard</button>

      <TrackTag track={course.track} />
      <h1 style={{ fontSize: 26, marginTop: 10 }}>{course.title}</h1>
      {t && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 9 }}>
          <Avatar id={t.id} name={t.name} hasPhoto={t.photo} size={28} />
          <span style={{ fontSize: 14, color: C.muted }}>{t.name} · {course.schedule}</span>
        </div>
      )}

      <div className="card" style={{ padding: 16, marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{done} of {total} lessons complete</span>
          <span style={{ fontSize: 14.5, color: pct === 100 ? C.ok : C.muted, fontWeight: 600 }}>{pct}%</span>
        </div>
        <Seg done={done} total={total} />
        <div style={{ marginTop: 14 }}>
          {cert ? (
            <button className="btn btn-p btn-sm" onClick={onCert}><Download size={15} /> Download your certificate</button>
          ) : pct === 100 ? (
            <p style={{ fontSize: 13.5, color: C.ok, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              <Check size={14} /> Course complete. Advanced VLSI will verify and upload your certificate.
            </p>
          ) : (
            <p style={{ fontSize: 13.5, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
              <Lock size={14} /> {total - done} lessons to go.
            </p>
          )}
        </div>
      </div>

      {sessions.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, marginTop: 28 }}>Live sessions</h2>
          <div className="card" style={{ padding: "4px 16px", marginTop: 10 }}>
            {sessions.map((s) => <SessionRow key={s.id} s={s} courseTitle={course.title} now={now} onOpen={onOpenSession} />)}
          </div>
        </>
      )}

      <h2 style={{ fontSize: 18, marginTop: 28, marginBottom: 10 }}>Course content</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {course.syllabus.map((m, mi) => {
          const keys = m.lessons.map((_, li) => `${mi}.${li}`);
          const allDone = keys.length > 0 && keys.every((k) => enr.done.includes(k));
          return (
            <div key={m.title + mi} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 16 }}>{m.title}</h3>
                <button className="btn btn-sm" onClick={() => onToggle(keys, !allDone)}
                  style={allDone ? { background: "#E3F4ED", color: "#0B5D45" } : { border: `1px solid ${C.line}`, color: C.ink2 }}>
                  {allDone ? <><Check size={14} /> Module complete</> : "Mark module complete"}
                </button>
              </div>
              <div style={{ marginTop: 10, display: "grid", gap: 2 }}>
                {m.lessons.map((l, li) => {
                  const k = `${mi}.${li}`, d = enr.done.includes(k);
                  return (
                    <button key={k} onClick={() => onToggle([k], !d)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 6, textAlign: "left", width: "100%" }}>
                      <span style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, border: d ? "none" : `1.5px solid ${C.line}`, background: d ? C.ok : "#fff", display: "grid", placeItems: "center" }}>
                        {d && <Check size={12} color="#fff" />}
                      </span>
                      <span style={{ fontSize: 14.5, color: d ? C.muted : C.ink, textDecoration: d ? "line-through" : "none" }}>{l}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ADMIN — TEACHERS                                                   */
/* ================================================================== */
const blankTeacher = { id: null, name: "", title: "", experience: "", expertise: "", bio: "", photoData: null, photo: false };

function AdminTeachers({ db, setDB, persist }) {
  const [f, setF] = useState(blankTeacher);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("Choose an image file (PNG or JPG).");
    try {
      const data = await fileToSquareJpeg(file);
      setF({ ...f, photoData: data });
      setErr("");
    } catch { setErr("That image couldn't be read. Try another file."); }
  }

  async function save() {
    if (!f.name.trim()) return setErr("Enter the teacher's name.");
    if (!f.title.trim()) return setErr("Enter their job title.");
    setBusy(true); setErr("");

    const id = f.id || uid();
    let hasPhoto = f.photo;
    if (f.photoData) {
      await putBlob(photoKey(id), f.photoData);
      photoCache.set(id, f.photoData);
      hasPhoto = true;
    }

    const rec = {
      id, name: f.name.trim(), title: f.title.trim(),
      experience: f.experience.trim() || "—",
      expertise: f.expertise.split(",").map((x) => x.trim()).filter(Boolean),
      bio: f.bio.trim(), photo: hasPhoto,
    };
    const next = {
      ...db,
      teachers: f.id ? db.teachers.map((t) => (t.id === id ? rec : t)) : [...db.teachers, rec],
    };
    setDB(next); persist(next);
    if (fileRef.current) fileRef.current.value = "";
    setF(blankTeacher); setBusy(false);
  }

  function edit(t) {
    setF({ ...t, expertise: t.expertise.join(", "), photoData: null });
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(t) {
    const assigned = db.courses.filter((c) => c.teacherId === t.id);
    if (assigned.length) return setErr(`${t.name} still teaches ${assigned.length} course(s). Reassign those first.`);
    await delBlob(photoKey(t.id));
    photoCache.delete(t.id);
    const next = { ...db, teachers: db.teachers.filter((x) => x.id !== t.id) };
    setDB(next); persist(next);
    if (f.id === t.id) setF(blankTeacher);
  }

  return (
    <>
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <h3 style={{ fontSize: 16 }}>{f.id ? "Edit teacher" : "Add a teacher"}</h3>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4, marginBottom: 14 }}>
          Photos are cropped square and resized automatically, so you can upload straight from a phone.
        </p>

        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            {f.photoData
              ? <img src={f.photoData} alt="Preview" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: `1px solid ${C.line}` }} />
              : <Avatar id={f.id} name={f.name || "?"} hasPhoto={f.photo} size={88} />}
            <button className="btn btn-o btn-sm" style={{ marginTop: 10 }} onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> {f.photo || f.photoData ? "Replace" : "Add photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pickPhoto} style={{ display: "none" }} />
          </div>

          <div className="grid" style={{ flex: 1, minWidth: 260, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
            <label><span className="lab">Full name</span>
              <input value={f.name} onChange={set("name")} placeholder="Ananya Ravi" style={{ marginTop: 5 }} /></label>
            <label><span className="lab">Job title</span>
              <input value={f.title} onChange={set("title")} placeholder="Senior Verification Engineer" style={{ marginTop: 5 }} /></label>
            <label><span className="lab">Experience</span>
              <input value={f.experience} onChange={set("experience")} placeholder="9 years" style={{ marginTop: 5 }} /></label>
            <label><span className="lab">Expertise — comma separated</span>
              <input value={f.expertise} onChange={set("expertise")} placeholder="UVM, SystemVerilog" style={{ marginTop: 5 }} /></label>
            <label style={{ gridColumn: "1 / -1" }}><span className="lab">Short bio</span>
              <textarea value={f.bio} onChange={set("bio")} rows={3} placeholder="What they work on and how they teach." style={{ marginTop: 5 }} /></label>
          </div>
        </div>

        {err && <p style={{ fontSize: 13.5, color: "#8E1B1B", background: "#FDECEC", padding: "9px 12px", borderRadius: 7, marginTop: 14 }}>{err}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn btn-p btn-sm" onClick={save} disabled={busy}>
            <Plus size={15} /> {busy ? "Saving…" : f.id ? "Save changes" : "Add teacher"}
          </button>
          {f.id && <button className="btn btn-o btn-sm" onClick={() => { setF(blankTeacher); setErr(""); }}>Cancel</button>}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
        {db.teachers.map((t) => {
          const courses = db.courses.filter((c) => c.teacherId === t.id);
          return (
            <div key={t.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar id={t.id} name={t.name} hasPhoto={t.photo} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15.5, lineHeight: 1.3 }}>{t.name}</h3>
                  <p style={{ fontSize: 13, color: C.brand, marginTop: 2 }}>{t.title}</p>
                  <p style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{t.experience}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 10 }}>
                {courses.length ? `Teaching ${courses.length} course${courses.length > 1 ? "s" : ""}` : "Not assigned to a course yet"}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <button className="btn btn-o btn-sm" onClick={() => edit(t)}><Pencil size={13} /> Edit</button>
                <button className="btn btn-sm" onClick={() => remove(t)} style={{ color: C.led }} aria-label={`Remove ${t.name}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ================================================================== */
/*  ADMIN — COURSES                                                    */
/* ================================================================== */
const blankCourse = {
  title: "", type: "course", track: "electronics", teacherId: "", price: 19999,
  weeks: 8, months: 6, hoursPerWeek: 6, level: "Beginner", seats: 30, schedule: "", blurb: "",
};

function AdminCourses({ db, setDB, persist }) {
  const [f, setF] = useState(blankCourse);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null); // courseId whose editor is open
  const [modTitle, setModTitle] = useState("");
  const [lessonText, setLessonText] = useState({});
  const [outcomeText, setOutcomeText] = useState({});
  const [thumbErr, setThumbErr] = useState({});
  const thumbRefs = useRef({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function create() {
    if (!f.title.trim()) return setErr("Give the course a title.");
    if (!f.teacherId) return setErr("Assign a teacher.");
    const c = {
      ...f, id: uid(), title: f.title.trim(),
      price: Number(f.price) || 0, weeks: Number(f.weeks) || 1, months: Number(f.months) || 6,
      hoursPerWeek: Number(f.hoursPerWeek) || 1, seats: Number(f.seats) || 10,
      schedule: f.schedule.trim() || "To be announced",
      blurb: f.blurb.trim() || "Details coming soon.",
      outcomes: [], syllabus: [], published: false,
    };
    const next = { ...db, courses: [...db.courses, c] };
    setDB(next); persist(next);
    setF(blankCourse); setOpen(false); setErr("");
    setEditing(c.id);
  }

  const patch = (id, data) => {
    const next = { ...db, courses: db.courses.map((c) => (c.id === id ? { ...c, ...data } : c)) };
    setDB(next); persist(next);
  };

  function addModule(c) {
    if (!modTitle.trim()) return;
    patch(c.id, { syllabus: [...c.syllabus, { title: modTitle.trim(), lessons: [] }] });
    setModTitle("");
  }
  function addOutcome(c) {
    const txt = (outcomeText[c.id] || "").trim();
    if (!txt) return;
    patch(c.id, { outcomes: [...(c.outcomes || []), txt] });
    setOutcomeText({ ...outcomeText, [c.id]: "" });
  }
  async function pickThumb(c, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setThumbErr({ ...thumbErr, [c.id]: "Choose a PNG or JPG." });
    try {
      const data = await fileToThumb(file);
      await putBlob(thumbKey(c.id), data);
      thumbCache.set(c.id, data);
      patch(c.id, { thumb: true });
      setThumbErr({ ...thumbErr, [c.id]: "" });
    } catch {
      setThumbErr({ ...thumbErr, [c.id]: "That image couldn't be read. Try another file." });
    }
    e.target.value = "";
  }
  async function clearThumb(c) {
    await delBlob(thumbKey(c.id));
    thumbCache.delete(c.id);
    patch(c.id, { thumb: false });
  }
  function addLesson(c, mi) {
    const txt = (lessonText[`${c.id}.${mi}`] || "").trim();
    if (!txt) return;
    const syl = c.syllabus.map((m, i) => (i === mi ? { ...m, lessons: [...m.lessons, txt] } : m));
    patch(c.id, { syllabus: syl });
    setLessonText({ ...lessonText, [`${c.id}.${mi}`]: "" });
  }
  function delModule(c, mi) {
    patch(c.id, { syllabus: c.syllabus.filter((_, i) => i !== mi) });
  }
  function delLesson(c, mi, li) {
    const syl = c.syllabus.map((m, i) => (i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m));
    patch(c.id, { syllabus: syl });
  }

  return (
    <>
      {!open ? (
        <button className="btn btn-p btn-sm" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
          <Plus size={15} /> New course or internship
        </button>
      ) : (
        <div className="card" style={{ padding: 18, marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>New course or internship</h3>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
            <label style={{ gridColumn: "1 / -1" }}><span className="lab">Title</span>
              <input value={f.title} onChange={set("title")} placeholder="Advanced FPGA Design" style={{ marginTop: 5 }} /></label>
            <label><span className="lab">Type</span>
              <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, price: e.target.value === "internship" ? 999 : f.price })} style={{ marginTop: 5 }}>
                <option value="course">Course</option>
                <option value="internship">Internship</option>
              </select></label>
            <label><span className="lab">Track</span>
              <select value={f.track} onChange={set("track")} style={{ marginTop: 5 }}>
                {Object.entries(TRACKS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select></label>
            <label><span className="lab">Teacher</span>
              <select value={f.teacherId} onChange={set("teacherId")} style={{ marginTop: 5 }}>
                <option value="">Choose…</option>
                {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select></label>
            <label><span className="lab">Level</span>
              <select value={f.level} onChange={set("level")} style={{ marginTop: 5 }}>
                {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
              </select></label>
            <label><span className="lab">Price (₹)</span>
              <input type="number" value={f.price} onChange={set("price")} style={{ marginTop: 5 }} /></label>
            {f.type === "internship" ? (
              <label><span className="lab">Months</span>
                <input type="number" value={f.months} onChange={set("months")} style={{ marginTop: 5 }} /></label>
            ) : (
              <label><span className="lab">Weeks</span>
                <input type="number" value={f.weeks} onChange={set("weeks")} style={{ marginTop: 5 }} /></label>
            )}
            <label><span className="lab">Hours / week</span>
              <input type="number" value={f.hoursPerWeek} onChange={set("hoursPerWeek")} style={{ marginTop: 5 }} /></label>
            <label><span className="lab">Seats</span>
              <input type="number" value={f.seats} onChange={set("seats")} style={{ marginTop: 5 }} /></label>
            <label style={{ gridColumn: "1 / -1" }}><span className="lab">Class schedule</span>
              <input value={f.schedule} onChange={set("schedule")} placeholder="Tue / Thu · 8:00 PM IST" style={{ marginTop: 5 }} /></label>
            <label style={{ gridColumn: "1 / -1" }}><span className="lab">Short description</span>
              <textarea value={f.blurb} onChange={set("blurb")} rows={2} style={{ marginTop: 5 }} /></label>
          </div>
          {err && <p style={{ fontSize: 13.5, color: "#8E1B1B", background: "#FDECEC", padding: "9px 12px", borderRadius: 7, marginTop: 12 }}>{err}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn btn-p btn-sm" onClick={create}>Create</button>
            <button className="btn btn-o btn-sm" onClick={() => { setOpen(false); setErr(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {db.courses.map((c) => {
          const enrolled = db.enrollments.filter((e) => e.courseId === c.id).length;
          const isOpen = editing === c.id;
          return (
            <div key={c.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div style={{ minWidth: 220, flex: 1 }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 16.5 }}>{c.title}</h3>
                    {isIntern(c) && <span className="tag" style={{ background: C.olive, color: "#fff" }}>Internship</span>}
                    <span className="tag" style={c.published !== false
                      ? { background: "#E3F4ED", color: "#0B5D45" }
                      : { background: "#FFF3D6", color: "#7A5B00" }}>
                      {c.published !== false ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>
                    {TRACKS[c.track].name} · {durationText(c)} · {enrolled}/{c.seats} enrolled · {lessonCount(c)} lessons
                  </p>
                </div>
                <button className="btn btn-o btn-sm" onClick={() => setEditing(isOpen ? null : c.id)}>
                  {isOpen ? "Close editor" : "Edit course"}
                </button>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginTop: 14 }}>
                <label><span className="lab">Price (₹)</span>
                  <input type="number" value={c.price} onChange={(e) => patch(c.id, { price: Number(e.target.value) || 0 })} style={{ marginTop: 5 }} /></label>
                <label><span className="lab">Seats</span>
                  <input type="number" value={c.seats} onChange={(e) => patch(c.id, { seats: Number(e.target.value) || 0 })} style={{ marginTop: 5 }} /></label>
                <label><span className="lab">Teacher</span>
                  <select value={c.teacherId || ""} onChange={(e) => patch(c.id, { teacherId: e.target.value })} style={{ marginTop: 5 }}>
                    <option value="">Unassigned</option>
                    {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select></label>
                <label><span className="lab">Visibility</span>
                  <select value={c.published !== false ? "1" : "0"} onChange={(e) => patch(c.id, { published: e.target.value === "1" })} style={{ marginTop: 5 }}>
                    <option value="1">Live on site</option>
                    <option value="0">Draft (hidden)</option>
                  </select></label>
              </div>

              {isOpen && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
                  <h4 style={{ fontSize: 15, marginBottom: 10 }}>Course artwork</h4>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
                    <div style={{ width: 190, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.line}`, flexShrink: 0 }}>
                      <Thumb id={c.id} hasThumb={c.thumb} track={c.track} height={107} radius="0" />
                    </div>
                    <div>
                      <button className="btn btn-o btn-sm" onClick={() => thumbRefs.current[c.id]?.click()}>
                        <ImageIcon size={14} /> {c.thumb ? "Replace image" : "Upload image"}
                      </button>
                      {c.thumb && (
                        <button className="btn btn-sm" style={{ color: C.led, marginLeft: 6 }} onClick={() => clearThumb(c)}>
                          Remove
                        </button>
                      )}
                      <input type="file" accept="image/png,image/jpeg" style={{ display: "none" }}
                        ref={(el) => { thumbRefs.current[c.id] = el; }}
                        onChange={(e) => pickThumb(c, e)} />
                      <p style={{ fontSize: 12.5, color: C.muted, marginTop: 9, maxWidth: 300, lineHeight: 1.5 }}>
                        Cropped to 16:9 and resized to 800px automatically. Without one, a track-coloured panel is shown.
                      </p>
                      {thumbErr[c.id] && <p style={{ fontSize: 13, color: "#8E1B1B", marginTop: 7 }}>{thumbErr[c.id]}</p>}
                    </div>
                  </div>

                  <h4 style={{ fontSize: 15, marginBottom: 10 }}>Course details</h4>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", marginBottom: 20 }}>
                    <label style={{ gridColumn: "1 / -1" }}><span className="lab">Title</span>
                      <input value={c.title} onChange={(e) => patch(c.id, { title: e.target.value })} style={{ marginTop: 5 }} /></label>
                    <label style={{ gridColumn: "1 / -1" }}><span className="lab">Short description</span>
                      <textarea rows={2} value={c.blurb} onChange={(e) => patch(c.id, { blurb: e.target.value })} style={{ marginTop: 5 }} /></label>
                    <label><span className="lab">Track</span>
                      <select value={c.track} onChange={(e) => patch(c.id, { track: e.target.value })} style={{ marginTop: 5 }}>
                        {Object.entries(TRACKS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                      </select></label>
                    <label><span className="lab">Level</span>
                      <select value={c.level} onChange={(e) => patch(c.id, { level: e.target.value })} style={{ marginTop: 5 }}>
                        {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
                      </select></label>
                    {isIntern(c) ? (
                      <label><span className="lab">Months</span>
                        <input type="number" value={c.months || 6} onChange={(e) => patch(c.id, { months: Number(e.target.value) || 1 })} style={{ marginTop: 5 }} /></label>
                    ) : (
                      <label><span className="lab">Weeks</span>
                        <input type="number" value={c.weeks} onChange={(e) => patch(c.id, { weeks: Number(e.target.value) || 1 })} style={{ marginTop: 5 }} /></label>
                    )}
                    <label><span className="lab">Hours / week</span>
                      <input type="number" value={c.hoursPerWeek} onChange={(e) => patch(c.id, { hoursPerWeek: Number(e.target.value) || 1 })} style={{ marginTop: 5 }} /></label>
                    <label style={{ gridColumn: "1 / -1" }}><span className="lab">Class schedule</span>
                      <input value={c.schedule} onChange={(e) => patch(c.id, { schedule: e.target.value })} placeholder="Tue / Thu · 8:00 PM IST" style={{ marginTop: 5 }} /></label>
                  </div>

                  <h4 style={{ fontSize: 15, marginBottom: 10 }}>Learning outcomes</h4>
                  <div style={{ marginBottom: 20 }}>
                    {(c.outcomes || []).map((o, oi) => (
                      <div key={oi} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", fontSize: 14, color: C.ink2 }}>
                        <span>· {o}</span>
                        <button onClick={() => patch(c.id, { outcomes: c.outcomes.filter((_, j) => j !== oi) })} style={{ color: C.muted }} aria-label="Delete outcome"><X size={13} /></button>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
                      <input value={outcomeText[c.id] || ""} placeholder="What a student can do after this course"
                        onChange={(e) => setOutcomeText({ ...outcomeText, [c.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addOutcome(c)} style={{ fontSize: 14, padding: "7px 10px" }} />
                      <button className="btn btn-o btn-sm" onClick={() => addOutcome(c)}><Plus size={13} /></button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: 15, marginBottom: 10 }}>Modules and lessons</h4>
                  {c.syllabus.length === 0 && (
                    <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 10 }}>No modules yet. Add the first one below.</p>
                  )}
                  <div style={{ display: "grid", gap: 10 }}>
                    {c.syllabus.map((m, mi) => (
                      <div key={mi} style={{ background: "#F8F7F2", borderRadius: 8, padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <p style={{ fontSize: 14.5, fontWeight: 600 }}>{m.title}</p>
                          <button onClick={() => delModule(c, mi)} style={{ color: C.led }} aria-label="Delete module"><Trash2 size={14} /></button>
                        </div>
                        {m.lessons.map((l, li) => (
                          <div key={li} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 0", fontSize: 14, color: C.ink2 }}>
                            <span>· {l}</span>
                            <button onClick={() => delLesson(c, mi, li)} style={{ color: C.muted }} aria-label="Delete lesson"><X size={13} /></button>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
                          <input value={lessonText[`${c.id}.${mi}`] || ""} placeholder="Add a lesson"
                            onChange={(e) => setLessonText({ ...lessonText, [`${c.id}.${mi}`]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && addLesson(c, mi)}
                            style={{ fontSize: 14, padding: "7px 10px" }} />
                          <button className="btn btn-o btn-sm" onClick={() => addLesson(c, mi)}><Plus size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
                    <input value={modTitle} onChange={(e) => setModTitle(e.target.value)} placeholder="New module title"
                      onKeyDown={(e) => e.key === "Enter" && addModule(c)} />
                    <button className="btn btn-p btn-sm" onClick={() => addModule(c)} style={{ flexShrink: 0 }}><Plus size={14} /> Module</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ================================================================== */
/*  ADMIN — CERTIFICATES                                               */
/* ================================================================== */
function AdminCerts({ db, setDB, persist }) {
  const [up, setUp] = useState({ userId: "", courseId: "", certNo: "", file: null, err: "", busy: false });
  const fileRef = useRef(null);
  const students = db.users.filter((u) => u.role === "student");

  const eligible = up.userId
    ? db.enrollments.filter((e) => e.userId === up.userId).map((e) => db.courses.find((c) => c.id === e.courseId)).filter(Boolean)
    : [];

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return setUp({ ...up, file: null, err: "Keep the file under 4 MB." });
    setUp({ ...up, file: f, err: "" });
  }

  async function upload() {
    if (!up.userId) return setUp({ ...up, err: "Choose a student." });
    if (!up.courseId) return setUp({ ...up, err: "Choose a course." });
    if (!up.file) return setUp({ ...up, err: "Choose the certificate file (PDF, PNG or JPG)." });

    const dup = db.certificates.find((c) => c.userId === up.userId && c.courseId === up.courseId);
    setUp({ ...up, busy: true, err: "" });

    const dataUrl = await new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => res(null);
      r.readAsDataURL(up.file);
    });
    if (!dataUrl) return setUp({ ...up, busy: false, err: "That file couldn't be read. Try again." });

    const id = dup ? dup.id : uid();
    await putBlob(certKey(id), dataUrl);

    const rec = {
      id, userId: up.userId, courseId: up.courseId,
      certNo: up.certNo.trim() || `AVL-${new Date().getFullYear()}-${id.slice(0, 6).toUpperCase()}`,
      fileName: up.file.name, mime: up.file.type || "application/pdf",
      size: up.file.size, uploadedAt: Date.now(),
    };
    const next = {
      ...db,
      certificates: dup ? db.certificates.map((c) => (c.id === id ? rec : c)) : [...db.certificates, rec],
    };
    setDB(next); persist(next);
    if (fileRef.current) fileRef.current.value = "";
    setUp({ userId: "", courseId: "", certNo: "", file: null, err: "", busy: false });
  }

  async function remove(id) {
    await delBlob(certKey(id));
    const next = { ...db, certificates: db.certificates.filter((c) => c.id !== id) };
    setDB(next); persist(next);
  }

  return (
    <>
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <h3 style={{ fontSize: 16 }}>Upload a certificate</h3>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4, marginBottom: 14 }}>
          Pick the student and their course, then upload the file. It appears in their dashboard immediately.
        </p>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <label><span className="lab">Student</span>
            <select value={up.userId} onChange={(e) => setUp({ ...up, userId: e.target.value, courseId: "", err: "" })} style={{ marginTop: 5 }}>
              <option value="">Choose…</option>
              {students.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
            </select></label>
          <label><span className="lab">Course</span>
            <select value={up.courseId} onChange={(e) => setUp({ ...up, courseId: e.target.value, err: "" })} disabled={!up.userId} style={{ marginTop: 5 }}>
              <option value="">{up.userId ? "Choose…" : "Pick a student first"}</option>
              {eligible.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select></label>
          <label><span className="lab">Certificate number (optional)</span>
            <input value={up.certNo} onChange={(e) => setUp({ ...up, certNo: e.target.value })} placeholder="AVL-2026-000148" style={{ marginTop: 5 }} /></label>
          <label style={{ gridColumn: "1 / -1" }}><span className="lab">File — PDF, PNG or JPG, under 4 MB</span>
            <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg" onChange={pickFile} style={{ marginTop: 5, padding: 9 }} /></label>
        </div>

        {up.userId && eligible.length === 0 && (
          <p style={{ fontSize: 13.5, color: C.muted, marginTop: 12 }}>This student isn't enrolled in any course yet.</p>
        )}
        {up.err && <p style={{ fontSize: 13.5, color: "#8E1B1B", background: "#FDECEC", padding: "9px 12px", borderRadius: 7, marginTop: 12 }}>{up.err}</p>}
        {up.file && !up.err && <p style={{ fontSize: 13.5, color: C.muted, marginTop: 12 }}>{up.file.name} · {fmtSize(up.file.size)}</p>}

        <button className="btn btn-p btn-sm" onClick={upload} disabled={up.busy} style={{ marginTop: 14 }}>
          <Upload size={15} /> {up.busy ? "Uploading…" : "Upload certificate"}
        </button>
        <p style={{ fontSize: 12.5, color: C.muted, marginTop: 9 }}>
          Uploading again for the same student and course replaces the previous file.
        </p>
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        {db.certificates.length === 0 ? (
          <p style={{ padding: 22, fontSize: 14.5, color: C.muted }}>No certificates issued yet.</p>
        ) : (
          <table className="t">
            <thead><tr><th>Certificate no.</th><th>Student</th><th className="hide-sm">Course</th><th className="hide-sm">File</th><th></th></tr></thead>
            <tbody>
              {db.certificates.slice().reverse().map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>{c.certNo}</td>
                  <td>{db.users.find((u) => u.id === c.userId)?.name || "—"}</td>
                  <td className="hide-sm" style={{ color: C.muted }}>{db.courses.find((x) => x.id === c.courseId)?.title}</td>
                  <td className="hide-sm" style={{ color: C.muted }}>{c.fileName} · {fmtSize(c.size)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button onClick={() => remove(c.id)} style={{ color: C.led }} aria-label="Delete certificate"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ================================================================== */
/*  ADMIN — EXCEL EXPORT                                               */
/* ================================================================== */
function buildWorkbook(db) {
  const wb = XLSX.utils.book_new();
  const students = db.users.filter((u) => u.role === "student");
  const nameOf = (id) => db.users.find((u) => u.id === id)?.name || "—";
  const userOf = (id) => db.users.find((u) => u.id === id);
  const paidFor = (userId, courseId) =>
    db.payments.filter((p) => p.userId === userId && p.courseId === courseId).reduce((a, p) => a + p.amount, 0);

  const add = (rows, sheetName, widths) => {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: "No records yet" }]);
    if (widths) ws["!cols"] = widths.map((w) => ({ wch: w }));
    // Excel rejects sheet names over 31 chars or containing : \ / ? * [ ]
    const safe = sheetName.replace(/[:\\/?*[\]]/g, "-").slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safe);
  };

  /* ---- Sheet 1: Summary, one row per course ---- */
  const summary = db.courses.map((c) => {
    const enrs = db.enrollments.filter((e) => e.courseId === c.id);
    const tot = lessonCount(c);
    const revenue = db.payments.filter((p) => p.courseId === c.id).reduce((a, p) => a + p.amount, 0);
    const completed = enrs.filter((e) => tot > 0 && e.done.length === tot).length;
    return {
      "Course": c.title,
      "Type": kindLabel(c),
      "Duration": durationText(c),
      "Track": TRACKS[c.track]?.name || c.track,
      "Teacher": db.teachers.find((t) => t.id === c.teacherId)?.name || "Unassigned",
      "Status": c.published !== false ? "Live" : "Draft",
      "Price (INR)": c.price,
      "Enrolled": enrs.length,
      "Seats": c.seats,
      "Seats left": Math.max(0, c.seats - enrs.length),
      "Completed": completed,
      "Certificates issued": db.certificates.filter((x) => x.courseId === c.id).length,
      "Revenue (INR)": revenue,
    };
  });
  summary.push({
    "Course": "TOTAL", "Type": "", "Duration": "", "Track": "", "Teacher": "", "Status": "", "Price (INR)": "",
    "Enrolled": db.enrollments.length, "Seats": db.courses.reduce((a, c) => a + c.seats, 0),
    "Seats left": "", "Completed": "",
    "Certificates issued": db.certificates.length,
    "Revenue (INR)": db.payments.reduce((a, p) => a + p.amount, 0),
  });
  add(summary, "Summary", [34, 11, 12, 18, 20, 9, 12, 10, 8, 10, 11, 18, 15]);

  /* ---- Sheet 2: every registered student ---- */
  add(students.slice().sort((a, b) => b.joined - a.joined).map((u) => {
    const es = db.enrollments.filter((e) => e.userId === u.id);
    return {
      "Name": u.name, "Email": u.email, "Phone": u.phone || "",
      "College": u.college || "", "Registered on": fmtDate(u.joined),
      "Courses enrolled": es.length,
      "Course names": es.map((e) => db.courses.find((c) => c.id === e.courseId)?.title).filter(Boolean).join("; "),
      "Total paid (INR)": db.payments.filter((p) => p.userId === u.id).reduce((a, p) => a + p.amount, 0),
      "Certificates": db.certificates.filter((c) => c.userId === u.id).length,
    };
  }), "All students", [22, 28, 14, 22, 15, 10, 40, 15, 12]);

  /* ---- Sheet 3: every enrollment, across all courses ---- */
  add(db.enrollments.slice().sort((a, b) => b.at - a.at).map((e) => {
    const c = db.courses.find((x) => x.id === e.courseId);
    const u = userOf(e.userId);
    const tot = c ? lessonCount(c) : 0;
    const cert = db.certificates.find((x) => x.userId === e.userId && x.courseId === e.courseId);
    return {
      "Student": u?.name || "—", "Email": u?.email || "", "Phone": u?.phone || "",
      "College": u?.college || "",
      "Course": c?.title || "Deleted course",
      "Type": c ? kindLabel(c) : "",
      "Track": c ? TRACKS[c.track]?.name : "",
      "Enrolled on": fmtDate(e.at),
      "Lessons done": e.done.length, "Total lessons": tot,
      "Progress %": tot ? Math.round((e.done.length / tot) * 100) : 0,
      "Status": tot && e.done.length === tot ? "Completed" : "In progress",
      "Amount paid (INR)": paidFor(e.userId, e.courseId),
      "Certificate no.": cert ? cert.certNo : "",
    };
  }), "All enrollments", [22, 28, 14, 20, 32, 11, 18, 14, 12, 12, 11, 13, 16, 20]);

  /* ---- Sheet 4: payments ---- */
  add(db.payments.slice().reverse().map((p) => ({
    "Payment ID": p.rzpPaymentId, "Date": fmtDate(p.at),
    "Student": nameOf(p.userId), "Email": userOf(p.userId)?.email || "",
    "Course": db.courses.find((c) => c.id === p.courseId)?.title || "—",
    "Amount (INR)": p.amount, "Coupon": p.coupon || "", "Status": "Captured",
  })), "Payments", [22, 14, 22, 28, 32, 13, 12, 11]);

  /* ---- Sheet 5: certificates ---- */
  add(db.certificates.slice().reverse().map((c) => ({
    "Certificate no.": c.certNo, "Student": nameOf(c.userId),
    "Email": userOf(c.userId)?.email || "",
    "Course": db.courses.find((x) => x.id === c.courseId)?.title || "—",
    "Issued on": fmtDate(c.uploadedAt), "File": c.fileName,
  })), "Certificates", [20, 22, 28, 32, 14, 28]);

  /* ---- One sheet per course, so you can hand a single tab to a teacher ---- */
  db.courses.forEach((c) => {
    const tot = lessonCount(c);
    const rows = db.enrollments.filter((e) => e.courseId === c.id).map((e) => {
      const u = userOf(e.userId);
      const cert = db.certificates.find((x) => x.userId === e.userId && x.courseId === c.id);
      return {
        "Student": u?.name || "—", "Email": u?.email || "", "Phone": u?.phone || "",
        "College": u?.college || "", "Enrolled on": fmtDate(e.at),
        "Lessons done": e.done.length, "Total lessons": tot,
        "Progress %": tot ? Math.round((e.done.length / tot) * 100) : 0,
        "Status": tot && e.done.length === tot ? "Completed" : "In progress",
        "Paid (INR)": paidFor(e.userId, c.id),
        "Certificate": cert ? cert.certNo : "Not issued",
      };
    });
    add(rows, c.title, [22, 28, 14, 20, 14, 12, 12, 11, 13, 12, 20]);
  });

  return wb;
}

function AdminExport({ db }) {
  const [done, setDone] = useState("");
  const students = db.users.filter((u) => u.role === "student");

  function download() {
    const wb = buildWorkbook(db);
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `AdvancedVLSI-report-${stamp}.xlsx`);
    setDone(`Downloaded with ${db.courses.length + 5} sheets.`);
    setTimeout(() => setDone(""), 4000);
  }

  const sheets = [
    ["Summary", "One row per course: enrolled count, seats left, completions, certificates and revenue."],
    ["All students", "Every registered student with contact details, which courses they took and what they paid."],
    ["All enrollments", "Every student-course pair with progress percentage and certificate number."],
    ["Payments", "Each transaction with its Razorpay payment ID and coupon used."],
    ["Certificates", "Certificate numbers, issue dates and file names."],
    ["One sheet per program", `A separate tab for each of your ${db.courses.length} courses and internships, listing only that program's students.`],
  ];

  return (
    <>
      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <FileSpreadsheet size={26} color={C.ok} style={{ marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ fontSize: 17 }}>Export everything to Excel</h3>
            <p style={{ fontSize: 14, color: C.muted, marginTop: 6, lineHeight: 1.55 }}>
              Builds a fresh workbook from your current data, so every export is up to date. Opens in Excel,
              Google Sheets or LibreOffice.
            </p>
            <p style={{ fontSize: 13.5, color: C.ink2, marginTop: 10 }}>
              {students.length} students · {db.enrollments.length} enrollments · {db.courses.length} courses
            </p>
            <button className="btn btn-p btn-sm" onClick={download} style={{ marginTop: 14 }}>
              <Download size={15} /> Download .xlsx
            </button>
            {done && <p style={{ fontSize: 13, color: C.ok, marginTop: 10 }}>{done}</p>}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "6px 18px 12px" }}>
        <p className="lab" style={{ paddingTop: 14, paddingBottom: 4 }}>What's inside the workbook</p>
        {sheets.map(([n, d]) => (
          <div key={n} className="tick" style={{ padding: "12px 0", borderBottom: "1px solid #EFEDE4" }}>
            <p style={{ fontSize: 14.5, fontWeight: 600 }}>{n}</p>
            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{d}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================================================== */
/*  ADMIN — SHELL                                                      */
/* ================================================================== */
function Admin({ db, setDB, persist }) {
  const [tab, setTab] = useState("overview");
  const [ns, setNS] = useState({ courseId: db.courses[0]?.id || "", title: "", date: "", time: "20:00", dur: 120, meetUrl: "" });

  const revenue = db.payments.reduce((a, p) => a + p.amount, 0);
  const students = db.users.filter((u) => u.role === "student");
  const weekAgo = Date.now() - 7 * 864e5;
  const newThisWeek = students.filter((u) => u.joined > weekAgo).length;

  function addSession() {
    if (!ns.title.trim() || !ns.date) return;
    const start = new Date(`${ns.date}T${ns.time}`).getTime();
    const s = { id: uid(), courseId: ns.courseId, title: ns.title.trim(), start, dur: Number(ns.dur) || 60, meetUrl: ns.meetUrl.trim() || "https://meet.google.com/new" };
    const next = { ...db, sessions: [...db.sessions, s] };
    setDB(next); persist(next);
    setNS({ ...ns, title: "", meetUrl: "" });
  }
  const delSession = (id) => { const n = { ...db, sessions: db.sessions.filter((s) => s.id !== id) }; setDB(n); persist(n); };
  const setMeet = (id, meetUrl) => { const n = { ...db, sessions: db.sessions.map((s) => (s.id === id ? { ...s, meetUrl } : s)) }; setDB(n); persist(n); };

  const Stat = ({ k, v, sub }) => (
    <div className="card" style={{ padding: 16 }}>
      <p className="lab">{k}</p>
      <p className="disp" style={{ fontSize: 26, fontWeight: 700, marginTop: 5 }}>{v}</p>
      {sub && <p style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{sub}</p>}
    </div>
  );

  const TABS = [
    ["overview", "Overview"], ["teachers", "Teachers"], ["courses", "Courses & internships"],
    ["sessions", "Live sessions"], ["students", "Students"], ["certs", "Certificates"],
    ["payments", "Payments"], ["export", "Export"],
  ];

  return (
    <div>
      <h1 style={{ fontSize: 25 }}>Admin</h1>
      <p style={{ fontSize: 14.5, color: C.muted, marginTop: 5 }}>Manage teachers, courses, live sessions, certificates and payments.</p>

      <div style={{ display: "flex", gap: 6, margin: "20px 0", flexWrap: "wrap" }}>
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="btn btn-sm"
            style={tab === k ? { background: C.ink, color: "#fff" } : { border: `1px solid ${C.line}`, background: "#fff", color: C.ink2 }}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
            <Stat k="Registered students" v={students.length} sub={`${newThisWeek} in the last 7 days`} />
            <Stat k="Enrollments" v={db.enrollments.length} sub="paid course seats" />
            <Stat k="Revenue" v={inr(revenue)} sub="including GST" />
            <Stat k="Teachers" v={db.teachers.length} />
            <Stat k="Courses live" v={db.courses.filter((c) => !isIntern(c) && c.published !== false).length} sub={`${db.courses.filter((c) => !isIntern(c)).length} total`} />
            <Stat k="Internships live" v={db.courses.filter((c) => isIntern(c) && c.published !== false).length}
              sub={`${db.enrollments.filter((e) => isIntern(db.courses.find((c) => c.id === e.courseId))).length} enrolled`} />
            <Stat k="Certificates issued" v={db.certificates.length} />
          </div>

          <h2 style={{ fontSize: 18, marginTop: 28, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={17} color={C.brand} /> Recent registrations
          </h2>
          <div className="card" style={{ overflow: "auto" }}>
            {students.length === 0 ? (
              <p style={{ padding: 22, fontSize: 14.5, color: C.muted }}>
                Nobody has registered yet. Open the landing page and create a test account to see this fill up.
              </p>
            ) : (
              <table className="t">
                <thead><tr><th>Name</th><th className="hide-sm">Email</th><th className="hide-sm">College</th><th>Registered</th><th>Courses</th></tr></thead>
                <tbody>
                  {students.slice().sort((a, b) => b.joined - a.joined).slice(0, 8).map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td className="hide-sm" style={{ color: C.muted }}>{u.email}</td>
                      <td className="hide-sm" style={{ color: C.muted }}>{u.college || "—"}</td>
                      <td style={{ color: C.muted }}>{fmtDate(u.joined)}</td>
                      <td>{db.enrollments.filter((e) => e.userId === u.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "teachers" && <AdminTeachers db={db} setDB={setDB} persist={persist} />}
      {tab === "export" && <AdminExport db={db} />}
      {tab === "courses" && <AdminCourses db={db} setDB={setDB} persist={persist} />}
      {tab === "certs" && <AdminCerts db={db} setDB={setDB} persist={persist} />}

      {tab === "sessions" && (
        <>
          <div className="card" style={{ padding: 18, marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Schedule a live class</h3>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
              <label><span className="lab">Course</span>
                <select value={ns.courseId} onChange={(e) => setNS({ ...ns, courseId: e.target.value })} style={{ marginTop: 5 }}>
                  {db.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select></label>
              <label><span className="lab">Topic</span>
                <input value={ns.title} onChange={(e) => setNS({ ...ns, title: e.target.value })} placeholder="Clock domain crossing" style={{ marginTop: 5 }} /></label>
              <label><span className="lab">Date</span>
                <input type="date" value={ns.date} onChange={(e) => setNS({ ...ns, date: e.target.value })} style={{ marginTop: 5 }} /></label>
              <label><span className="lab">Time</span>
                <input type="time" value={ns.time} onChange={(e) => setNS({ ...ns, time: e.target.value })} style={{ marginTop: 5 }} /></label>
              <label><span className="lab">Duration</span>
                <select value={ns.dur} onChange={(e) => setNS({ ...ns, dur: Number(e.target.value) })} style={{ marginTop: 5 }}>
                  {[60, 90, 120, 150, 180, 210, 240].map((m) => <option key={m} value={m}>{fmtDur(m)}</option>)}
                </select></label>
              <label style={{ gridColumn: "1 / -1" }}><span className="lab">Google Meet link</span>
                <input value={ns.meetUrl} onChange={(e) => setNS({ ...ns, meetUrl: e.target.value })} placeholder="https://meet.google.com/abc-defg-hij" style={{ marginTop: 5 }} /></label>
            </div>
            <button className="btn btn-p btn-sm" onClick={addSession} style={{ marginTop: 14 }}><Plus size={15} /> Add session</button>
          </div>

          <div className="card" style={{ padding: "6px 16px 10px" }}>
            {db.sessions.slice().sort((a, b) => a.start - b.start).map((s) => {
              const c = db.courses.find((x) => x.id === s.courseId);
              return (
                <div key={s.id} style={{ padding: "13px 0", borderBottom: "1px solid #EFEDE4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</p>
                      <p style={{ fontSize: 13.5, color: C.muted, marginTop: 2 }}>
                        {c?.title || "Course removed"} · {fmtDay(s.start)}, {fmtRange(s)} · {fmtDur(s.dur)}
                      </p>
                    </div>
                    <button onClick={() => delSession(s.id)} style={{ color: C.led }} aria-label="Delete session"><Trash2 size={15} /></button>
                  </div>
                  <input value={s.meetUrl} onChange={(e) => setMeet(s.id, e.target.value)} style={{ marginTop: 9, fontSize: 13.5 }} placeholder="https://meet.google.com/abc-defg-hij" />
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "students" && (
        <div className="card" style={{ overflow: "auto" }}>
          {students.length === 0 ? (
            <p style={{ padding: 22, fontSize: 14.5, color: C.muted }}>No students registered yet.</p>
          ) : (
            <table className="t">
              <thead><tr><th>Name</th><th>Email</th><th className="hide-sm">Phone</th><th className="hide-sm">College</th><th>Joined</th><th>Courses</th></tr></thead>
              <tbody>
                {students.slice().sort((a, b) => b.joined - a.joined).map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ color: C.muted }}>{u.email}</td>
                    <td className="hide-sm" style={{ color: C.muted }}>{u.phone || "—"}</td>
                    <td className="hide-sm" style={{ color: C.muted }}>{u.college || "—"}</td>
                    <td style={{ color: C.muted }}>{fmtDate(u.joined)}</td>
                    <td>{db.enrollments.filter((e) => e.userId === u.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "payments" && (
        <div className="card" style={{ overflow: "auto" }}>
          {db.payments.length === 0 ? (
            <p style={{ padding: 22, fontSize: 14.5, color: C.muted }}>No payments recorded yet.</p>
          ) : (
            <table className="t">
              <thead><tr><th>Payment ID</th><th>Student</th><th className="hide-sm">Course</th><th className="hide-sm">Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {db.payments.slice().reverse().map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>{p.rzpPaymentId}</td>
                    <td>{db.users.find((u) => u.id === p.userId)?.name || "—"}</td>
                    <td className="hide-sm" style={{ color: C.muted }}>{db.courses.find((c) => c.id === p.courseId)?.title}</td>
                    <td className="hide-sm" style={{ color: C.muted }}>{fmtDate(p.at)}</td>
                    <td style={{ fontWeight: 600 }}>{inr(p.amount)}</td>
                    <td><span className="tag" style={{ background: "#E3F4ED", color: "#0B5D45" }}>Captured</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  APP                                                                */
/* ================================================================== */
export default function App() {
  const [db, setDB] = useState(emptyDB());
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState({ name: "landing" });
  const [nav, setNav] = useState("overview");
  const [auth, setAuth] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [cert, setCert] = useState(null);
  const [openSession, setOpenSession] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { loadDB().then((d) => { setDB(d); setReady(true); }); }, []);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, []);

  const persist = (d) => saveDB(d);
  const myEnr = useMemo(() => (user ? db.enrollments.filter((e) => e.userId === user.id) : []), [db, user]);
  const isEnrolled = (cid) => myEnr.some((e) => e.courseId === cid);
  const programOf = (e) => db.courses.find((c) => c.id === e.courseId);
  const myCourseEnr = myEnr.filter((e) => !isIntern(programOf(e)));
  const myInternEnr = myEnr.filter((e) => isIntern(programOf(e)));
  const myCert = (cid) => (user ? db.certificates.find((c) => c.userId === user.id && c.courseId === cid) : null);

  const nextLive = useMemo(() => {
    const up = db.sessions.filter((s) => sessionState(s, now) !== "over").sort((a, b) => a.start - b.start)[0];
    if (!up) return null;
    return { ...up, state: sessionState(up, now), courseTitle: db.courses.find((c) => c.id === up.courseId)?.title || "" };
  }, [db, now]);

  const mySessions = useMemo(() => {
    const ids = myEnr.map((e) => e.courseId);
    return db.sessions.filter((s) => ids.includes(s.courseId)).sort((a, b) => a.start - b.start);
  }, [db, myEnr]);

  /* The next session a student can actually act on for a course */
  const nextSessionFor = (courseId) =>
    db.sessions
      .filter((s) => s.courseId === courseId && sessionState(s, now) !== "over")
      .sort((a, b) => a.start - b.start)[0] || null;

  function startEnroll(course) {
    if (!user) return setAuth("register");
    setCheckout(course);
  }
  function onPaid(payment) {
    const enr = { id: uid(), userId: user.id, courseId: payment.courseId, at: Date.now(), done: [] };
    const next = { ...db, payments: [...db.payments, payment], enrollments: [...db.enrollments, enr] };
    setDB(next); persist(next);
    setCheckout(null);
    setView({ name: "room", id: payment.courseId });
    setNav("courses");
  }
  function toggleLessons(courseId, keys, on) {
    const next = {
      ...db,
      enrollments: db.enrollments.map((e) => {
        if (e.userId !== user.id || e.courseId !== courseId) return e;
        const s = new Set(e.done);
        keys.forEach((k) => (on ? s.add(k) : s.delete(k)));
        return { ...e, done: [...s] };
      }),
    };
    setDB(next); persist(next);
  }
  const logout = () => { setUser(null); setView({ name: "landing" }); setNav("overview"); };

  if (!ready) {
    return <div className="ql" style={{ display: "grid", placeItems: "center", padding: 60 }}>
      <style>{CSS}</style><p style={{ color: C.muted }}>Loading…</p>
    </div>;
  }

  /* ---------------- logged out ---------------- */
  if (!user) {
    return (
      <div className="ql">
        <style>{CSS}</style>
        {view.name === "course" ? (
          <div style={{ minHeight: "100vh" }}>
            <div style={{ background: C.ink, padding: "14px 22px" }}>
              <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={() => setView({ name: "landing" })}><Logo light /></button>
                <button className="btn btn-sm" style={{ background: "#fff", color: C.ink }} onClick={() => setAuth("register")}>Register</button>
              </div>
            </div>
            <CourseDetail course={db.courses.find((c) => c.id === view.id)} db={db} user={null} enrolled={false}
              onBack={() => setView({ name: "landing" })} onEnroll={() => setAuth("register")} />
          </div>
        ) : (
          <Landing db={db} nextLive={nextLive} onAuth={setAuth} onOpenCourse={(id) => setView({ name: "course", id })} />
        )}
        {auth && (
          <Auth mode={auth} setMode={setAuth} db={db} setDB={setDB} onClose={() => setAuth(null)}
            onDone={(u) => { setUser(u); setAuth(null); setView({ name: "app" }); setNav(u.role === "admin" ? "admin" : "overview"); }} />
        )}
      </div>
    );
  }

  /* ---------------- logged in ---------------- */
  const course = view.id ? db.courses.find((c) => c.id === view.id) : null;
  const enr = course ? myEnr.find((e) => e.courseId === course.id) : null;

  const navItems = user.role === "admin"
    ? [["admin", "Admin panel", Settings], ["overview", "Student view", BookOpen]]
    : [["overview", "Overview", BookOpen], ["courses", "My courses", Video],
       ["internships", "Internships", GraduationCap], ["schedule", "Schedule", Calendar],
       ["certs", "Certificates", Award]];

  return (
    <div className="ql">
      <style>{CSS}</style>

      <div style={{ background: C.ink, padding: "13px 22px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => { setView({ name: "app" }); setNav(user.role === "admin" ? "admin" : "overview"); }}><Logo light /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ color: "#BDB9AC", fontSize: 14 }} className="hide-sm">
              {user.name}{user.role === "admin" ? " · admin" : ""}
            </span>
            <button className="btn btn-sm" style={{ color: "#BDB9AC" }} onClick={logout}><LogOut size={15} /> Log out</button>
          </div>
        </div>
      </div>

      <div className="shell" style={{ maxWidth: 1180, margin: "0 auto", padding: 22, display: "flex", gap: 26, alignItems: "flex-start" }}>
        <nav className="side">
          <div className="snavwrap" style={{ display: "grid", gap: 3 }}>
            {navItems.map(([k, label, Icon]) => (
              <button key={k} className={`snav ${nav === k && view.name === "app" ? "on" : ""}`}
                onClick={() => { setNav(k); setView({ name: "app" }); }}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </nav>

        <main style={{ flex: 1, minWidth: 0 }}>
          {view.name === "course" && course && (
            <CourseDetail course={course} db={db} user={user} enrolled={isEnrolled(course.id)}
              onBack={() => setView({ name: "app" })} onEnroll={() => startEnroll(course)} />
          )}

          {view.name === "room" && course && enr && (
            <CourseRoom course={course} enr={enr} db={db} now={now} cert={myCert(course.id)}
              onToggle={(keys, on) => toggleLessons(course.id, keys, on)}
              onCert={() => setCert(myCert(course.id))}
              onOpenSession={setOpenSession}
              onBack={() => { setView({ name: "app" }); setNav("courses"); }} />
          )}

          {view.name === "app" && nav === "admin" && user.role === "admin" && (
            <Admin db={db} setDB={setDB} persist={persist} />
          )}

          {view.name === "app" && nav === "overview" && (
            <>
              <h1 style={{ fontSize: 25 }}>Hello, {user.name.split(" ")[0]}</h1>
              <p style={{ fontSize: 14.5, color: C.muted, marginTop: 5 }}>
                {myEnr.length === 0 ? "You haven't enrolled in a course yet." : `You have ${myEnr.length} course${myEnr.length > 1 ? "s" : ""} in progress.`}
              </p>

              {mySessions.filter((s) => sessionState(s, now) !== "over").length > 0 && (
                <div className="card" style={{ padding: "6px 16px", marginTop: 20 }}>
                  <p className="lab" style={{ paddingTop: 12 }}>Upcoming live classes</p>
                  {mySessions.filter((s) => sessionState(s, now) !== "over").slice(0, 4).map((s) => (
                    <SessionRow key={s.id} s={s} now={now} onOpen={setOpenSession}
                      courseTitle={db.courses.find((c) => c.id === s.courseId)?.title} />
                  ))}
                </div>
              )}

              {myEnr.length > 0 && (
                <>
                  <h2 style={{ fontSize: 18, marginTop: 28, marginBottom: 12 }}>Your progress</h2>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
                    {myEnr.map((e) => {
                      const c = db.courses.find((x) => x.id === e.courseId);
                      if (!c) return null;
                      const tot = lessonCount(c);
                      return (
                        <button key={e.id} className="card" style={{ padding: 16, textAlign: "left" }} onClick={() => setView({ name: "room", id: c.id })}>
                          <h3 style={{ fontSize: 16, lineHeight: 1.25 }}>{c.title}</h3>
                          <p style={{ fontSize: 13.5, color: C.muted, margin: "6px 0 11px" }}>{e.done.length} of {tot} lessons</p>
                          <Seg done={e.done.length} total={tot} />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <h2 style={{ fontSize: 18, marginTop: 30, marginBottom: 12 }}>
                {myEnr.length === 0 ? "Start with a program" : "More programs"}
              </h2>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
                {db.courses.filter((c) => c.published !== false && !isEnrolled(c.id)).slice(0, 6).map((c) => {
                  const t = db.teachers.find((x) => x.id === c.teacherId);
                  return (
                    <button key={c.id} className="card" style={{ padding: 0, textAlign: "left", overflow: "hidden" }} onClick={() => setView({ name: "course", id: c.id })}>
                      <Thumb id={c.id} hasThumb={c.thumb} track={c.track} height={110} />
                      <div style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 16, lineHeight: 1.25 }}>{c.title}</h3>
                        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 7 }}>{c.weeks} weeks{t ? ` · ${t.name}` : ""}</p>
                        <p className="disp" style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>{inr(c.price)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view.name === "app" && nav === "courses" && (
            <>
              <h1 style={{ fontSize: 25 }}>My courses</h1>
              {myCourseEnr.length === 0 ? (
                <Empty icon={BookOpen} action={<button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => setNav("overview")}>Browse courses</button>}>
                  Courses you enroll in will show up here.
                </Empty>
              ) : (
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginTop: 18 }}>
                  {myCourseEnr.map((e) => {
                    const c = db.courses.find((x) => x.id === e.courseId);
                    if (!c) return null;
                    const tot = lessonCount(c), pct = tot ? Math.round((e.done.length / tot) * 100) : 0;
                    const nxt = nextSessionFor(c.id);
                    const live = nxt && sessionState(nxt, now) === "live";
                    return (
                      <div key={e.id} className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ cursor: "pointer" }} onClick={() => setView({ name: "room", id: c.id })}>
                          <Thumb id={c.id} hasThumb={c.thumb} track={c.track} height={132} />
                          <div style={{ padding: "14px 16px 0" }}>
                            <h3 style={{ fontSize: 16.5, lineHeight: 1.3 }}>{c.title}</h3>
                            <p style={{ fontSize: 13.5, color: C.muted, margin: "6px 0 12px" }}>{c.schedule}</p>
                            <Seg done={e.done.length} total={tot} />
                            <p style={{ fontSize: 13.5, marginTop: 9, color: pct === 100 ? C.ok : C.muted, fontWeight: pct === 100 ? 600 : 400 }}>
                              {pct === 100 ? "Complete" : `${pct}% complete`}
                            </p>
                          </div>
                        </div>

                        <div style={{ padding: "14px 16px 16px", marginTop: "auto" }}>
                          {nxt ? (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                                {live && <span className="led" />}
                                <p style={{ fontSize: 13, color: live ? C.led : C.muted, fontWeight: live ? 600 : 400 }}>
                                  {live ? "Live now" : `${fmtDay(nxt.start)}, ${fmtRange(nxt)}`}
                                </p>
                              </div>
                              <button className={`btn btn-sm ${live ? "btn-p" : "btn-o"}`} style={{ width: "100%" }}
                                onClick={() => setOpenSession(nxt)}>
                                <Video size={15} /> {live ? "Join class" : "View class details"}
                              </button>
                            </>
                          ) : (
                            <p style={{ fontSize: 13, color: C.muted }}>No sessions scheduled yet.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {view.name === "app" && nav === "internships" && (
            <>
              <h1 style={{ fontSize: 25 }}>Internships</h1>
              <p style={{ fontSize: 14.5, color: C.muted, marginTop: 5 }}>
                Six-month supervised programs with weekly mentor reviews and a certificate at the end.
              </p>

              {myInternEnr.length > 0 && (
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginTop: 18 }}>
                  {myInternEnr.map((e) => {
                    const c = programOf(e);
                    if (!c) return null;
                    const tot = lessonCount(c), pct = tot ? Math.round((e.done.length / tot) * 100) : 0;
                    const nxt = nextSessionFor(c.id);
                    const live = nxt && sessionState(nxt, now) === "live";
                    return (
                      <div key={e.id} className="card" style={{ overflow: "hidden", borderTop: `3px solid ${C.olive}`, display: "flex", flexDirection: "column" }}>
                        <div style={{ cursor: "pointer", padding: "16px 16px 0" }} onClick={() => setView({ name: "room", id: c.id })}>
                          <span className="tag" style={{ background: C.olive, color: "#fff" }}>{c.months} months</span>
                          <h3 style={{ fontSize: 16.5, marginTop: 10, lineHeight: 1.3 }}>{c.title}</h3>
                          <p style={{ fontSize: 13.5, color: C.muted, margin: "6px 0 12px" }}>{c.schedule}</p>
                          <Seg done={e.done.length} total={tot} />
                          <p style={{ fontSize: 13.5, marginTop: 9, color: pct === 100 ? C.ok : C.muted, fontWeight: pct === 100 ? 600 : 400 }}>
                            {pct === 100 ? "Complete" : `${pct}% complete`}
                          </p>
                        </div>
                        <div style={{ padding: "14px 16px 16px", marginTop: "auto" }}>
                          {nxt ? (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                                {live && <span className="led" />}
                                <p style={{ fontSize: 13, color: live ? C.led : C.muted, fontWeight: live ? 600 : 400 }}>
                                  {live ? "Live now" : `${fmtDay(nxt.start)}, ${fmtRange(nxt)}`}
                                </p>
                              </div>
                              <button className={`btn btn-sm ${live ? "btn-p" : "btn-o"}`} style={{ width: "100%" }} onClick={() => setOpenSession(nxt)}>
                                <Video size={15} /> {live ? "Join session" : "View session details"}
                              </button>
                            </>
                          ) : (
                            <p style={{ fontSize: 13, color: C.muted }}>No sessions scheduled yet.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {db.courses.filter((c) => isIntern(c) && c.published !== false && !isEnrolled(c.id)).length > 0 && (
                <>
                  <h2 style={{ fontSize: 18, marginTop: myInternEnr.length ? 30 : 20, marginBottom: 12 }}>
                    {myInternEnr.length ? "Other internships" : "Available internships"}
                  </h2>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}>
                    {db.courses.filter((c) => isIntern(c) && c.published !== false && !isEnrolled(c.id)).map((c) => {
                      const tt = db.teachers.find((x) => x.id === c.teacherId);
                      return (
                        <button key={c.id} className="card" style={{ padding: 18, textAlign: "left", borderTop: `3px solid ${C.olive}` }}
                          onClick={() => setView({ name: "course", id: c.id })}>
                          <span className="tag" style={{ background: "#EAEBDB", color: C.brandDeep }}>{c.months} months</span>
                          <h3 style={{ fontSize: 16.5, marginTop: 10, lineHeight: 1.3 }}>{c.title}</h3>
                          <p style={{ fontSize: 13.5, color: C.muted, marginTop: 7, lineHeight: 1.5 }}>
                            {tt ? `Mentored by ${tt.name}` : "Mentor to be assigned"}
                          </p>
                          <p className="disp" style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>{inr(c.price)}</p>
                          <p style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>training and certificate included</p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {view.name === "app" && nav === "schedule" && (
            <>
              <h1 style={{ fontSize: 25 }}>Schedule</h1>
              <p style={{ fontSize: 14.5, color: C.muted, marginTop: 5 }}>Each join link becomes active 15 minutes before the class starts.</p>
              {mySessions.length === 0 ? (
                <Empty icon={Calendar}>Enroll in a course and your classes will appear here.</Empty>
              ) : (
                <div className="card" style={{ padding: "4px 16px", marginTop: 18 }}>
                  {mySessions.map((s) => (
                    <SessionRow key={s.id} s={s} now={now} onOpen={setOpenSession}
                      courseTitle={db.courses.find((c) => c.id === s.courseId)?.title} />
                  ))}
                </div>
              )}
            </>
          )}

          {view.name === "app" && nav === "certs" && (
            <>
              <h1 style={{ fontSize: 25 }}>Certificates</h1>
              <p style={{ fontSize: 14.5, color: C.muted, marginTop: 5 }}>
                Once you finish a course, Advanced VLSI verifies it and uploads your certificate here for download.
              </p>
              {myEnr.length === 0 ? (
                <Empty icon={GraduationCap}>Enroll in a course to start working towards a certificate.</Empty>
              ) : (
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginTop: 18 }}>
                  {myEnr.map((e) => {
                    const c = db.courses.find((x) => x.id === e.courseId);
                    if (!c) return null;
                    const cr = myCert(c.id), tot = lessonCount(c), isDone = e.done.length === tot;
                    return (
                      <div key={e.id} className="card" style={{ padding: 18, borderTop: `3px solid ${cr ? C.brass : C.line}` }}>
                        {cr ? <Award size={20} color={C.brass} /> : <Lock size={19} color={C.muted} />}
                        <h3 style={{ fontSize: 16.5, marginTop: 10, lineHeight: 1.3 }}>{c.title}</h3>
                        {cr ? (
                          <>
                            <p style={{ fontSize: 13, color: C.muted, marginTop: 7, fontFamily: "ui-monospace, monospace" }}>{cr.certNo}</p>
                            <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Issued {fmtDate(cr.uploadedAt)} · {fmtSize(cr.size)}</p>
                            <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => setCert(cr)}>
                              <Download size={15} /> Download
                            </button>
                          </>
                        ) : (
                          <p style={{ fontSize: 13.5, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
                            {isDone ? "Course complete. Your certificate will be uploaded after verification."
                                    : `${tot - e.done.length} lessons still to finish.`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {checkout && <Checkout course={checkout} user={user} onPaid={onPaid} onClose={() => setCheckout(null)} />}
      {cert && <CertViewer cert={cert} course={db.courses.find((c) => c.id === cert.courseId)} onClose={() => setCert(null)} />}
      {openSession && (() => {
        const sc = db.courses.find((c) => c.id === openSession.courseId);
        return (
          <SessionModal s={openSession} course={sc} now={now}
            teacher={sc ? db.teachers.find((x) => x.id === sc.teacherId) : null}
            onClose={() => setOpenSession(null)} />
        );
      })()}
    </div>
  );
}
