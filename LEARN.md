# LEARN.md: how every file works

A plain-English tour of the code, so you can explain any part of it to judges.
Read it top to bottom once; it follows the path a message takes through the app.

## The big picture

Check First is a **Next.js** app. Next.js lets one project hold both:

- **pages** that run in the browser (the `app/` folder, plus `components/`), and
- **server code** that runs on Vercel's servers (`app/api/analyze/route.ts`).

When someone checks a message:

1. The page runs **your rules engine** right away, in the browser.
2. At the same time it asks the **server route**, which asks **Claude**.
3. The two answers are **combined**: the higher risk wins.
4. The **result card** shows everything in the chosen language.

---

## `app/`: pages and the server route

### `app/layout.tsx`
The frame around every page: header, main area, footer.
- Loads **Noto Sans** fonts for Latin, Gurmukhi (Punjabi), Devanagari (Hindi) and Arabic script (Dari). Chinese uses the phone's built-in font: on Android that *is* Noto Sans CJK, and iPhones use PingFang. Downloading a Chinese font means ~200 files and made builds fail on slow networks.
- Wraps everything in `<I18nProvider>` so every component can translate text.
- Adds `<ServiceWorker />` for offline support.

### `app/page.tsx`
The home page. It just shows `<Checker />`.

### `app/verify/page.tsx` and `app/learn/page.tsx`
Tiny files that set the page title and show `<VerifyPicker />` or `<LearnCards />`.

### `app/api/analyze/route.ts`: the AI layer (server only)
This is the only place the API keys are used, so they never reach the browser. Step by step:
1. **Pick a provider:** Claude if `ANTHROPIC_API_KEY` is set, otherwise Gemini if `GEMINI_API_KEY` is set. **No key at all?** Answer `not_configured`, and the browser falls back to the rules result.
2. **Rate limit:** at most 10 checks per minute per visitor (`lib/rateLimit.ts`).
3. **Validate input with zod:** text up to 4,000 characters, an optional PNG/JPG under ~3 MB, and a language code. Bad input gets `bad_request`.
4. **Ask the AI** through `lib/ai/claude.ts` or `lib/ai/gemini.ts` (see below).
5. **Check the answer again** with the stricter zod schema (`AiAnalysisSchema`: at least 1 next step, at most 5).
7. Any error sends back `ai_failed`. We log only the error *type*, never the user's message.

### `app/globals.css`
All the styling rules:
- **Design tokens**: named colors like `--brand` (deep teal) and `--risk-high` (red).
- **High contrast mode**: when `<html data-contrast="high">`, the colors switch to pure black and white.
- **Large text mode**: when `<html data-text="large">`, the base font grows from 18px to 22px. Everything sized in `rem` grows with it.
- **Per-language font**: `:root[lang="pa"]` puts the Gurmukhi font first, and so on.
- **Reusable classes**: `.card`, `.btn` (every button is at least 44px tall), `.link-row`.
- **Result animation**: cards slide up one after another, turned off for people who set "reduce motion".

---

## `lib/`: the logic (no visuals)

### `lib/redFlags.ts`: your rules engine (layer 1)
**You write the logic here.** The AI only wrote:
- `RedFlagCategory`: the nine kinds of red flag.
- `RuleMatch`: one rule that fired (`category`, `matchedText`, `weight`).
- `RulesResult`: what the function returns (`score` 0–100, `risk`, `matches`).
- A stub `analyzeWithRules` that returns Low.

See `RULES_GUIDE.md` for the approach.

### `lib/redFlags.test.ts`: the rules engine's spec
18 real-looking messages across 6 languages, each with the risk it should get and the categories it must find, plus 4 sanity checks (empty text, score stays 0–100, UPPERCASE gives the same result, scam scores above safe). Written *before* the logic, which is called test-driven development. `npm test` shows how many pass.

### `lib/ai/`: the two AI providers
- `prompt.ts`: the **system prompt** both providers get (describes CA-14 scams and how to answer), `buildUserText()` ("Answer in Punjabi" + the message), and the 8-second limit.
- `claude.ts`: sends the screenshot + text to Claude with **structured output** (it must return JSON matching `AiOutputSchema`) and `effort: "low"` for speed. A refusal or cut-off answer (`stop_reason` isn't `end_turn`) returns `null`.
- `gemini.ts`: the same job with Google's Gemini (free tier). `z.toJSONSchema()` turns our zod schema into the JSON Schema Gemini needs, so both providers follow **one** definition. Gemini returns JSON as text, so we `JSON.parse` it and check it with zod. `store: false` asks Google not to keep the request for later retrieval.
- Both use no retries and an 8-second timeout, so the browser can fall back in time.

Why two providers? Gemini has a free tier, so the app can run at no cost, and the design shows the AI is swappable: the rest of the app doesn't care which one answered.

### `lib/risk.ts`
`RiskLevel` = `"low" | "medium" | "high"`, and `higherRisk(a, b)`, which returns the more dangerous of the two. It works by ranking them in an array: low = 0, medium = 1, high = 2.

### `lib/analysis.ts`: the data shapes
Uses **zod**: you describe a shape once and get both a TypeScript type *and* a runtime check.
- `AnalyzeRequestSchema`: what the browser sends.
- `AiOutputSchema`: what Claude must return. It's kept simple because structured output supports only basic rules.
- `AiAnalysisSchema`: the stricter version the server checks afterwards.
- `AnalyzeResponse`: the API always answers `{ ok: true, analysis }` or `{ ok: false, reason }`.

### `lib/combine.ts`: merging the two layers
- `combineResults()` sets `finalRisk = higherRisk(rules, ai)` and records which layers flagged something.
- `scamTypeFromRules()`: when there's no AI, it guesses the scam type from your categories (e.g. `notario` means "immigration") so the right official links still show.
- `linksForScamType()` looks up the link ids in `data/resources.json`.

### `lib/i18n.tsx`: translations
- Loads all 6 `locales/*.json` files into the app (so it works offline).
- `t("result.verify")` finds that text in the current language and falls back to English if missing. `{name}` placeholders get filled in, e.g. `{risk}`.
- Sets `<html lang>` and `<html dir="rtl">` for Dari, which flips the whole layout. The CSS uses `ps-`/`pe-` ("start/end") instead of left/right, so it mirrors correctly.
- Remembers the language in `localStorage`, which is only a convenience.

### `lib/languages.ts`
The list of 6 languages: code, native name, English name (for the AI prompt), and text direction.

### `lib/image.ts`
Shrinks a screenshot in the browser to at most 1600px and converts it to JPEG before upload. Phone screenshots can be 5+ MB; this makes them ~200 KB, which is faster on mobile data and stays under the server limit.

### `lib/report.ts`
Builds the "Report it in English" text. If the AI wrote `reportEnglish`, it uses that. Otherwise it fills a template: the English names of the warning signs your rules engine found, plus the message quoted, cut to 600 characters. So reporting works even offline. Tested in `lib/report.test.ts`.

### `lib/rateLimit.ts`
Keeps a list of recent request times per IP address in memory, and allows 10 per minute. It's simple on purpose; a real launch would use a shared database.

### `lib/locales.test.ts` and `lib/resources.test.ts`
Safety nets: every language must have every key and placeholder, and every official link must be an `https` `.gov` address with a label.

---

## `components/`: the visual pieces

| File | What it shows |
|---|---|
| `Checker.tsx` | Hero + form. `runCheck()` runs your rules, calls the API (the server gives the AI 8 seconds; the browser waits up to 10 with `AbortController` as a backstop), re-runs rules on screenshot text, and shows the result. |
| `Hero.tsx` | The teal pitch box, "Try an example" (loads the Punjabi sample and checks it in one click), and more sample buttons. |
| `ResultCard.tsx` | Risk banner (icon + label + color), fallback notice, "How we decided" (both layers side by side), red flags grouped by layer, next steps, official links, WhatsApp share and copy. Moves keyboard focus to the result when it appears. |
| `ReadAloud.tsx` | Uses the browser's `speechSynthesis`. It only shows if the device has a voice for the language, so it never reads Punjabi with an English voice. |
| `DisplayToggles.tsx` | Large text and high contrast buttons (`aria-pressed` tells screen readers whether they're on). |
| `Header.tsx` / `Footer.tsx` | Logo, language picker, navigation (`aria-current` marks the current page), and the "Not legal advice / call 911" footer. |
| `VerifyPicker.tsx` | Native radio buttons, so arrow keys and screen readers work, then 3 steps + official links. Scrolls to the steps after a tap, but not for keyboard users. |
| `StepsPicker.tsx` | Shared "pick an option, see 3 steps + official links" component used by /verify and /help. |
| `HelpPage.tsx` | /help: "How did you pay?" picker, tap-to-call official numbers (`tel:` links, `dir="ltr"` so numbers don't flip in Dari), and "what to say" lines with read-aloud. |
| `LearnCards.tsx` | Six scam cards: example, warning signs, what to do, read aloud. |
| `OfficialLinks.tsx` | A list of official links with translated labels. |
| `Icons.tsx` | Hand-made SVG icons: shield logo, and the octagon, triangle and check-circle risk icons. |
| `BottomNav.tsx` | Phone-only tab bar fixed at the bottom (Check, Verify, Learn, Help), like a native app. Hidden on computers (`md:hidden`), where the top menu shows instead. The active tab gets a bold icon *and* an underline, not just a color. |
| `InstallApp.tsx` | "Get the app" card. On Android/Chrome it saves the browser's `beforeinstallprompt` event and shows an Install button; on iPhone (which has no install prompt) it shows the Share → Add to Home Screen steps; once installed it hides. |
| `ServiceWorker.tsx` | Registers `public/sw.js` (production only). |

## `app/manifest.ts` + `public/icons/`: the mobile app
The **web app manifest** tells phones the app's name, icon, colors and to open `standalone` (full screen, no browser bar). Together with the service worker, this makes Check First a **Progressive Web App**: one codebase that's a website on computers and an installable app on phones, without needing the App Store ($99/year and days of review). The icons were made from `icon.svg` with the `sharp` image library.

## `public/sw.js`: offline support
A **service worker** is a small script the browser keeps running for your site. Ours saves pages and their files the first time you visit, then serves the saved copy when there's no internet. It never touches `/api`, so messages are never cached.

## Data files

| File | What's inside |
|---|---|
| `locales/*.json` | Every piece of UI text, in 6 languages. |
| `data/resources.json` | 27 official `.gov` links; which go with each scam type, "Who are you dealing with?" option and payment method; and the official phone numbers (each with the page it was checked on). |
| `data/samples.json` | 5 made-up demo messages modeled on real scams (fake 555 phone numbers). |

## Config files

| File | Why it's there |
|---|---|
| `next.config.ts` | Security headers, and "never cache `sw.js`". |
| `vitest.config.ts` | Test setup. |
| `.env.example` | Template for the API key. The real `.env.local` is never committed. |
| `tsconfig.json`, `eslint.config.mjs` | TypeScript and lint settings from `create-next-app`. |

## Likely judge questions

- **Why not just use the AI?** It can be slow, cost money, need internet, or make mistakes. The rules engine is instant, free, private, offline and explainable, and it catches the AI if the AI under-rates a message.
- **Why "higher of the two"?** For a scam checker, a false "safe" is far worse than a false "be careful".
- **How do you protect privacy?** No database, no accounts, no logging of messages, and the API keys stay on the server. The app tells users the text goes to an AI service. On Gemini's free tier Google may use submitted content to improve its products, so a real launch would use a paid tier or Claude.
- **How do you know the links and numbers are real?** Every link is a `.gov` site (a test enforces that), each one was opened in a browser on 2026-10-26, and each phone number was read off the agency's own website, which the page links as its source.
- **What did AI write?** See `AI_USAGE.md`.
