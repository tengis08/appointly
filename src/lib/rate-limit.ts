import { supabaseAdmin } from "@/lib/supabase-admin";

type RateLimitParams = {
  key: string;
  limit: number;
  windowSeconds: number;
};

export async function checkRateLimit(params: RateLimitParams) {
  const windowStart = new Date(
    Date.now() - params.windowSeconds * 1000
  ).toISOString();

  const { count, error: countError } = await supabaseAdmin
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("rate_key", params.key)
    .gte("created_at", windowStart);

  if (countError) {
    console.error("rate-limit count error:", countError);

    // If rate limit check fails, do not block real users.
    // We log the error and allow the request.
    return {
      allowed: true,
      remaining: params.limit,
    };
  }

  const used = count || 0;

  if (used >= params.limit) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  const { error: insertError } = await supabaseAdmin.from("rate_limits").insert([
    {
      rate_key: params.key,
    },
  ]);

  if (insertError) {
    console.error("rate-limit insert error:", insertError);
  }

  return {
    allowed: true,
    remaining: Math.max(params.limit - used - 1, 0),
  };
}

export async function cleanupOldRateLimitRows() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("rate_limits")
    .delete()
    .lt("created_at", cutoff);

  if (error) {
    console.error("rate-limit cleanup error:", error);
  }
}

export function normalizeRateLimitValue(value: string) {
  return value.trim().toLowerCase();
}