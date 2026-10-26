// Tests for the rules engine (lib/redFlags.ts).
//
// These were written BEFORE the logic, so most scam cases fail against the
// stub. As Viraj builds analyzeWithRules, more of them turn green.
// Run with: npm test
//
// Non-English messages are realistic examples; native speakers should
// proofread them (see AI_USAGE.md).

import { describe, expect, it } from "vitest";
import { analyzeWithRules, type RedFlagCategory } from "./redFlags";

interface Case {
  name: string;
  text: string;
  /** "notLow" means medium OR high is acceptable. */
  expected: "low" | "medium" | "high" | "notLow";
  /** Categories that must appear in result.matches. */
  mustInclude?: RedFlagCategory[];
}

const cases: Case[] = [
  // ---------- English ----------
  {
    name: "EN fake USCIS call with gift cards, deportation threat and secrecy",
    text: "This is USCIS. There is a problem with your green card application. Pay $500 in Google Play gift cards today or you will be deported. Do not tell anyone about this call.",
    expected: "high",
    mustInclude: ["government", "payment", "urgency", "secrecy"],
  },
  {
    name: "EN IRS arrest warrant with wire transfer",
    text: "IRS FINAL NOTICE: You owe back taxes. A warrant for your arrest will be issued unless you pay by wire transfer within 2 hours.",
    expected: "high",
    mustInclude: ["government", "urgency", "payment"],
  },
  {
    name: "EN lottery prize with link and processing fee",
    text: "Congratulations! You won $5,000 in the Walmart lottery. Click http://bit.ly/claim-now and pay a $50 processing fee to receive your prize.",
    expected: "high",
    mustInclude: ["prize", "link", "upfront_fee"],
  },
  {
    name: "EN fake toll text with link",
    text: "FasTrak: You have an unpaid toll of $4.15. Pay now to avoid a late fee and license suspension: https://fastrak-pay.top/ca",
    expected: "notLow",
    mustInclude: ["link"],
  },
  {
    name: "EN notario offering legal help with guaranteed approval",
    text: "I am a notario. I can file your asylum papers myself, no lawyer needed. 100% guaranteed approval.",
    expected: "high",
    mustInclude: ["notario", "guarantee"],
  },
  {
    name: "EN safe family text",
    text: "Hi Mom, I'll be home by 7. Can you save me some dal?",
    expected: "low",
  },
  {
    name: "EN safe appointment reminder",
    text: "Reminder: your dentist appointment is Tuesday at 3pm. Reply C to confirm.",
    expected: "low",
  },

  // ---------- Spanish ----------
  {
    name: "ES notario guaranteeing a green card for an upfront Zelle payment",
    text: "Soy notario público. Le garantizo su green card en 3 meses. Solo pague $2,000 por adelantado en efectivo o por Zelle.",
    expected: "high",
    mustInclude: ["notario", "guarantee", "payment"],
  },
  {
    name: "ES safe school message",
    text: "Hola, la reunión de padres es el jueves a las 6 en la escuela. ¡Los esperamos!",
    expected: "low",
  },

  // ---------- Punjabi (Gurmukhi) ----------
  {
    name: "PA guaranteed Canada visa, upfront fee, secrecy",
    text: "ਕੈਨੇਡਾ ਦਾ ਵੀਜ਼ਾ 100% ਗਾਰੰਟੀ ਨਾਲ! ਪਹਿਲਾਂ 50,000 ਰੁਪਏ ਫੀਸ ਭੇਜੋ। ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸਣਾ।",
    expected: "high",
    mustInclude: ["guarantee", "upfront_fee", "secrecy"],
  },
  {
    name: "PA safe gurdwara announcement",
    text: "ਗੁਰਦੁਆਰੇ ਵਿੱਚ ਐਤਵਾਰ ਨੂੰ ਲੰਗਰ ਸਵੇਰੇ 11 ਵਜੇ ਹੈ।",
    expected: "low",
  },

  // ---------- Hindi ----------
  {
    name: "HI fake police, arrest, gift card payment, secrecy",
    text: "मैं पुलिस से बोल रहा हूँ। आपके बेटे को गिरफ्तार किया गया है। तुरंत गिफ्ट कार्ड से पैसे भेजो, किसी को मत बताना।",
    expected: "high",
    mustInclude: ["government", "urgency", "payment", "secrecy"],
  },
  {
    name: "HI safe temple invitation",
    text: "कल शाम को मंदिर में भजन है, आप आओगे?",
    expected: "low",
  },

  // ---------- Chinese (Simplified) ----------
  {
    name: "ZH fake immigration office, bitcoin fine, deportation",
    text: "这里是移民局。您的身份有问题，必须在24小时内通过比特币支付罚款，否则将被驱逐出境。",
    expected: "high",
    mustInclude: ["government", "payment", "urgency"],
  },
  {
    name: "ZH prize with fee first",
    text: "恭喜您中奖了！请先支付手续费才能领取奖金。",
    expected: "notLow",
    mustInclude: ["prize", "upfront_fee"],
  },
  {
    name: "ZH safe lunch invitation",
    text: "周六中午一起去吃点心吧？",
    expected: "low",
  },

  // ---------- Dari ----------
  {
    name: "FA-AF fake immigration office, deportation threat, secrecy",
    text: "اداره مهاجرت: شما باید فوراً جریمه بپردازید وگرنه دیپورت می‌شوید. به هیچ کس نگویید.",
    expected: "high",
    mustInclude: ["government", "urgency", "secrecy"],
  },
  {
    name: "FA-AF safe tea invitation",
    text: "سلام، فردا ساعت ۵ برای چای به خانه ما بیایید.",
    expected: "low",
  },
];

describe("analyzeWithRules — multilingual cases", () => {
  it.each(cases)("$name", ({ text, expected, mustInclude }) => {
    const result = analyzeWithRules(text);

    if (expected === "notLow") {
      expect(result.risk).not.toBe("low");
    } else {
      expect(result.risk).toBe(expected);
    }

    const found = result.matches.map((m) => m.category);
    for (const category of mustInclude ?? []) {
      expect(found).toContain(category);
    }

    // Safe messages should not trigger any rule at all.
    if (expected === "low") {
      expect(result.matches).toHaveLength(0);
    }
  });
});

describe("analyzeWithRules — always well-formed", () => {
  it("handles an empty message", () => {
    const result = analyzeWithRules("");
    expect(result.score).toBe(0);
    expect(result.risk).toBe("low");
    expect(result.matches).toEqual([]);
  });

  it("keeps the score between 0 and 100, even for a message full of red flags", () => {
    const worstCase = cases.map((c) => c.text).join(" ").repeat(5);
    const result = analyzeWithRules(worstCase);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("is not fooled by UPPERCASE", () => {
    const lower = analyzeWithRules("pay with gift cards or you will be arrested");
    const upper = analyzeWithRules("PAY WITH GIFT CARDS OR YOU WILL BE ARRESTED");
    expect(upper.score).toBe(lower.score);
  });

  it("scores a scam higher than a safe message", () => {
    const scam = analyzeWithRules(cases[0].text);
    const safe = analyzeWithRules("Hi Mom, I'll be home by 7.");
    expect(scam.score).toBeGreaterThan(safe.score);
  });
});
