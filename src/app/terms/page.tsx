export const metadata = {
  title: "Terms of Use | TheBloodTracker",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: January 2026
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 pt-12">
        {[
          {
            title: "About this service",
            body: "TheBloodTracker helps you organize your health records into a structured, searchable health history. It stores and organizes information you provide, including uploaded reports and entered measurements.",
          },
          {
            title: "Not medical advice",
            body: "TheBloodTracker is an organizational tool, not a medical device, diagnosis tool, or substitute for professional medical care. It does not provide medical advice, diagnoses, or treatment recommendations. Always consult a qualified healthcare professional about your health.",
          },
          {
            title: "Your responsibility for data",
            body: "You are responsible for the accuracy of the information you add and for keeping your account credentials safe. Only upload health information you are authorized to manage.",
          },
          {
            title: "Acceptable use",
            body: "You agree not to misuse the service, attempt unauthorized access, or use the service in any way that violates applicable law.",
          },
          {
            title: "Free service",
            body: "TheBloodTracker is currently free to use. No pricing plans, subscriptions or payment features are offered or required.",
          },
          {
            title: "Contact",
            body: "If you have questions about these terms, please reach out through the help section of the application.",
          },
        ].map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold tracking-tight">{s.title}</h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}