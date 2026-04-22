# Stilwater Partner Platform — Prototype

End-to-end prototype of the Stilwater partner platform for wellness providers
like **SHARAN** and **Amar Eye Yoga**. It demonstrates the full patient journey
the brief describes:

1. **Meta / Instagram ad** — user sees a creative and shows interest.
2. **Lead captured** — name, phone, preferred mode of contact saved to the
   Stilwater "sheet" (JSON store with a CSV export that mimics Excel).
3. **WhatsApp AI agent** — sends an opening message, answers FAQs, shares the
   Stilwater + provider website links, offers booking.
4. **AI-avatar consultation** — free triage by "Maya", a scripted avatar that
   collects history and auto-generates a transcript.
5. **Doctor calendar & booking** — same availability on the Stilwater page and
   the provider microsite. Mock Razorpay order + capture.
6. **Consultation room** — simulated video call with record → transcribe →
   summary → auto-generated follow-up actions, which are pushed back to the
   patient over WhatsApp.
7. **Website chatbot widget** — same AI agent available on every page.

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

No external accounts are required — Razorpay, WhatsApp, speech-to-text and the
LLM are simulated deterministically so the full flow works offline.

## Recommended walkthrough

1. Open `/ad-simulator`, pick a creative, submit the lead form.
2. You're taken to `/whatsapp/<leadId>` — a simulated WhatsApp thread with the
   Stilwater AI agent. Try asking about price, diabetes, eye yoga, or booking.
3. Click **Book in-person slot** → pick a doctor and a slot on the calendar.
4. Mock Razorpay checkout at `/pay/<consultId>` → Simulate successful payment.
5. Land in the consultation room at `/consultation/<consultId>` — press
   **Start recording**, then **End & transcribe** to generate the transcript
   and follow-up actions. A WhatsApp follow-up message is auto-sent.
6. Open `/admin` to see the Leads sheet (with CSV export), all consultations
   and all transcripts.

Alternative: try `/avatar` for the free AI-avatar consultation flow.

## File layout

- `src/app/` — Next.js App Router pages and API routes
- `src/lib/db.ts` — JSON-file data store (Excel sheet replacement)
- `src/lib/agent.ts` — rule-based AI agent used on WhatsApp + website
- `src/lib/transcribe.ts` — deterministic transcript/action generator
- `src/components/ChatWidget.tsx` — reusable website chatbot
- `src/components/Calendar.tsx` — 7-day availability picker
- `data/db.json` — created at first run; ignored by git

## Swap-in production services

| Prototype piece | Production swap |
|---|---|
| JSON file store | Postgres / Supabase |
| `agent.ts` rules | Claude or GPT with tools + provider FAQ retrieval |
| WhatsApp simulator | Meta WhatsApp Business Cloud API |
| Razorpay mock | Real Razorpay Orders + Checkout + webhooks |
| `transcribe.ts` | Whisper / AssemblyAI + LLM summariser |
| AI avatar | HeyGen / D-ID / Simli + streaming LLM |
