import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata = {
  title: "TheBloodTracker | Every Blood Test. One Clear Health History.",
  description:
    "TheBloodTracker helps you organize blood reports, laboratory results, biomarkers, vitals, and patient health history in one place.",
  openGraph: {
    title: "TheBloodTracker | Every Blood Test. One Clear Health History.",
    description:
      "Keep blood reports, laboratory results, biomarkers, vitals, and medical history organized in one place.",
    type: "website",
    siteName: "TheBloodTracker",
  },
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/patients");
  }

  return <LandingPage />;
}