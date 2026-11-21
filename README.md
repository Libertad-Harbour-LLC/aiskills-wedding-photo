# Wedding Photo Studio

Wedding photos of a couple, a bride or a groom from everyday photos: 12 locations (beach, castle garden, vineyard, cathedral, Paris…), 4 outfit styles or your own clothes, format and up to 4 variants.

A ready-to-deploy Next.js app that runs on the [AI SKILLS](https://aiskills.team) API. One environment
variable — `AISKILLS_API_KEY` — and it works.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLibertad-Harbour-LLC%2Faiskills-wedding-photo&env=AISKILLS_API_KEY&envDescription=Your%20AI%20SKILLS%20API%20key&envLink=https%3A%2F%2Faiskills.team%2Fapi-keys&project-name=aiskills-wedding-photo&repository-name=aiskills-wedding-photo)

## Deploy in 3 steps

1. Create an API key at https://aiskills.team/api-keys (sign in, enter a name, optionally a spending limit, click
   “Create key”, copy the `ask_…` key — it is shown once).
2. Click **Deploy with Vercel** above.
3. Paste the key into `AISKILLS_API_KEY` when Vercel asks for it — done. Open your new site.

Every generation is paid **from your AI SKILLS balance at the same prices as on aiskills.team** and appears in
“My generations” there. A failed generation is refunded automatically. Top up at https://aiskills.team/gen-ai.

## Models and prices

| Model id | What it is | Price |
|---|---|---|
| `nano-banana-2-1-edit` | Nano Banana 2.1 · edit | $0.10 per image (1K/2K) |

Prices are shown live on the page (read from `GET /v1/models`) and may change on the platform.

## How files get in

The app needs 1–4 photos of the people (a photo of the couple together or one photo of each). The AI SKILLS API takes input files as **public https links**, so a visitor can:

- **paste a link** to the file — a direct link, or a Google Drive file shared with “Anyone with the link” — works
  out of the box;
- **upload from the device** — turns on when you connect a Vercel Blob store: Vercel → your project → Storage →
  Create → Blob → connect it to the project (Vercel adds `BLOB_READ_WRITE_TOKEN` itself) → Redeploy. The file goes
  from the browser straight to your Blob store (so large files are fine) and its public link is passed to the API.
  Blob storage is billed by Vercel.

## Protect your balance

The site spends **your** balance, and anyone who opens it can press the button. Before sharing the link:

- set a **spending limit** on the key at https://aiskills.team/api-keys (per month or in total);
- optionally set `ACCESS_CODE` in the Vercel environment — visitors will have to enter it before generating.

The key never reaches the browser: all calls to the API go through the app's server routes (`src/app/api/*`),
and the model, prompt and parameters are built on the server from the app's own presets (`src/lib/plan.js`), so a
visitor cannot run other models on your key.

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `AISKILLS_API_KEY` | yes | your `ask_…` key |
| `ACCESS_CODE` | no | a code visitors must enter before generating |
| `BLOB_READ_WRITE_TOKEN` | no | set by Vercel when you connect a Blob store; enables upload from device |
| `AISKILLS_API_BASE` | no | API base URL, default `https://aiskills.team/v1` |

## Run locally

```bash
cp .env.example .env.local   # put your key into AISKILLS_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

## Customize

- `src/lib/app.config.js` — name, texts (English and Russian), styles/scenes, formats, which models are used;
- `src/lib/plan.js` — how a visitor's choice becomes an API request (model, prompt, parameters);
- `src/app/globals.css` — colors (`data-theme` in `app.config.js`: `slate-indigo`, `sunset`, `emerald`,
  `midnight`, `cyberpunk`).

There is no database, sign-in or payment system: recent results are remembered in the visitor's browser. You can
add your own auth or payments later (for example NextAuth and Stripe) in front of `/api/generate`.

API reference: https://aiskills.team/api-keys (sections “Endpoints”, “Errors”).

---

## По-русски

Свадебные фото пары, невесты или жениха из обычных снимков: 12 мест (пляж, сад у замка, виноградник, собор, Париж…), 4 стиля нарядов или своя одежда, формат и до 4 вариантов.

**Как запустить:** создайте ключ на https://aiskills.team/api-keys → нажмите **Deploy with Vercel** выше →
вставьте ключ в `AISKILLS_API_KEY` → готово. Генерации оплачиваются с вашего баланса AI SKILLS по ценам сайта,
неудачные возвращаются автоматически. Файлы посетитель передаёт публичной ссылкой; загрузка с устройства
включается подключением хранилища Vercel Blob (Storage → Blob). Перед тем как делиться ссылкой на сайт,
поставьте ключу лимит расходов и при желании задайте `ACCESS_CODE`. Интерфейс — английский и русский
(переключатель EN/RU в шапке).

## License

MIT — see [LICENSE](LICENSE). Based on an MIT-licensed open-source template, modified by AI SKILLS.
