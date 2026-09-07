import { cn } from "cn";

export type StatusTone = "normal" | "attention" | "danger" | "unknown";

const toneStyles: Record<StatusTone, string> = {
  normal:
    "bg-success-light text-success border-success/20",
  attention:
    "bg-warning-light text-warning border-warning/30",
  danger:
    "bg-danger-light text-danger border-danger/25",
  unknown: "bg-muted text-muted-foreground border-border",
};

const dotStyles: Record<StatusTone, string> = {
  normal: "bg-success",
  attention: "bg-warning",
  danger: "bg-danger",
  unknown: "bg-muted-foreground/40",
};

const defaultLabels: Record<StatusTone, string> = {
  normal: "Normal",
  attention: "Attention",
  danger: "Outside range",
  unknown: "Unknown",
};

export function StatusBadge({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          dotStyles[tone]
        )}
        aria-hidden
      />
      {label ?? defaultLabels[tone]}
    </span>
  );
}

/**
 * Map a lab result flag (H, L, H*, L* or null) to a status tone.
 */
export function flagToTone(flag: string | null): StatusTone {
  if (flag === "H" || flag === "L") return "danger";
  if (flag === "H*" || flag === "L*") return "attention";
  return "normal";
}

export function flagToLabel(flag: string | null): string {
  if (flag === "H") return "High";
  if (flag === "L") return "Low";
  if (flag === "H*") return "Borderline high";
  if (flag === "L*") return "Borderline low";
  return "Normal";
}
