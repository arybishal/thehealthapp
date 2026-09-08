"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CalendarDays, Loader2 } from "lucide-react";

interface Reminder {
  id: string;
  testName: string;
  date: Date;
  recurrence: string;
  notes: string | null;
  status: string;
  createdAt: Date;
}

const recurrenceOptions = [
  { value: "none", label: "Once" },
  { value: "3-months", label: "Every 3 months" },
  { value: "6-months", label: "Every 6 months" },
  { value: "yearly", label: "Yearly" },
];

export function RemindersPanel({
  patientId,
  initialReminders,
}: {
  patientId: string;
  initialReminders: Reminder[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [testName, setTestName] = useState("");
  const [date, setDate] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!testName.trim() || !date) {
      setError("Test name and date are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, testName, date, recurrence, notes }),
      });
      if (!res.ok) throw new Error("Failed to create reminder");
      setShowForm(false);
      setTestName("");
      setDate("");
      setRecurrence("none");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError("Failed to create reminder.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  const active = initialReminders.filter((r) => r.status === "active");
  const past = initialReminders.filter((r) => r.status !== "active");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> New Reminder
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test name</Label>
                <Input
                  placeholder="e.g. HbA1c, Lipid Panel, Vitamin D"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Repeat</Label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                >
                  {recurrenceOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="e.g. Fasting required"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                {saving ? "Creating..." : "Create Reminder"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {active.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Upcoming</p>
          {active.map((r) => (
            <Card key={r.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{r.testName}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    {r.recurrence !== "none" && ` • ${recurrenceOptions.find((o) => o.value === r.recurrence)?.label ?? r.recurrence}`}
                    {r.notes && ` • ${r.notes}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "completed")}>
                  Done
                </Button>
                <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "cancelled")}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Past</p>
          {past.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-medium">{r.testName}</span>
                <Badge variant="outline">{r.status}</Badge>
              </div>
              <span className="text-muted-foreground">
                {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}