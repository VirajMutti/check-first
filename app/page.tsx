import { Checker } from "@/components/Checker";
import { Hero } from "@/components/Hero";

// Home page: a one-line pitch, then the check form.
export default function Home() {
  return (
    <div className="space-y-6">
      <Hero />
      <Checker />
    </div>
  );
}
