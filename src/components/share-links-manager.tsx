"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link as LinkIcon, Copy, Loader2, Shield, Trash2 } from "lucide-react";

interface ShareLink {
  id: string;
  token: string;
  label: string | null;
  includeReports: boolean;
  includeResults: boolean;
  includeVitals: boolean;
  includeDetails: boolean;
  includeTimeline: boolean;
  includeInsights: boolean;
  expiresAt: Date | null;
  revoked: boolean;
  createdAt: Date;
  lastAccessedAt: Date | null;
  accessCount: number;
  patient: { name: string; id: string };
}

export function ShareLinksManager({
  patientId,
  patientName,
  initialLinks,
}: {
  patientId: string;
  patientName: string;
  initialLinks: ShareLink[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [includeReports, setIncludeReports] = useState(true);
  const [includeResults, setIncludeResults] = useState(true);
  const [includeVitals, setIncludeVitals] = useState(false);
  const [includeDetails, setIncludeDetails] = useState(false);
  const [includeTimeline, setIncludeTimeline] = useState(false);
  const [includeInsights, setIncludeInsights] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          label,
          expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
          includeReports,
          includeResults,
          includeVitals,
          includeDetails,
          includeTimeline,
          includeInsights,
        }),
      });
      if (!res.ok) throw new Error("Failed to create share link");
      const data = await res.json();
      const url = `${window.location.origin}/s/${data.token}`;
      setCreatedLink(url);
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Failed to create share link.");
    } finally {
      setSaving(false);
    }
  }

  async function revokeLink(id: string) {
    await fetch("/api/shares", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, revoked: true }),
    });
    router.refresh();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
  }

  const activeLinks = initialLinks.filter((l) => !l.revoked);
  const revokedLinks = initialLinks.filter((l) => l.revoked);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Create secure share links to let doctors or family view this patient&apos;s health data.
        </p>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <LinkIcon className="h-4 w-4" /> Create Share Link
          </Button>
        )}
      </div>

      {createdLink && (
        <Card className="bg-success-light border-success/25">
          <CardContent className="p-4 space-y-2">
            <p className="font-medium text-sm text-success">Share link created</p>
            <div className="flex items-center gap-2">
              <Input className="flex-1 text-sm" value={createdLink} readOnly />
              <Button size="sm" onClick={() => copyLink(createdLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with your healthcare provider. Anyone with this link can view
              the selected data until it expires or is revoked.
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Label (optional)</Label>
                <Input placeholder="e.g. Dr. Smith - March visit" value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expires after (days, optional)</Label>
                <Input type="number" placeholder="e.g. 30" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Include in share</Label>
              <div className="flex flex-wrap gap-3 text-sm">
                {[
                  { label: "Reports", checked: includeReports, onChange: setIncludeReports },
                  { label: "Lab results", checked: includeResults, onChange: setIncludeResults },
                  { label: "Vitals", checked: includeVitals, onChange: setIncludeVitals },
                  { label: "Patient details", checked: includeDetails, onChange: setIncludeDetails },
                  { label: "Timeline", checked: includeTimeline, onChange: setIncludeTimeline },
                  { label: "AI insights", checked: includeInsights, onChange: setIncludeInsights },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="rounded" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                {saving ? "Creating..." : "Create Link"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Active Links</p>
          {activeLinks.map((link) => {
            const url = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${link.token}`;
            return (
              <Card key={link.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="font-medium text-sm">{link.label || `Link ${link.token.slice(0, 8)}`}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created {new Date(link.createdAt).toLocaleDateString()}
                    {link.expiresAt && ` · Expires ${new Date(link.expiresAt).toLocaleDateString()}`}
                    {link.accessCount > 0 && ` · Accessed ${link.accessCount}×`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => copyLink(url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => revokeLink(link.id)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {revokedLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Revoked</p>
          {revokedLinks.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-sm">
              <span className="text-muted-foreground">{link.label || link.token.slice(0, 8)}</span>
              <span className="text-xs text-danger">Revoked</span>
            </div>
          ))}
        </div>
      )}

      {initialLinks.length === 0 && !showForm && (
        <Card className="py-12 text-center">
          <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            No share links created yet. Create one to securely share {patientName}&apos;s health data.
          </p>
        </Card>
      )}
    </div>
  );
}