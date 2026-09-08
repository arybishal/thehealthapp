import { requireAdmin } from "@/lib/session";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <AdminNav />
      {children}
    </div>
  );
}