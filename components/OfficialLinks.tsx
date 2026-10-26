"use client";

// A list of official website links, labeled in the current language.
// Link ids and URLs live in data/resources.json.

import resources from "@/data/resources.json";
import { useI18n } from "@/lib/i18n";
import { ExternalIcon } from "./Icons";

const URLS = resources.links as Record<string, string>;

export function OfficialLinks({ ids }: { ids: string[] }) {
  const { t } = useI18n();
  return (
    <ul className="space-y-2">
      {ids.map((id) => (
        <li key={id}>
          <a href={URLS[id]} target="_blank" rel="noopener noreferrer" className="link-row">
            <span>{t(`links.${id}`)}</span>
            <ExternalIcon className="h-4 w-4 shrink-0" />
          </a>
        </li>
      ))}
    </ul>
  );
}
