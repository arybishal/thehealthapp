"use client";

import { useState, useTransition } from "react";
import {
  Scale,
  Gauge,
  HeartPulse,
  Droplets,
  Thermometer,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMeasurement } from "@/lib/patientActions";

const OPTIONS = [
  { key: "weight", label: "Weight", unit: "kg", icon: Scale, placeholder: "74" },
  {
    key: "blood_pressure",
    label: "Blood Pressure",
    unit: "mmHg",
    icon: Gauge,
    placeholder: "120",
  },
  {
    key: "heart_rate",
    label: "Heart Rate",
    unit: "bpm",
    icon: HeartPulse,
    placeholder: "72",
  },
  {
    key: "blood_sugar",
    label: "Blood Glucose",
    unit: "mg/dL",
    icon: Droplets,
    placeholder: "96",
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    icon: Thermometer,
    placeholder: "36.6",
  },
];

type Option = (typeof OPTIONS)[number];

export function QuickAdd({ patientId }: { patientId?: string }) {
  const [active, setActive] = useState<Option | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function pick(option: Option) {
    setActive(option);
    setOpen(true);
  }

  function handleSave(formData: FormData) {
    if (!patientId) return;
    startTransition(async () => {
      await addMeasurement(patientId, formData);
      setOpen(false);
    });
  }

  const Icon = active?.icon;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => pick(o)}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-light/40 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light/60 text-primary transition-colors group-hover:bg-primary-light">
              <o.icon className="h-5 w-5" />
            </span>
            {o.label}
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {Icon && (
                <Icon className="mr-2 inline-block h-4 w-4 text-primary" />
              )}
              Add {active?.label}
            </DialogTitle>
            <DialogDescription>
              Add a health measurement without uploading a report.
            </DialogDescription>
          </DialogHeader>

          <form action={handleSave} className="space-y-4">
            <input type="hidden" name="type" value={active?.key ?? ""} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qa-value">Value</Label>
                <Input
                  id="qa-value"
                  name="value"
                  type="number"
                  step="0.1"
                  placeholder={active?.placeholder}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-unit">Unit</Label>
                <Input id="qa-unit" name="unit" value={active?.unit ?? ""} readOnly />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qa-date">Date</Label>
              <Input
                id="qa-date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Save Measurement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}