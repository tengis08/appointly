import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function requireMasterAccess(slug: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("appointly_access_token")?.value;

  if (!accessToken) {
    redirect(`/login?next=/dashboard/${slug}`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    redirect(`/login?next=/dashboard/${slug}`);
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select("user_id, master_slug, email")
    .eq("user_id", user.id)
    .single();

  if (accountError || !account) {
    redirect("/login");
  }

  if (account.master_slug !== slug) {
    notFound();
  }

  return account;
}