import type { Metadata } from "next";
import { HelpPage } from "@/components/HelpPage";

export const metadata: Metadata = { title: "Get help — Check First" };

export default function Help() {
  return <HelpPage />;
}
