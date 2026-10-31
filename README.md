# LabelLens

**Understand what's inside. Scan a product label and see what it actually says.**

LabelLens is a multimodal product-label assistant built on Next.js. You upload or photograph a
product label; the image is sent to a Google GenAI multimodal model; the structured result is
validated with Zod; the report is saved to MongoDB Atlas and rendered with **Label Truth Mode**,
which keeps three things strictly apart:

| Bucket | Meaning |
| --- | --- |
| **On Label** | Text copied verbatim from the packaging. |
| **AI Explanation** | The model's plain-language description. Never presented as printed fact. |
| **Not Verified** | Unreadable or absent information, reported as such instead of guessed. |

> Inference runs on the **hosted Gemini API**. It does not run locally.

---

## What is real

- **Real image analysis** — the original uploaded bytes go to the model. No mock responses.
- **Real validation** — `lib/schema.ts` rejects anything that does not match the contract
  (`502`), so a malformed model reply never reaches the database or the UI.
- **Real persistence** — `models/Scan.ts` and `models/ScanQuestion.ts` (Mongoose, MongoDB Atlas).
- **Real Q&A** — `/api/ask` answers only from the saved report. Missing information returns
  *"This information is not available in the scanned label."*
- **No sample data** — the previous `sample-data.ts` fallback was removed.

The uploaded **image is not stored**. It lives in memory for the duration of the model call and is
discarded. `imageUrl` is intentionally `null`; the app does not claim the image is retained.

---

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS + shadcn/ui primitives · lucide-react
- MongoDB Atlas + Mongoose
- `@google/genai` (Google GenAI SDK)
- Zod for the model-output contract
- Deploy target: **Render**

---

## Layout

```
app/
  page.tsx                 homepage: uploader, report, ask, history
  scan/[id]/page.tsx       saved scan view
  api/analyze/route.ts     multipart image -> model -> Zod -> MongoDB
  api/ask/route.ts         grounded Q&A over a saved report
  api/scans/route.ts       list recent scans
  api/scans/[id]/route.ts  get / delete one scan (+ its Q&A)
lib/
  gemma.ts                 server-only GenAI client
  prompts.ts               analysis + grounded-QA prompts
  schema.ts                Zod contract + parser
  mongodb.ts               cached Mongoose connection
  types.ts                 shared types
models/
  Scan.ts                  nested report document
  ScanQuestion.ts          per-scan conversation history
components/label-lens/
  image-uploader.tsx       drag & drop, file picker, camera capture
  report-view.tsx          Label Truth Mode + nutrition + allergens + warnings
  ask-your-label.tsx       chat over the saved report
  scan-history.tsx         recent scans, view + delete
```

---

## Environment

Copy `.env.example` to `.env.local` for local development:

```env
GEMINI_API_KEY=
GEMMA_MODEL=gemini-2.0-flash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/labellens
```

Model ids change over time. The app uses `GEMMA_MODEL` as-is and surfaces a genuine API error if
the configured model does not accept image input — it never silently falls back to a different model.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:3000
```

Useful checks:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

---

## MongoDB Atlas

1. Create a free cluster at <https://cloud.mongodb.com>.
2. Add a database user, and allow your IP (or `0.0.0.0/0` while testing).
3. Copy the driver connection string into `MONGODB_URI`, adding the database name (e.g. `/labellens`).
4. Collections are created on first write.

Indexes declared on the models: `Scan.createdAt` (descending) and
`ScanQuestion.{scanId, createdAt}`.

---

## Deploy to Render

1. Push the repository to GitHub.
2. Render → **New → Web Service**, connect the repo.
3. Runtime: **Node**
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Environment variables:
   - `GEMINI_API_KEY`
   - `MONGODB_URI`
   - `GEMMA_MODEL` (optional)
   - `PORT` is provided by Render; `npm start` binds to it automatically.

Notes:
- API routes declare `runtime = "nodejs"` — they need Node, not the edge runtime.
- `/api/analyze` and `/api/ask` set `maxDuration = 60`; keep your plan's limits in mind for image
  analysis latency.
- No image storage is configured, so no object-storage credentials are required.

---

## API

### `POST /api/analyze`

`multipart/form-data` with an `image` field (JPG/PNG/WEBP, ≤ 5 MB).

```json
{
  "success": true,
  "scan": {
    "id": "…",
    "productName": "…",
    "brand": "…",
    "category": "…",
    "imageUrl": null,
    "createdAt": "…",
    "report": { "…": "…" }
  }
}
```

Errors: `400` no/bad body · `413` too large · `415` wrong type · `503` AI or DB not configured ·
`502` model returned unusable output (with `details`).

### `POST /api/ask`

```json
{ "scanId": "…", "question": "Does this contain added sugar?" }
```

Returns `{ success: true, question: { id, question, answer, createdAt } }`.

### `GET /api/scans`

Returns `{ success: true, scans: [...] }`, newest first (max 30).

### `GET /api/scans/[id]` · `DELETE /api/scans/[id]`

Get returns `{ success: true, scan, questions }`. Delete removes the scan and its Q&A history.

---

## Limitations

- **No authentication.** Scans are shared demo data — not per-user isolation.
- **No image storage.** Scans are re-readable as reports, but the original photo is not kept.
- The model can misread small print. Anything it flags as unreadable is shown in *Not Verified*;
  values it cannot read are returned as `null` rather than guessed.
- Nutrition/allergen data reflects only what is printed on the label in the photo.
- LabelLens is informational. It is **not** medical advice and never claims a product is safe,
  unsafe, healthy or unhealthy.

---

## License

Add the license you intend to publish under before open-sourcing.
