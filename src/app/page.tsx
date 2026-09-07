import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/patients");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full space-y-8 py-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">TheBloodTracker</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload your blood test reports, and we extract every result into a
            clean, searchable health history with trends and reference ranges.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register">
              <Button size="lg">Create your account</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="ghost" size="lg">
                View demo →
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Upload any report", "PDF or photo. OCR extracts HbA1c, CBC, lipids, vitamins and more."],
            ["Normalized biomarkers", "50+ biomarkers with aliases and unit conversion across reports."],
            ["Track over time", "Trend charts with clinical reference ranges and abnormal flags."],
          ].map(([title, body]) => (
            <Card key={title} className="p-6">
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground whitespace-normal">
                {body}
              </p>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          No account yet? Try the live walkthrough first —{" "}
          <Link href="/demo" className="text-primary underline">
            open the demo
          </Link>
          .
        </p>
      </div>
    </div>
  );
}