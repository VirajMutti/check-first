import { Checker } from "@/components/Checker";

// Home page: the hero ("Try an example") and the check form both live in
// <Checker> because they share the same state.
export default function Home() {
  return <Checker />;
}
