# Stilwater Partner Platform — Prototype

End-to-end prototype of Stilwater, a multi-tenant partner platform for wellness
providers like **SHARAN** and **Amar Eye Yoga**. It demonstrates the complete
lifecycle:

**Lead → AI outreach → Partner agent workspace → Payment link → Invoice →
Patient onboarding → Videos/chatbot/avatar/reports → Consultation →
Prescription → Follow-up.**

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Prereq: Node ≥ 18.17. The whole stack runs offline — Razorpay, WhatsApp, email,
ASR and the LLM are all deterministic mocks behind clean interfaces.

## Demo credentials

All accounts below use password **`password123`**.

| Role | Email |
|---|---|
| **SHARAN_ADMIN (CRM)** | `sharan_admin@stilwater.demo` |
| **AMAR_ADMIN (CRM)** | `amar_admin@stilwater.demo` |
| Stilwater super-admin | `admin@stilwater.demo` |
| SHARAN owner | `owner@sharan.demo` |
| SHARAN admin | `admin@sharan.demo` |
| SHARAN agent (makes calls) | `agent@sharan.demo` |
| SHARAN doctor | `doctor@sharan.demo` |
| Amar Eye Yoga owner | `owner@amareye.demo` |
| Amar Eye Yoga agent | `agent@amareye.demo` |

Patient accounts are created automatically after a program payment. Patients
sign in with their phone + OTP at `/patient/login` — the dev OTP is shown on
screen.

## Recommended end-to-end walkthrough

### Part 1 — lead captured, AI call, payment

1. `/ad-simulator` — pick a creative, fill your name + phone (use a phone you
   can remember, e.g. `+91 9000000001`), submit.
2. A WhatsApp thread auto-opens at `/whatsapp/<leadId>`.
3. Sign in at `/login` as `agent@sharan.demo` / `password123`.
4. `/partner/leads/<id>` for that lead — open the **Call panel**:
   - Try a **Human call**: start → end → log outcome & notes.
   - Try an **AI call** in any of 8 Indian languages. Watch the transcript
     appear in real time. The AI hangs up once the lead agrees to purchase.
5. Click **Send program payment link**. The payment link is pushed to WhatsApp
   + email (simulated).

### Part 2 — patient pays, gets onboarded

6. Click the `/pay-link/<token>` URL shown on the lead page (or copy the one
   from the simulated WhatsApp message).
7. Click **Pay ₹…** → invoice page opens automatically; the patient account
   is created and onboarding link is sent on WhatsApp + email.
8. Sign out (top-right). Go to `/patient/login`, enter the same phone number,
   receive the dev OTP on screen, sign in.

### Part 3 — patient explores, books, uploads reports

9. `/patient/dashboard` — see journey.
10. `/patient/videos` — browse Dr. Nandita's library.
11. `/patient/reports` — upload a file (any PDF/image works).
12. `/patient/chatbot` — chat until credits run out, then top up (₹499).
13. `/patient/avatar` — buy avatar credits (₹999) then start session at
    `/avatar?...`.
14. `/patient/consultations` → **Book new slot** → pay → land in the
    consultation room.

### Part 4 — doctor issues prescription

15. Sign in as `doctor@sharan.demo`.
16. Open `/partner/doctor` → pick the consultation → **Start recording**,
    **End & transcribe**.
17. The **Issue prescription** panel appears: add medicines, lifestyle,
    follow-up days → **Issue prescription**. The patient sees it at
    `/patient/prescriptions` and is notified on WhatsApp + email.
18. Patient returns to `/patient/consultations` and books the follow-up.

### Part 5 — admin surfaces

- `/partner/team` (owner / admin) — create & role-edit staff accounts.
- `/partner/calls` — full call log across the org (scoped to the provider).
- `/partner/payments` — all payment links & invoices.
- `/admin` — Stilwater super-admin only; sees across all providers.

## Architecture

```
src/
├── lib/
│   ├── db.ts              JSON-file store (data/db.json)
│   ├── types.ts           All data types
│   ├── auth.ts            Cookie session + scrypt password + role helpers
│   ├── agent.ts           Rule-based AI for website/WhatsApp chat
│   ├── transcribe.ts      Fake ASR + summary + actions
│   ├── messaging.ts       Simulated WhatsApp/email push
│   ├── languages.ts       Scripts for AI calls in 8 languages
│   └── slots.ts           Calendar helpers
├── app/
│   ├── api/               All backend routes (auth, calls, payment-links, …)
│   ├── login, patient/login       sign-in
│   ├── partner/           partner staff portal (layout + role-gated pages)
│   ├── patient/           patient portal (layout + pages)
│   ├── consultation/[id]  shared room: record → transcribe → prescribe
│   ├── pay-link/[token]   public payment page (triggers invoice)
│   ├── invoice/[id]       printable invoice
│   ├── admin              Stilwater super-admin console
│   └── ad-simulator, whatsapp, book, pay, avatar, providers/[id]
└── components/            ChatWidget, Calendar, LogoutButton, PrintButton
```

## Production swap-ins

| Prototype piece | Swap with |
|---|---|
| JSON store | Postgres / Supabase / PlanetScale |
| Cookie session | Clerk / Auth.js / custom JWT |
| `agent.ts` rules | Claude or GPT + retrieval over provider FAQ |
| Simulated WhatsApp | WhatsApp Business Cloud API (via Meta) |
| Simulated email | SendGrid / Resend / SES |
| Razorpay mock | Real Razorpay Orders + Payment Links + webhooks |
| `transcribe.ts` | Whisper / AssemblyAI + LLM summariser |
| AI avatar | HeyGen / D-ID / Simli + streaming LLM |
| AI voice call | Bland / Vapi / Retell + multilingual TTS |
| File uploads | S3 / Supabase Storage with signed URLs |
| Invoice PDF | Server-side PDF renderer (puppeteer / pdfkit) |

## Data reset

Delete `data/db.json` to start clean; it regenerates with seeded providers,
users, programs and videos on the next request.
