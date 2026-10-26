import type { Metadata } from "next";
import { VerifyPicker } from "@/components/VerifyPicker";

export const metadata: Metadata = { title: "Verify someone — Check First" };

export default function VerifyPage() {
  return <VerifyPicker />;
}
