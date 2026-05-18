import { AppointmentsLoginClient } from "@/components/appointments-login-client";

export const dynamic = "force-dynamic";

type AppointmentsLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    loggedOut?: string;
  }>;
};

export default async function AppointmentsLoginPage({
  searchParams,
}: AppointmentsLoginPageProps) {
  const queryParams = await searchParams;

  return (
    <AppointmentsLoginClient
      hasError={queryParams.error === "1"}
      loggedOut={queryParams.loggedOut === "1"}
    />
  );
}
