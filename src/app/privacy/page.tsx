export const metadata = {
  title: "Privacy Policy | TheBloodTracker",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: January 2026
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 pt-12">
        {[
          {
            title: "Your health information stays under your control",
            body: "TheBloodTracker is designed so that your health information remains under your control. You create and manage your own account, decide which patient profiles to create, and decide which reports to upload.",
          },
          {
            title: "Private patient records",
            body: "Each patient profile created under your account keeps its own independent record of reports, results, vitals, medical details, trends, timeline and summary. Records are scoped to your account and are not visible to other users.",
          },
          {
            title: "Account access",
            body: "Access to your health history is protected by secure sign-in. Keep your credentials private and sign out on shared devices.",
          },
          {
            title: "Data you can export and delete",
            body: "You can download your original uploaded report files for export at any time. You can also delete individual reports, patient profiles, or your account data. Deleting data removes it from the application.",
          },
          {
            title: "No selling of health data",
            body: "Your health information is not sold to third parties.",
          },
          {
            title: "Contact",
            body: "If you have questions about this policy, please reach out through the help section of the application.",
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