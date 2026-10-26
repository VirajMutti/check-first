"use client";

// "Read aloud" button using the browser's built-in speechSynthesis.
// It only appears if this device has a voice for the chosen language,
// so we never read Punjabi text with an English voice.

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { LangCode } from "@/lib/languages";
import { SpeakerIcon } from "./Icons";

// Voice language codes to look for. Dari voices are usually labeled Persian ("fa").
const VOICE_PREFIXES: Record<LangCode, string[]> = {
  en: ["en"],
  pa: ["pa"],
  hi: ["hi"],
  es: ["es"],
  zh: ["zh-cn", "zh-hans", "cmn", "zh"],
  "fa-AF": ["fa-af", "prs", "fa"],
};

function findVoice(lang: LangCode): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  for (const prefix of VOICE_PREFIXES[lang]) {
    const voice = voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
    if (voice) return voice;
  }
  return null;
}

export function ReadAloud({ text }: { text: string }) {
  const { t, lang } = useI18n();
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);

  // Voices load asynchronously in most browsers, so listen for "voiceschanged".
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const update = () => setVoice(findVoice(lang));
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", update);
      window.speechSynthesis.cancel(); // stop talking if the result closes
    };
  }, [lang]);

  if (!voice) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice!.lang;
    utterance.rate = 0.9; // a little slower is easier to follow
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={speaking} className="btn btn-secondary">
      <SpeakerIcon /> {speaking ? t("result.stopReading") : t("result.readAloud")}
    </button>
  );
}
