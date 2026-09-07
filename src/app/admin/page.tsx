import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [userCount, patientCount, reportCount, resultCount, measurementCount, latestUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.report.count(),
      prisma.labResult.count(),
      prisma.healthMeasurement.count(),
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform-wide overview.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

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
  );
}