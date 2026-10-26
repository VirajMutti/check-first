import type { Metadata } from "next";
import { LearnCards } from "@/components/LearnCards";

export const metadata: Metadata = { title: "Learn the scams — Check First" };

export default function LearnPage() {
  return <LearnCards />;
}
