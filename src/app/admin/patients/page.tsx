import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminPatientsPage() {
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { reports: true, measurements: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Patients</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All patient records across users.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-3 px-4 font-medium">Patient</th>
              <th className="py-3 px-4 font-medium">Owner</th>
              <th className="py-3 px-4 font-medium">Reports</th>
              <th className="py-3 px-4 font-medium">Measurements</th>
              <th className="py-3 px-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((p) => (
              <tr key={p.id}>
                <td className="py-3 px-4 font-medium">{p.name}</td>
                <td className="py-3 px-4">
                  <p>{p.user?.name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                </td>
                <td className="py-3 px-4">{p._count.reports}</td>
                <td className="py-3 px-4">{p._count.measurements}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {p.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}