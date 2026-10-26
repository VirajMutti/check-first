# Rules Guide: building `analyzeWithRules`

This explains the *approach* for the offline rules engine in `lib/redFlags.ts`.
It deliberately does not include finished code. (Update: near the deadline, Viraj asked the AI to finish the engine; see AI_USAGE.md. This guide still explains the approach.)

## What the function must do

Input: the message text. Output: a `RulesResult`:

- `matches`: every red flag found, as `{ category, matchedText, weight }`
- `score`: 0–100
- `risk`: `"low" | "medium" | "high"`, decided from the score

The tests in `lib/redFlags.test.ts` are your spec. Run them while you work:

```bash
npm run test:watch
```

## Step 1: Normalize the text

Make the text easier to match before you search it:

- **Lowercase** it (the "is not fooled by UPPERCASE" test checks this).
- Use `text.normalize("NFKC")`, which turns look-alike characters (full-width letters, some special digits) into normal ones.
- Optional: remove zero-width characters (`​-‍`, `﻿`). Scammers use them to break up keywords.

## Step 2: Build a pattern list per category

Make a data structure where each category has a weight and a list of patterns.
Think of it as a table:

| Category | Example patterns (all languages) | Weight idea |
|---|---|---|
| urgency | arrest, deport, warrant, "within 24 hours" and other deadline words; Spanish *arresto, deportado*; Hindi *गिरफ्तार, तुरंत*; Chinese *逮捕, 驱逐出境*; Dari *دیپورت, فوراً* | high |
| payment | gift card, bitcoin, crypto, wire, Zelle, Western Union; *tarjeta de regalo*; *गिफ्ट कार्ड*; *比特币* | high |
| government | USCIS, IRS, SSA, ICE, police; *移民局*; *पुलिस*; *اداره مهاجرت* | medium |
| guarantee | guaranteed, 100%; *garantizo*; *ਗਾਰੰਟੀ* | high |
| upfront_fee | processing fee, pay first, advance; *por adelantado*; *ਪਹਿਲਾਂ ... ਫੀਸ*; *先支付, 手续费* | medium |
| secrecy | don't tell anyone; *no le diga a nadie*; *किसी को मत बताना*; *ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸਣਾ*; *به هیچ کس نگویید* | high |
| notario | notario, immigration consultant + legal words (asylum, papers, "no lawyer needed") | high |
| prize | you won, lottery, congratulations; *中奖* | medium |
| link | `http://`, `https://`, `www.`, URL shorteners (bit.ly, tinyurl), odd endings (.top, .xyz) | medium |

Use the test messages to collect your keywords. Then add a few of your own that real scams use.

## Step 3: Match carefully (the tricky part)

- **`\b` (word boundary) does NOT work for Punjabi, Hindi, Chinese or Dari** in JavaScript. `\b` only understands English letters. For those scripts, use a plain "contains" check (`text.includes(...)`) or a regex without `\b`.
- For English words, `\b` helps avoid false matches like "ice" inside "notice" or "price". The **ICE** pattern is a classic trap here, so test it.
- Every regex should use the `i` flag (ignore case) and probably `u` (unicode).
- Save the **actual matched words** into `matchedText` (from `match[0]`). The result screen shows them to the user as evidence.

## Step 4: Score

A simple, explainable approach:

1. For each category, if any of its patterns match, add that category's weight **once**. Don't add it again for every keyword, or one long message could score 500.
2. Optional bonus: certain *combinations* are much more suspicious than either alone, such as `government` + `payment`, or `guarantee` + `upfront_fee`. You could add extra points when both appear.
3. Clamp: `Math.min(100, total)`. One test checks the score never goes over 100.

## Step 5: Turn the score into a risk level

Pick two cut-off numbers, for example "below X is low, X to Y is medium, Y and above is high". Choose them so that:

- every safe test message is **low** (zero matches means score 0)
- one strong red flag alone is at least **medium**
- two or three strong red flags together are **high**

Tune the weights and cut-offs until all the tests pass.

## Things to be ready to explain to judges

- Why a rules engine *and* AI: rules are instant, free, private, work offline, and are fully explainable. AI understands context and new tricks.
- Why weights: some signs (asking for gift cards) are much stronger than others (a link).
- The trade-off: more keywords catch more scams but cause more false alarms. Your safe-message tests protect against false alarms.

## When you're stuck

Say **"review rules"** and I'll run the tests, review your code, and give hints without writing the function.
