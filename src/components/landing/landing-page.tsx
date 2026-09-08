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

export function LandingPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground antialiased">
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
  );
}