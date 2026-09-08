import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AUDIT_EVENTS } from "@/lib/audit";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [userCount, patientCount, reportCount, resultCount, measurementCount, shareCount, reminderCount, exportCount, latestAudit, latestUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.report.count(),
      prisma.labResult.count(),
      prisma.healthMeasurement.count(),
      prisma.shareLink.count(),
      prisma.reminder.count(),
      prisma.exportLog.count(),
      prisma.auditLogRoleAccess.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { select: { name: true, email: true } },
          patient: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

  const stats = [
    { label: "Total Users", value: userCount },
    { label: "Total Patients", value: patientCount },
    { label: "Total Reports", value: reportCount },
    { label: "Lab Results", value: resultCount },
    { label: "Measurements", value: measurementCount },
    { label: "Share Links", value: shareCount },
    { label: "Reminders", value: reminderCount },
    { label: "Exports", value: exportCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform-wide overview.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link href="/admin/activity" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y">
            {latestAudit.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              latestAudit.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {AUDIT_EVENTS[a.action] ?? a.action}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.user?.name || a.user?.email || "System"}
                      {a.patient ? ` · ${a.patient.name}` : ""}
                      {a.detail ? ` · ${a.detail}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {a.createdAt.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Latest Users</h2>
          <div className="divide-y">
            {latestUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              latestUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {u.role === "master_admin" && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-warning-light text-warning border border-warning/30 font-medium">
                        Admin
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {u.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}