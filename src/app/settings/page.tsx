import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bell, Moon, Shield, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings — TheBloodTracker" };

const sections = [
  {
    title: "Notifications",
    description: "Choose which health updates you want to be notified about.",
    icon: Bell,
    iconClass: "bg-info-light text-info",
  },
  {
    title: "Appearance",
    description: "Manage theme and display preferences.",
    icon: Moon,
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    title: "Privacy & Data",
    description: "Review how your medical data is stored and used.",
    icon: Shield,
    iconClass: "bg-secondary/15 text-secondary",
  },
];

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your application preferences and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Card key={s.title} className="p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.iconClass}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Preferences</CardTitle>
          <CardDescription>
            Settings and preferences are coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-md">
            Detailed preference controls will be available here shortly. Your
            core health profile can be managed from the Profile page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}