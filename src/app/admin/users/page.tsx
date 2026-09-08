import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { isDemoEmail } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { patients: true, reports: true, measurements: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All registered accounts.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-3 px-4 font-medium">User</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Patients</th>
              <th className="py-3 px-4 font-medium">Reports</th>
              <th className="py-3 px-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 px-4">
                  <p className="font-medium flex items-center gap-2">
                    {u.name || "Unnamed"}
                    {isDemoEmail(u.email) && (
                      <span className="text-xs px-2 py-0.5 rounded-md border font-semibold bg-primary-light text-primary border-primary/20">
                        Demo
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                      u.role === "master_admin"
                        ? "bg-warning-light text-warning border-warning/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4">{u._count.patients}</td>
                <td className="py-3 px-4">{u._count.reports}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {u.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}