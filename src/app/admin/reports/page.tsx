import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { getReportCategoryLabel } from "@/lib/biomarkers";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      patient: { select: { name: true } },
      user: { select: { name: true, email: true } },
      _count: { select: { results: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Recently uploaded reports across all users.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-3 px-4 font-medium">Report</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Patient</th>
              <th className="py-3 px-4 font-medium">Owner</th>
              <th className="py-3 px-4 font-medium">Results</th>
              <th className="py-3 px-4 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground">
                  No reports yet.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-medium">{r.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {getReportCategoryLabel(r.reportType)}
                  </td>
                  <td className="py-3 px-4">{r.patient?.name || "—"}</td>
                  <td className="py-3 px-4">
                    <p>{r.user?.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                  </td>
                  <td className="py-3 px-4">{r._count.results}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {r.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}