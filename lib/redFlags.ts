// Layer 1 of Check First: the offline rules engine.
//
// This runs in the browser, needs no internet and no API key, and gives a
// result even if the AI layer fails. It looks for warning words in all six
// languages, adds up points, and turns the total into Low / Medium / High.
//
// Who wrote what (see AI_USAGE.md): Viraj designed the categories and tests
// and wrote the first line of analyzeWithRules (the lowercase "clean" copy).
// An AI assistant wrote the rule list and scoring at Viraj's request.

import type { RiskLevel } from "./risk";

/** The kinds of red flags the rules engine looks for. */
export type RedFlagCategory =
  | "urgency" // threats or deadlines: arrest, deportation, account closed, "today only"
  | "payment" // unusual payment: gift cards, crypto, wire, Zelle, Western Union
  | "government" // pretending to be USCIS, IRS, SSA, ICE, police
  | "guarantee" // guaranteed visa, green card or job abroad
  | "upfront_fee" // pay a fee first to receive something
  | "secrecy" // "don't tell anyone"
  | "notario" // notario or consultant giving legal advice
  | "prize" // you won a prize or lottery
  | "link"; // suspicious links

/** One rule that fired on the message. */
export interface RuleMatch {
  category: RedFlagCategory;
  /** The exact words in the message that triggered the rule. */
  matchedText: string;
  /** How many points this match added to the score. */
  weight: number;
}

/** What the rules engine returns. */
export interface RulesResult {
  /** 0 (looks safe) to 100 (almost certainly a scam). */
  score: number;
  risk: RiskLevel;
  matches: RuleMatch[];
}

/** One rule: a category, how many points it's worth, and the patterns to look for. */
interface Rule {
  category: RedFlagCategory;
  weight: number;
  patterns: RegExp[];
}

// Notes on the patterns:
// - Everything is matched against lowercase text, so patterns are lowercase.
// - \b ("word boundary") only works for English letters in JavaScript, so it's
//   used for English words (e.g. \bice\b, so "notice" and "police" don't count
//   as ICE) but NOT for Punjabi, Hindi, Chinese or Dari.
// - ਼ and ़ are the Gurmukhi / Devanagari "nukta" dot. Some people
//   type ਫ਼ / फ़ with it and some without, so it's optional (the "?").
const RULES: Rule[] = [
  {
    // Strange ways to pay: the strongest single sign of a scam.
    category: "payment",
    weight: 30,
    patterns: [
      /gift ?cards?/, /google play card/, /itunes card/, /\bwire\b/, /western union/, /moneygram/, /\bzelle\b/,
      /bitcoin/, /crypto/, // English
      /tarjetas? de regalo/, /criptomoneda/, // Spanish
      /ਗਿਫ਼?ਟ ਕਾਰਡ/, // Punjabi
      /गिफ्ट कार्ड/, // Hindi
      /礼品卡/, /比特币/, /加密货币/, // Chinese
      /کارت تحفه/, /بیت ?کوین/, /ارز دیجیتال/, // Dari
    ],
  },
  {
    // Guaranteed visa / green card / job: nobody can promise that.
    category: "guarantee",
    weight: 30,
    patterns: [/guarantee/, /100 ?%/, /garantiz/, /ਗਾਰੰਟੀ/, /गारंटी/, /保证/, /تضمین/],
  },
  {
    // Notarios and "consultants" giving legal advice.
    category: "notario",
    weight: 30,
    patterns: [
      /\bnotario/, /immigration consultant/, /no lawyer needed/, /without a lawyer/, // English
      /sin necesidad de abogado/, /sin abogado/, // Spanish
      /ਨੋਟੇਰੀਓ/, /नोटेरियो/, /公证人/, /نوتاریو/,
    ],
  },
  {
    // "Don't tell anyone": scammers cut people off from help.
    category: "secrecy",
    weight: 25,
    patterns: [
      /(do not|don't) (tell|discuss|share)[^.!?]{0,25}(anyone|anybody|family)/,
      /keep (this|it) (a )?(secret|confidential)/, // English
      /no (le|se lo) (diga|cuente) a nadie/, // Spanish
      /ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸ/, // Punjabi
      /किसी को (मत|न) बता/, // Hindi
      /不要告诉/, /保密/, // Chinese
      /به (هیچ ?کس|کسی) نگویید/, // Dari
    ],
  },
  {
    // "You won!": you can't win a contest you never entered.
    category: "prize",
    weight: 25,
    patterns: [
      /you (have )?won/, /\bwinner\b/, /lottery/, /sweepstakes/, /claim your (prize|reward)/, // English
      /ganó/, /premio/, /lotería/, // Spanish
      /ਲਾਟਰੀ/, /ਇਨਾਮ/, /लॉटरी/, /इनाम/, /中奖/, /奖金/, /لاتری/, /جایزه/, /برنده/,
    ],
  },
  {
    // Threats and deadlines that rush you.
    category: "urgency",
    weight: 20,
    patterns: [
      /arrest/, /warrant/, /deport/, /suspen(d|sion)/, /within \d+ (hours?|minutes?|days?)/, /immediately/,
      /final notice/, /late fee/, /penalty/, /or you will be/, // English
      /arresto/, /deportad/, /inmediatamente/, // Spanish
      /ਗ੍ਰਿਫ਼?ਤਾਰ/, /ਤੁਰੰਤ/, /ਡਿਪੋਰਟ/, // Punjabi
      /गिरफ़?्तार/, /तुरंत/, /डिपोर्ट/, // Hindi
      /逮捕/, /驱逐出境/, /\d+小时内/, /立即/, // Chinese
      /دیپورت/, /فورا/, /اخراج/, /زندان/, // Dari
    ],
  },
  {
    // Pretending to be the government. Worth less than the Medium cut-off on
    // purpose: just mentioning "police" or "IRS" isn't suspicious by itself,
    // but together with threats or payment demands it pushes the score up.
    category: "government",
    weight: 15,
    patterns: [
      /\buscis\b/, /\birs\b/, /\bssa\b/, /social security/, /\bice\b/, /\bpolice\b/, /\bofficer\b/,
      /homeland security/, /immigration (office|department|services)/, // English
      /inmigración/, /policía/, // Spanish
      /ਪੁਲਿਸ/, /ਇਮੀਗ੍ਰੇਸ਼ਨ/, // Punjabi
      /पुलिस/, /इमिग्रेशन/, // Hindi
      /移民局/, /警察/, // Chinese
      /اداره مهاجرت/, /پولیس/, // Dari
    ],
  },
  {
    // Pay a fee first to get something.
    category: "upfront_fee",
    weight: 20,
    patterns: [
      /processing fee/, /redelivery fee/, /registration fee/, /file fee/, /advance fee/, /upfront/, /in advance/,
      /por adelantado/, // Spanish
      /ਪਹਿਲਾਂ[^।!?]{0,30}ਫ਼?ੀਸ/, /ਫ਼?ਾਈਲ ਫ਼?ੀਸ/, // Punjabi: "first ... fee", "file fee"
      /पहले[^।!?]{0,30}फ़?ीस/, // Hindi: "first ... fee"
      /先支付/, /先付/, /手续费/, // Chinese
      /پیش ?پرداخت/, /اول فیس/, // Dari
    ],
  },
  {
    // Links in surprise messages, especially shorteners and odd endings.
    category: "link",
    weight: 20,
    patterns: [
      /https?:\/\/\S+/, /\bwww\.\S+/, /\b(bit\.ly|tinyurl\.com)\/\S*/,
      /\b[a-z0-9-]+\.(top|xyz|click|live|shop|online|site)\b\S*/,
    ],
  },
];

// Score cut-offs: below 20 is Low, 20 to 44 is Medium, 45 or more is High.
// So one sign on its own (like just a link) is Medium, and two or three
// strong signs together are High.
const MEDIUM_AT = 20;
const HIGH_AT = 45;

/**
 * Scores a message for scam warning signs using keyword/regex rules.
 */
export function analyzeWithRules(text: string): RulesResult {
  // Viraj's line: lowercase + normalize look-alike characters.
  const clean = text.toLowerCase().normalize("NFKC");
  // Also remove invisible characters (zero-width spaces/joiners, used in Dari
  // and by scammers to hide words) and turn curly apostrophes into straight ones.
  const prepared = clean.replace(/[​-‍﻿]/g, "").replace(/[’‘]/g, "'");

  const matches: RuleMatch[] = [];
  let total = 0;

  for (const rule of RULES) {
    let counted = false;
    for (const pattern of rule.patterns) {
      const found = prepared.match(pattern);
      if (!found) continue;
      // Skip a phrase we already have (e.g. the same link matched by two patterns).
      if (matches.some((m) => m.category === rule.category && m.matchedText.includes(found[0]))) continue;
      // Each category adds its points only ONCE (so a long message can't pile up
      // points), but every matching phrase is kept as evidence for the user.
      matches.push({ category: rule.category, matchedText: found[0], weight: counted ? 0 : rule.weight });
      if (!counted) total += rule.weight;
      counted = true;
    }
  }

  const score = Math.min(100, total);
  const risk: RiskLevel = score >= HIGH_AT ? "high" : score >= MEDIUM_AT ? "medium" : "low";
  return { score, risk, matches };
}
