"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMeasurement } from "@/lib/patientActions";

export function AddMeasurementForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      const result = await addMeasurement(patientId, fd);
      if (result && "error" in result && result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
      {error && <p className="text-sm text-danger sm:col-span-5">{error}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="am-type">Type</Label>
        <select
          id="am-type"
          name="type"
          required
          defaultValue=""
          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="" disabled>
            Select type
          </option>
          <option value="weight">Weight</option>
          <option value="height">Height</option>
          <option value="bmi">BMI</option>
          <option value="blood_pressure">Blood Pressure</option>
          <option value="heart_rate">Heart Rate</option>
          <option value="blood_sugar">Blood Glucose</option>
          <option value="temperature">Temperature</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="am-value">Value</Label>
        <Input
          id="am-value"
          name="value"
          type="number"
          step="0.1"
          required
          placeholder="e.g. 74"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="am-unit">Unit</Label>
        <Input id="am-unit" name="unit" placeholder="kg, mmHg, bpm..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="am-date">Date</Label>
        <Input
          id="am-date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="am-note">Note</Label>
        <Input id="am-note" name="note" placeholder="Optional" />
      </div>
      <div className="sm:col-span-5">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Add Measurement
        </Button>
      </div>
    </form>
  );
}