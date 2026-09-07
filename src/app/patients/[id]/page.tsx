import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function PatientRootPage({ params }: { params: Params }) {
  const { id } = await params;
  redirect(`/patients/${id}/overview`);
}