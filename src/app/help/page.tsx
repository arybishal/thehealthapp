import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileUp, LifeBuoy, MessageCircle, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Help & Support — The Health Trackey" };

const articles = [
  {
    title: "Uploading a medical report",
    body: "Select a patient, then upload a PDF, JPG, or PNG of their blood test report and we'll extract the results automatically.",
    href: "/patients",
    cta: "Go to Patients",
    icon: FileUp,
    iconClass: "bg-primary-light/60 text-primary",
  },
  {
    title: "Finding a biomarker or report",
    body: "Use the search bar in the top bar to find any biomarker, laboratory, or report in your account.",
    href: "/search",
    cta: "Open Search",
    icon: Search,
    iconClass: "bg-info-light text-info",
  },
  {
    title: "Understanding your results",
    body: "Charts show reference ranges from your original laboratory report. Results are for reference only.",
    href: "/patients",
    cta: "View Patients",
    icon: MessageCircle,
    iconClass: "bg-secondary/15 text-secondary",
  },
];

export default async function HelpPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Help & Support</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Get the most out of The Health Trackey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((a) => (
          <Card key={a.title} className="p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.iconClass}`}>
              <a.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold">{a.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground flex-1">{a.body}</p>
            <Link href={a.href} className="mt-4 inline-block">
              <Button size="sm" variant="secondary">
                {a.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-light text-warning">
          <LifeBuoy className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-semibold">Still need help?</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
          If you have a question or run into an issue, reach out and we&apos;ll
          do our best to help.
        </p>
        <p className="mt-3 text-sm font-medium text-primary">
          support@thebloodtracker.com
        </p>
      </Card>
    </div>
  );
}