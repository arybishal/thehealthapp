"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [state, setState] = useState<{ resetUrl?: string; error?: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData.get("email") as string);
    setState(result);
    setPending(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>
            Enter your account email to get a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.resetUrl ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-success">
                A reset link was generated. Since no email service is
                configured in this demo, use the link below:
              </p>
              <Link
                href={state.resetUrl}
                className="block break-all text-sm text-primary underline"
              >
                {state.resetUrl}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {state?.error && (
                <p className="text-sm text-danger text-center">{state.error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Generating..." : "Generate reset link"}
              </Button>
            </form>
          )}
          <p className="text-sm text-muted-foreground text-center mt-4">
            <Link href="/login" className="text-primary underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}