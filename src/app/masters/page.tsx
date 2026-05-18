import { MastersListClient } from "@/components/masters-list-client";
import { getPublicMastersListFromDb } from "@/lib/masters-list-db";

export const dynamic = "force-dynamic";

export default async function MastersPage() {
  const masters = await getPublicMastersListFromDb();

  return <MastersListClient masters={masters} />;
}