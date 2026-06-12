/* eslint-disable react/no-unescaped-entities */
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

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginStore = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.login({ email, password });
      loginStore({ user: data.user, token: data.token });
      toast.success("Signed in successfully");
      window.location.href = "/";
    } catch (err) {
      const msg = handleAPIError(err);
      setError(msg);
      toast.error(msg || "Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background py-16 px-4">
      <Card className="w-full max-w-md border border-border bg-card shadow-none rounded-none">
        <CardHeader className="space-y-3 text-center pt-10">
          <div className="flex justify-center mb-1">
            <PawPrint className="h-9 w-9 text-[var(--color-bronze)]" />
          </div>
          <p className="eyebrow">Member Access</p>
          <CardTitle className="font-serif text-3xl font-normal">
            Sign in to your account
          </CardTitle>
          <div className="mx-auto h-px w-12 bg-[var(--color-bronze)]" />
          <CardDescription className="text-muted-foreground">
            Enter your email and password to access your account
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--color-bronze-deep)] hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none border-border"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                title="Remember me"
                className="rounded-none border-border accent-[var(--color-bronze)]"
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col mt-4 px-8 pb-10">
            <Button
              className="w-full rounded-none bg-[#26221c] text-[#faf7f2] hover:bg-[var(--color-bronze-deep)] uppercase tracking-[0.18em] text-xs dark:bg-[#faf7f2] dark:text-[#26221c] dark:hover:bg-[var(--color-bronze-soft)]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="mt-5 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-[var(--color-bronze-deep)] hover:text-foreground"
              >
                Sign up
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
