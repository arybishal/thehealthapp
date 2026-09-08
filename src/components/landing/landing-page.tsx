import {
  Activity,
  Cross,
  Droplets,
  HeartPulse,
  Pill,
  Plus,
  Stethoscope,
  Syringe,
  Virus,
} from "lucide-react";
import { LandingNavbar } from "./landing-navbar";
import { LandingHero } from "./landing-hero";
import { DataVisualization } from "./data-viz";
import { LandingFooter } from "./landing-footer";
import {
  AboutSection,
  FamilySection,
  Features,
  FinalCtaSection,
  FreeSection,
  HowItWorks,
  PrivacySection,
  TrustStrip,
  WhySection,
} from "./landing-sections";

const FLOATING_ICONS = [
  { Icon: Plus, size: 26, top: "22%", left: "6%", duration: 7, delay: 0 },
  { Icon: Stethoscope, size: 32, top: "14%", left: "84%", duration: 9, delay: 1.2 },
  { Icon: HeartPulse, size: 24, top: "8%", left: "66%", duration: 6.5, delay: 0.4 },
  { Icon: Droplets, size: 28, top: "40%", left: "88%", duration: 8, delay: 2 },
  { Icon: Activity, size: 30, top: "58%", left: "4%", duration: 7.5, delay: 0.8 },
  { Icon: Syringe, size: 26, top: "72%", left: "92%", duration: 6, delay: 1.6 },
  { Icon: Cross, size: 24, top: "30%", left: "14%", duration: 8.5, delay: 2.4 },
  { Icon: Pill, size: 30, top: "66%", left: "12%", duration: 7, delay: 0.2 },
  { Icon: Virus, size: 34, top: "48%", left: "24%", duration: 9.5, delay: 1 },
  { Icon: HeartPulse, size: 22, top: "82%", left: "44%", duration: 6.5, delay: 3 },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen scroll-smooth bg-[#0f1a26] text-foreground antialiased">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-[#2c9ad1]/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#2fae6b]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#2c9ad1]/15 blur-3xl" />
        {FLOATING_ICONS.map(({ Icon, size, top, left, duration, delay }, i) => (
          <Icon
            key={i}
            className="absolute text-[#2c9ad1]/25"
            style={{
              top,
              left,
              width: size,
              height: size,
              animation: `float-y ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="relative">
        <LandingNavbar />
        <main>
          <LandingHero />
          <TrustStrip />
          <AboutSection />
          <HowItWorks />
          <Features />
          <DataVisualization />
          <FamilySection />
          <WhySection />
          <PrivacySection />
          <FreeSection />
          <FinalCtaSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}