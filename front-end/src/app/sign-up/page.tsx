"use client";

import type React from "react";

import Link from "next/link";
import { useState } from "react";
import { authAPI, handleAPIError } from "@/lib/axios";
import { useAuthStore } from "@/store/cart";
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
import { toast } from "sonner";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginStore = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.register({ name, email, password });
      loginStore({ user: data.user, token: data.token });
      toast.success("Account created successfully");
      window.location.href = "/";
    } catch (err) {
      const msg = handleAPIError(err);
      setError(msg);
      toast.error(msg || "Sign-up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md border border-border bg-card shadow-none rounded-none">
        <CardHeader className="space-y-3 text-center pt-10">
          <div className="flex justify-center mb-1">
            <PawPrint className="h-9 w-9 text-[var(--color-bronze)]" />
          </div>
          <p className="eyebrow">Join the Cattery</p>
          <CardTitle className="font-serif text-3xl font-normal">
            Create an account
          </CardTitle>
          <div className="mx-auto h-px w-12 bg-[var(--color-bronze)]" />
          <CardDescription className="text-muted-foreground">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            {error && (
              <p className="text-sm text-[var(--color-bronze-deep)]" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-none border-border"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none border-border"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long and include a number
                and a special character.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="rounded-none border-border"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="rounded-none border-border accent-[var(--color-bronze)]"
                required
                title="Agree to terms and privacy policy"
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[var(--color-bronze-deep)] hover:text-foreground"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[var(--color-bronze-deep)] hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col px-8 pb-10">
            <Button
              className="w-full rounded-none bg-[#26221c] text-[#faf7f2] hover:bg-[var(--color-bronze-deep)] uppercase tracking-[0.18em] text-xs mt-4 dark:bg-[#faf7f2] dark:text-[#26221c] dark:hover:bg-[var(--color-bronze-soft)]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <div className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
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
                Your information is securely encrypted
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
