import { Card, CardContent } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Admin Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform configuration.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <p className="text-sm font-medium">Platform information</p>
          <p className="text-sm text-muted-foreground">
            The master admin role grants access to this panel for platform-wide
            oversight of users, patients, and reports. User and patient data is
            strictly isolated per account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}