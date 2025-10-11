import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="font-bold text-2xl flex flex-col items-center justify-center h-screen gap-4"
      style={{
        fontFamily: "--font-lato",
      }}
    >
      Hello
      <span className="text-4xl">World</span>
      <Button size={"lg"} asChild variant={"outline"}>
        <Link className="" href="/dashboard">
          Go to Dashboard
        </Link>
      </Button>
    </div>
  );
}
