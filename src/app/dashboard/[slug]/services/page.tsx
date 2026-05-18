import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ServicesClient } from "@/components/services-client";
import { getMasterFromDb } from "@/lib/masters-db";
import { requireMasterAccess } from "@/lib/master-auth";

export const dynamic = "force-dynamic";

type ServicesPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ updated?: string }>;
};

export default async function MasterServicesPage({
  params,
  searchParams,
}: ServicesPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

  const master = await getMasterFromDb(slug);

  if (!master) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <ServicesClient master={master} updated={queryParams.updated === "1"} />

      <Footer />
    </div>
  );
}