"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/env";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Chrome, Github, Loader2, Mail, MessageSquare, Upload, User, Lock } from "lucide-react";

export default function SignUpScreen() {
  const router = useRouter();
  const clerk = useMemo(() => isClerkConfigured(), []);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pickAvatar = () => fileRef.current?.click();

  const onAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const onDemoSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    if (email.toLowerCase().includes("fail")) {
      toast.error("Unable to create account", { description: "Email already in use." });
      return;
    }
    toast.success("Account created", { description: "Signed up (demo mode)." });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(1000px_circle_at_20%_-10%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(700px_circle_at_90%_0%,rgba(59,130,246,0.18),transparent_50%)]">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2">
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Create your profile
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Start chatting with a
            <span className="bg-[var(--gradient-accent)] bg-clip-text text-transparent">
              {" "}new vibe
            </span>
            .
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Avatar preview, clean hierarchy, and production-friendly structure.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Card className="border-border bg-card/60 p-6 backdrop-blur sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold">Create an account</h2>
              <p className="mt-1 text-sm text-muted-foreground">Join the workspace</p>
            </div>

            {!clerk ? (
              <>
                <div className="mt-6 flex flex-col items-center">
                  <button
                    type="button"
                    className="group relative"
                    onClick={pickAvatar}
                    aria-label="Upload profile picture"
                    title="Upload profile picture"
                  >
                    <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                      <AvatarImage src={avatarUrl} alt="Avatar preview" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="h-6 w-6 text-white" />
                    </span>
                  </button>
                  <label htmlFor="avatar" className="sr-only">
                    Profile picture
                  </label>
                  <input
                    id="avatar"
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onAvatar(e.target.files?.[0])}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">Upload profile picture</p>
                </div>

                <div className="mt-6 grid gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={() => toast.message("OAuth", { description: "Demo action" })}
                  >
                    <Chrome className="h-5 w-5" />
                    Sign up with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={() => toast.message("OAuth", { description: "Demo action" })}
                  >
                    <Github className="h-5 w-5" />
                    Sign up with GitHub
                  </Button>
                </div>
              </>
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
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                </div>
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
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <Button className="h-11 w-full rounded-xl" disabled={loading} onClick={onDemoSubmit}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="font-medium text-primary hover:underline">
                    Sign in
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
