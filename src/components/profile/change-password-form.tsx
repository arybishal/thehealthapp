"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "@/lib/profileActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    null as ChangePasswordState | null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error && (
        <p
          role="alert"
          className="rounded-pill bg-status-critical-bg px-4 py-2 text-sm font-medium text-status-critical-text"
        >
          {state.error}
        </p>
      )}
      {state?.success && (
        <p
          role="status"
          className="rounded-pill bg-status-good-bg px-4 py-2 text-sm font-medium text-status-good-text"
        >
          Password updated successfully.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}