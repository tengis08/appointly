import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AvailabilityClient } from "@/components/availability-client";
import { requireMasterAccess } from "@/lib/master-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type AvailabilityPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    saved?: string;
    cancelled?: string;
  }>;
};

export default async function AvailabilityPage({
  params,
  searchParams,
}: AvailabilityPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;

  await requireMasterAccess(slug);

  const { data: master } = await supabaseAdmin
    .from("masters")
    .select("slug")
    .eq("slug", slug)
    .single();

  if (!master) {
    notFound();
  }

  const { data: workingDays } = await supabaseAdmin
    .from("master_working_days")
    .select("day_of_week, start_time, end_time")
    .eq("master_slug", slug)
    .order("day_of_week", { ascending: true });

  const { data: blockedDates } = await supabaseAdmin
    .from("master_blocked_dates")
    .select("blocked_date, reason")
    .eq("master_slug", slug)
    .order("blocked_date", { ascending: true });

  const cancelledCount = Number(queryParams.cancelled || 0);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Header />

      <AvailabilityClient
        slug={slug}
        workingDays={workingDays || []}
        blockedDates={blockedDates || []}
        saved={queryParams.saved === "1"}
        cancelledCount={Number.isNaN(cancelledCount) ? 0 : cancelledCount}
      />

      <Footer />
    </div>
  );
}