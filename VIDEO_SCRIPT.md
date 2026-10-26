# Video Script: Check First (2:45 max)

About 360 spoken words, which is comfortable at a normal pace. **[Brackets]** are what's on screen.
Record the screen on a phone-sized browser window. Have the app open, the API key working,
and a sample screenshot saved in your photos before you start.

---

### 0:00 – 0:15 · Hook
**[Phone screen: a WhatsApp message in Punjabi, "Canada visa 100% guaranteed… send the fee first… don't tell anyone."]**

> "This is a real kind of message families in Fremont get on WhatsApp. A 'guaranteed' visa, a fee up front, and *don't tell anyone*. My community loses real money to messages like this, and the people targeted often can't easily check them in English."

### 0:15 – 0:35 · Problem
**[Quick cuts: fake USCIS voicemail text, a notario ad in Spanish, a fake toll text.]**

> "In CA-14, immigrant families and seniors get fake USCIS and IRS calls, notarios giving illegal legal advice, and fake visa agents. Most scam tools are English-only. So I built Check First: a free scam checker that answers in Punjabi, Hindi, Spanish, Chinese, Dari and English."

### 0:35 – 1:40 · Live demo
**[Home page. Tap "Try an example".]**

> "One tap checks a Punjabi visa-agent message."

**[Result appears: High risk, red stop-sign icon.]**

> "High risk, shown with an icon and a label, not just color. It lists the red flags: guaranteed visa, fee up front, secrecy. Each comes with one simple sentence. And here's 'How we decided': my rules engine and the AI both flagged it."

**[Scroll: What to do now, then Verify it yourself links.]**

> "Then concrete steps, and official .gov links to verify it yourself."

**[Tap "Check another". Upload a screenshot of a scam text.]**

> "It also reads screenshots."

**[Result appears. Switch language to دری.]**

> "Switch to Dari, and the whole app flips right-to-left."

**[Show RTL result. Tap "Share on WhatsApp"; WhatsApp opens with the warning.]**

> "One tap warns the family group on WhatsApp, in their language."

**[Open "Verify someone", pick "Immigration consultant or notario".]**

> "And before you pay anyone, the Verify page shows exactly how to check a consultant, lawyer or agent, with official California and federal lookups."

### 1:40 – 2:10 · How it works
**[Show the architecture diagram from the README.]**

> "Check First uses two layers. First, a rules engine I wrote in TypeScript. It runs on the phone, works offline, and scores warning signs in all six languages. Second, a server route sends the message to Claude, which must answer in strict JSON that I validate with zod. The app shows the higher of the two risks, because a false 'safe' is the worst mistake a scam checker can make."

### 2:10 – 2:30 · The hard part
**[Show the "AI check didn't finish" notice, then the test results in the terminal.]**

> "The hardest part was making it never fail when a scared person needs it. If the AI is slow, offline, or returns bad data, the app falls back to my rules result after eight seconds. There's never a blank screen. Multilingual text was hard too: normal word matching doesn't work for Punjabi or Dari, so I wrote tests in all six languages."

### 2:30 – 2:45 · Impact and next steps
**[Back to the home page.]**

> "Check First saves nothing and needs no account. Next, I want to partner with gurdwaras, mosques, temples and senior centers in CA-14, and add more languages like Tagalog and Vietnamese. Check first. Then pay."

---

## Recording checklist
- [ ] `ANTHROPIC_API_KEY` set on Vercel, and one real check done before recording (so the AI layer shows).
- [ ] Rules engine finished, so "Rules check" shows real matches.
- [ ] A screenshot of a scam text saved in your photos.
- [ ] WhatsApp installed (or WhatsApp Web open) for the share step.
- [ ] Large text off and high contrast off at the start.
- [ ] Time the full run: it must be under 2:45.
