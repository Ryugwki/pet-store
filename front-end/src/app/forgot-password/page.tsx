"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PawPrint, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate password reset request
    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset link sent to your email!");
      window.location.href = "/sign-in";
    }, 1500);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background py-16 px-4">
      <Card className="w-full max-w-md border border-border bg-card shadow-none rounded-none">
        <CardHeader className="space-y-3 text-center pt-10">
          <div className="flex justify-center mb-1">
            <PawPrint className="h-9 w-9 text-[var(--color-bronze)]" />
          </div>
          <p className="eyebrow">Account Recovery</p>
          <CardTitle className="font-serif text-3xl font-normal">
            Forgot your password?
          </CardTitle>
          <div className="mx-auto h-px w-12 bg-[var(--color-bronze)]" />
          <CardDescription className="text-muted-foreground">
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-none border-border"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col px-8 pb-10">
            <Button
              className="w-full rounded-none bg-[#26221c] text-[#faf7f2] hover:bg-[var(--color-bronze-deep)] uppercase tracking-[0.18em] text-xs dark:bg-[#faf7f2] dark:text-[#26221c] dark:hover:bg-[var(--color-bronze-soft)]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="mt-5 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="text-[var(--color-bronze-deep)] hover:text-foreground"
              >
                Sign in
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center">
              <Lock className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">
                Secure, encrypted connection
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
