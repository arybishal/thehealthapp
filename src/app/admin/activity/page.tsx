import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AUDIT_EVENTS } from "@/lib/audit";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const [recentReports, recentMeasurements, recentAudit] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        patient: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.healthMeasurement.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        patient: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLogRoleAccess.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        patient: { select: { name: true } },
      },
    }),
  ]);

  type ActivityItem = {
    id: string;
    kind: string;
    title: string;
    owner: string;
    date: Date;
  };

  const activity: ActivityItem[] = [
    ...recentAudit.map((a) => ({
      id: `a-${a.id}`,
      kind: AUDIT_EVENTS[a.action] ?? a.action,
      title: a.detail || a.patient?.name || "Event",
      owner: a.user?.name || a.user?.email || "System",
      date: a.createdAt,
    })),
    ...recentReports.map((r) => ({
      id: `r-${r.id}`,
      kind: "Report uploaded",
      title: r.title,
      owner: r.user?.name || r.user?.email || "Unknown",
      date: r.createdAt,
    })),
    ...recentMeasurements.map((m) => ({
      id: `m-${m.id}`,
      kind: "Measurement added",
      title: `${m.type} ${m.value} ${m.unit}`,
      owner: m.user?.name || m.user?.email || "Unknown",
      date: m.createdAt,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Recent platform activity.
        </p>
      </div>

      <Card>
        <div className="divide-y">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">No activity yet.</p>
          ) : (
            activity.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.kind} by {a.owner}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {a.date.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}