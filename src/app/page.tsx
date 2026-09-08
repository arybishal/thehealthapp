import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata = {
  title: "The Health Trackey by The8Pattern | Every Blood Test. One Clear Health History.",
  description:
    "The Health Trackey helps you organize blood reports, laboratory results, biomarkers, vitals, and patient health history in one place.",
  openGraph: {
    title: "The Health Trackey by The8Pattern | Every Blood Test. One Clear Health History.",
    description:
      "Keep blood reports, laboratory results, biomarkers, vitals, and medical history organized in one place.",
    type: "website",
    siteName: "The Health Trackey by The8Pattern",
  },
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/patients");
  }

  return <LandingPage />;
}