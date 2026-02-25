"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { isClerkConfigured } from "@/lib/env";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Github, Chrome, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { SignIn } from "@clerk/nextjs";

export default function SignInScreen() {
  const router = useRouter();
  const clerk = useMemo(() => isClerkConfigured(), []);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onDemoSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    if (email.toLowerCase().includes("fail")) {
      toast.error("Unable to sign in", { description: "Check your credentials." });
      return;
    }
    toast.success("Welcome back", { description: "Signed in (demo mode)." });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(1000px_circle_at_20%_-10%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(700px_circle_at_90%_0%,rgba(59,130,246,0.18),transparent_50%)]">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2">
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[--color-success]" />
            Secure sessions with Clerk
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Sign in to your
            <span className="bg-[var(--gradient-accent)] bg-clip-text text-transparent">
              {" "}workspace
            </span>
            .
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Minimal, production-ready auth screens with clear validation and state handling.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Card className="border-border bg-card/60 p-6 backdrop-blur sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
            </div>

            {!clerk ? (
              <div className="mt-6 grid gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => toast.message("OAuth", { description: "Demo action" })}
                >
                  <Chrome className="h-5 w-5" />
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => toast.message("OAuth", { description: "Demo action" })}
                >
                  <Github className="h-5 w-5" />
                  Continue with GitHub
                </Button>
              </div>
            ) : null}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {clerk ? (
              <div className="grid place-items-center">
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="pl-10"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="pl-10"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <Button className="h-11 w-full rounded-xl" disabled={loading} onClick={onDemoSubmit}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/sign-up" className="font-medium text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Demo mode is active until Clerk env vars are configured.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
