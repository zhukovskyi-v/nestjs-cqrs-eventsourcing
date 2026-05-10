"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { FolderOpen, UserRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [anonLoading, setAnonLoading] = useState(false);
  const [anonError, setAnonError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/browse",
    });
  }

  async function handleAnonymousSignIn() {
    setAnonLoading(true);
    setAnonError(null);
    const { error } = await authClient.signIn.anonymous();
    if (error) {
      setAnonError(error.message ?? "Failed to sign in");
      setAnonLoading(false);
      return;
    }
    router.push("/browse");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="border-b border-border px-8 py-5 bg-muted/40">
          <h1 className="text-lg font-semibold text-center text-foreground tracking-tight">
            CQRS
          </h1>
        </div>

        {/* Body */}
        <div className="px-8 py-10 flex flex-col items-center gap-6 bg-background">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Sign In / Sign Up
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Access your files and folders
            </p>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-3">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              onClick={handleAnonymousSignIn}
              variant="secondary"
              className="w-full gap-2"
              disabled={anonLoading}
            >
              <UserRound className="w-4 h-4" />
              {anonLoading ? "Signing in..." : "Continue as Guest"}
            </Button>

            {anonError && (
              <p className="text-xs text-destructive text-center" role="alert">
                {anonError}
              </p>
            )}
          </div>

          <a
            href="mailto:support@cqrs.com"
            className="text-sm text-blue-600 underline underline-offset-4 hover:text-blue-700"
          >
            Need help?
          </a>
        </div>
      </div>
    </main>
  );
}
