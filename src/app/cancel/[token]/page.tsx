import { CancelAppointmentClient } from "@/components/cancel-appointment-client";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type CancelPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ cancelled?: string }>;
};

export default async function CancelAppointmentPage({
  params,
  searchParams,
}: CancelPageProps) {
  const { token } = await params;
  const queryParams = await searchParams;

  const { data: appointment } = await supabaseAdmin
    .from("appointments")
    .select(
      "service_name, appointment_date, appointment_time, client_name, status"
    )
    .eq("cancel_token", token)
    .maybeSingle();

  return (
    <CancelAppointmentClient
      token={token}
      appointment={appointment}
      cancelledNow={queryParams.cancelled === "1"}
    />
  );
}