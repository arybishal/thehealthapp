"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Calendar,
  Download,
  Droplets,
  Eye,
  FileText,
  HeartPulse,
  MoreHorizontal,
  Pencil,
  Search,
  Sun,
  TestTube2,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import type { ComponentType } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Report {
  id: string;
  title: string;
  reportType: string | null;
  laboratoryName: string | null;
  reportDate: Date | string | null;
  fileName: string;
  createdAt: Date | string;
  results: { id: string }[];
}

interface ReportListProps {
  reports: Report[];
  patientId?: string;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: ComponentType<{ className?: string }>; boxClass: string }
> = {
  cbc: {
    label: "Blood Tests",
    icon: TestTube2,
    boxClass: "bg-primary-light/60 text-primary",
  },
  lipid: {
    label: "Lipid Profile",
    icon: HeartPulse,
    boxClass: "bg-secondary/15 text-secondary",
  },
  diabetes: {
    label: "Diabetes",
    icon: Droplets,
    boxClass: "bg-warning-light text-warning",
  },
  thyroid: {
    label: "Thyroid",
    icon: Activity,
    boxClass: "bg-info-light text-info",
  },
  vitamin: {
    label: "Vitamin",
    icon: Sun,
    boxClass: "bg-violet-100 text-violet-700",
  },
  kidney: {
    label: "Kidney",
    icon: Droplets,
    boxClass: "bg-secondary/15 text-secondary",
  },
  liver: {
    label: "Liver",
    icon: Activity,
    boxClass: "bg-warning-light text-warning",
  },
};

const FALLBACK_TYPE = {
  label: "Blood Tests",
  icon: FileText,
  boxClass: "bg-muted text-muted-foreground",
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Reports" },
  { value: "cbc", label: "CBC" },
  { value: "lipid", label: "Lipid Profile" },
  { value: "diabetes", label: "Diabetes" },
  { value: "thyroid", label: "Thyroid" },
  { value: "vitamin", label: "Vitamin" },
  { value: "kidney", label: "Kidney" },
  { value: "liver", label: "Liver" },
  { value: "other", label: "Other" },
];

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "year", label: "This Year" },
  { value: "6months", label: "Last 6 Months" },
  { value: "custom", label: "Custom Date" },
];

const KNOWN_TYPES = Object.keys(TYPE_CONFIG);

function formatDate(d: Date | string | null) {
  if (!d) return "No date";
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatUploadDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTypeConfig(type: string | null) {
  if (!type) return FALLBACK_TYPE;
  return TYPE_CONFIG[type] ?? FALLBACK_TYPE;
}

export function ReportList({ reports, patientId }: ReportListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const reportBase = patientId
    ? `/patients/${patientId}/reports`
    : "/reports";
  const uploadHref = patientId
    ? `/patients/${patientId}/reports/upload`
    : "/reports/upload";

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Rename
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Report | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const now = new Date();

    return reports.filter((r) => {
      // Type filter
      if (activeFilter !== "all") {
        if (activeFilter === "other") {
          if (KNOWN_TYPES.includes(r.reportType ?? "")) return false;
        } else if (r.reportType !== activeFilter) {
          return false;
        }
      }

      // Date filter
      const reportDate = r.reportDate ? new Date(r.reportDate) : null;
      if (dateFilter === "year" && reportDate) {
        if (reportDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateFilter === "6months" && reportDate) {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (reportDate < sixMonthsAgo) return false;
      } else if (dateFilter === "custom" && reportDate) {
        if (customFrom && reportDate < new Date(customFrom)) return false;
        if (customTo) {
          const to = new Date(customTo);
          to.setHours(23, 59, 59);
          if (reportDate > to) return false;
        }
      }

      // Search
      if (q) {
        const titleMatch = r.title.toLowerCase().includes(q);
        const labMatch = (r.laboratoryName ?? "").toLowerCase().includes(q);
        const typeMatch = (getTypeConfig(r.reportType).label ?? "").toLowerCase().includes(q);
        const dateMatch = formatDate(r.reportDate).toLowerCase().includes(q);
        if (!titleMatch && !labMatch && !typeMatch && !dateMatch) return false;
      }

      return true;
    });
  }, [reports, search, activeFilter, dateFilter, customFrom, customTo]);

  function openRename(report: Report) {
    setRenameTarget(report);
    setRenameValue(report.title);
    setRenameOpen(true);
  }

  async function handleRename() {
    if (!renameTarget || !renameValue.trim()) return;
    setRenaming(true);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: renameTarget.id, title: renameValue.trim() }),
      });
      if (res.ok) {
        setRenameOpen(false);
        startTransition(() => router.refresh());
      }
    } finally {
      setRenaming(false);
    }
  }

  function openDelete(report: Report) {
    setDeleteTarget(report);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      if (res.ok) {
        setDeleteOpen(false);
        startTransition(() => router.refresh());
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search reports, tests or laboratories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {DATE_OPTIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => setDateFilter(d.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              dateFilter === d.value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.label}
          </button>
        ))}
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2 ml-1">
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-7 w-36 text-xs"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-7 w-36 text-xs"
            />
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "report" : "reports"}
        {activeFilter !== "all" || search || dateFilter !== "all"
          ? " found"
          : ""}
      </p>

      {/* Desktop table */}
      {filtered.length > 0 && (
        <div className="hidden md:block border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_1fr_90px_100px_50px] gap-3 bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground border-b">
            <span>Report</span>
            <span>Date</span>
            <span>Laboratory</span>
            <span className="text-center">Results</span>
            <span className="text-center">Status</span>
            <span></span>
          </div>
          {/* Rows */}
          {filtered.map((report) => {
            const tc = getTypeConfig(report.reportType);
            const Icon = tc.icon;
            return (
              <div
                key={report.id}
                className="grid grid-cols-[1fr_120px_1fr_90px_100px_50px] gap-3 items-center px-4 py-3 border-b last:border-0 group transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tc.boxClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {report.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tc.label}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(report.reportDate)}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {report.laboratoryName || "—"}
                </p>
                <p className="text-sm text-center">
                  {report.results.length}
                </p>
                <div className="flex justify-center">
                  <StatusBadge tone="normal" label="Processed" />
                </div>
                <ReportActions
                  report={report}
                  onRename={openRename}
                  onDelete={openDelete}
                  reportBase={reportBase}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile cards */}
      {filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map((report) => {
            const tc = getTypeConfig(report.reportType);
            const Icon = tc.icon;
            return (
              <Card key={report.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tc.boxClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{report.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tc.label} • {formatDate(report.reportDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.laboratoryName || "Unknown lab"} •{" "}
                      {report.results.length} results
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <StatusBadge tone="normal" label="Processed" />
                  <div className="flex items-center gap-2">
                    <Link
                      href={`${reportBase}/${report.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <Eye />
                      View
                    </Link>
                    <a
                      href={`/api/files/${report.id}`}
                      download={report.fileName}
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    >
                      <Download />
                    </a>
                    <ReportActions
                      report={report}
                      onRename={openRename}
                      onDelete={openDelete}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
            <FileText className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">
            {search || activeFilter !== "all" || dateFilter !== "all"
              ? "No reports match your filters"
              : "Your health history starts here."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            {search || activeFilter !== "all" || dateFilter !== "all"
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Upload your first medical report and turn it into structured health data."}
          </p>
          {!search && activeFilter === "all" && dateFilter === "all" && (
            <Link href={uploadHref} className="mt-5 inline-block">
              <Button>
                <FileText />
                Upload Report
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Report</DialogTitle>
            <DialogDescription>
              Give this report a descriptive name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="rename-input">Report title</Label>
            <Input
              id="rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={renaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renaming || !renameValue.trim()}
            >
              {renaming && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}
              &rdquo;? This will permanently remove the report and all its
              extracted results. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="animate-spin" />}
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReportActions({
  report,
  onRename,
  onDelete,
  reportBase = "/reports",
}: {
  report: Report;
  onRename: (r: Report) => void;
  onDelete: (r: Report) => void;
  reportBase?: string;
}) {
  const fileUrl = `/api/files/${report.id}`;
  const viewUrl = `${reportBase}/${report.id}`;

  return (
    <div className="flex items-center justify-end">
      {/* Desktop: hover actions */}
      <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={viewUrl}
          className={buttonVariants({ variant: "ghost", size: "icon-xs" })}
          title="View"
        >
          <Eye className="h-3.5 w-3.5" />
        </Link>
        <a
          href={fileUrl}
          download={report.fileName}
          className={buttonVariants({ variant: "ghost", size: "icon-xs" })}
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: "ghost", size: "icon-xs" })}
            title="More"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRename(report)}>
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<a href={fileUrl} download={report.fileName} />}
            >
              <Download />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(report)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: compact More menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: "ghost", size: "icon-xs" })}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={<a href={viewUrl} />}
            >
              <Eye />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<a href={fileUrl} download={report.fileName} />}
            >
              <Download />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRename(report)}>
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(report)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}