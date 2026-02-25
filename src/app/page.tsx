import { redirect } from "next/navigation";
import { isClerkConfigured } from "@/lib/env";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  if (isClerkConfigured()) {
    const { userId } = await auth();
    redirect(userId ? "/dashboard" : "/sign-in");
  }

  redirect("/sign-in");
}

