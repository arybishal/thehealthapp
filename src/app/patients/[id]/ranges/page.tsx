import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Ruler } from "lucide-react";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientRangesPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!patient) notFound();

  const ranges = await prisma.referenceRange.findMany({
    where: { patientId: id },
    orderBy: [{ biomarker: "asc" }, { createdAt: "desc" }],
  });

  const grouped = new Map<string, typeof ranges>();
  for (const r of ranges) {
    if (!grouped.has(r.biomarker)) grouped.set(r.biomarker, []);
    grouped.get(r.biomarker)!.push(r);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Reference Ranges
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Personalized reference ranges for {patient.name}.
          </p>
        </div>
      </div>

      {ranges.length === 0 ? (
        <Card className="py-16 text-center">
          <Ruler className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="mt-4 font-semibold">No personalized ranges yet</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
            Add custom reference ranges to track biomarkers against your own targets.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([biomarker, entries]) => (
            <Card key={biomarker} className="overflow-hidden">
              <div className="px-4 py-3 bg-muted/50 border-b border-border">
                <p className="font-semibold text-sm">{biomarker}</p>
              </div>
              <div className="divide-y divide-border">
                {entries.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">{r.source}</Badge>
                      <span className="font-medium">
                        {r.lower !== null ? r.lower : "?"} – {r.upper !== null ? r.upper : "?"}
                        {r.unit ? ` ${r.unit}` : ""}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {r.gender && <span className="mr-2 capitalize">{r.gender}</span>}
                      {r.ageMin !== null && r.ageMax !== null && (
                        <span>{r.ageMin}–{r.ageMax} yrs</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-info-light border border-info/25 rounded-xl p-4 text-sm text-info">
        <p className="font-semibold mb-1">About reference ranges</p>
        <p>
          The ranges shown on lab reports reflect general population norms.
          Personalized ranges let you track your own health goals with your
          healthcare professional.
        </p>
      </div>
    </div>
  );
}