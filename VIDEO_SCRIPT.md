# Video Script: Check First (2:45 max)

About 380 spoken words (about 2:32), which is comfortable at a normal pace. **[Brackets]** are what's on screen.
Record the screen on a phone-sized browser window. Have the app open, the API key working,
and a sample screenshot saved in your photos before you start.

---

### 0:00 – 0:15 · Hook
**[Phone screen: a WhatsApp message in Punjabi, "Canada visa 100% guaranteed… send the fee first… don't tell anyone."]**

> "This is a real kind of message families in Fremont get on WhatsApp. A 'guaranteed' visa, a fee up front, and *don't tell anyone*. My community loses real money to messages like this, and the people targeted often can't easily check them in English."

### 0:15 – 0:35 · Problem
**[Quick cuts: fake USCIS voicemail text, a notario ad in Spanish, a fake toll text.]**

> "In CA-14, families get fake USCIS and IRS calls, illegal notarios and fake visa agents, and most scam tools are English-only. So I built Check First: a free scam checker in Punjabi, Hindi, Spanish, Chinese, Dari and English."

### 0:35 – 1:40 · Live demo
**[Home page. Tap "Try an example".]**

> "One tap checks a Punjabi visa-agent message."

**[Result appears: High risk, red stop-sign icon.]**

> "High risk, shown with an icon and a label, not just color. It lists the red flags: guaranteed visa, fee up front, secrecy. Each comes with one simple sentence. And here's 'How we decided': the offline rules engine and the AI both flagged it."

**[Scroll: What to do now, then Verify it yourself links.]**

> "Then concrete steps, and official .gov links to verify it yourself."

**[Tap "Check another". Upload a screenshot of a scam text.]**

> "It also reads screenshots."

**[Result appears. Switch language to دری.]**

> "Switch to Dari, and the whole app flips right-to-left."

**[Show RTL result. Tap "Share on WhatsApp"; WhatsApp opens with the warning.]**

> "One tap warns the family group on WhatsApp, in their language."

**[Scroll to "Report it in English". Tap "Copy report".]**

> "Many of our elders can't report a scam in English, so Check First writes the report for them, ready to paste into the FTC's fraud form."

**[Tap the "Help" tab at the bottom. Pick "Gift cards".]**

> "And if someone already paid, the Help page says exactly what to do right now, with tap-to-call numbers for the real USCIS, IRS and Social Security."

### 1:40 – 2:10 · How it works
**[Show the architecture diagram from the README.]**

> "Check First uses two layers. A rules engine runs on the phone, works offline, and scores warning signs in six languages. A server route asks an AI model, which must answer in strict JSON that I validate with zod. The app shows the higher risk, because a false 'safe' is the worst mistake a scam checker can make."

### 2:10 – 2:30 · The hard part
**[Show the "AI check didn't finish" notice, then the test results in the terminal.]**

> "The hardest part was making it never fail when a scared person needs it. If the AI is slow, offline, or returns bad data, the app falls back to the rules result. There's never a blank screen. And normal word matching doesn't work for Punjabi or Dari, so the rules engine is tested on scams in all six languages."

### 2:30 – 2:45 · Impact and next steps
**[Back to the home page.]**

**[Phone home screen: tap the Check First app icon.]**

> "It installs on any phone like an app, works offline for the guides, saves nothing, and needs no account. Next, I want to partner with gurdwaras, mosques, temples and senior centers in CA-14, and add more languages like Tagalog and Vietnamese. Check first. Then pay."

---

## Recording checklist
- [ ] `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY`) set on Vercel, and one real check done before recording (so the AI layer shows).
- [ ] Rules engine finished, so "Rules check" shows real matches.
- [ ] A screenshot of a scam text saved in your photos.
- [ ] WhatsApp installed (or WhatsApp Web open) for the share step.
- [ ] Large text off and high contrast off at the start.
- [ ] Check First installed on your phone (Android: "Install app" button; iPhone: Share → Add to Home Screen) for the last shot.
- [ ] Time the full run: it must be under 2:45.
