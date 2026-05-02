export function canAcceptBookings(params: {
  planType?: string | null;
  subscriptionStatus?: string | null;
}) {
  const planType = params.planType || "free";
  const subscriptionStatus = params.subscriptionStatus || "inactive";

  const hasAllowedPlan = planType === "basic" || planType === "premium";

  const hasAllowedStatus =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";

  return hasAllowedPlan && hasAllowedStatus;
}

export function formatPlanName(planType?: string | null) {
  if (planType === "premium") return "Premium";
  if (planType === "basic") return "Basic";
  return "Free";
}

export function formatSubscriptionStatus(status?: string | null) {
  if (status === "active") return "Active";
  if (status === "trialing") return "Trial";
  if (status === "past_due") return "Past due";
  if (status === "cancelled") return "Cancelled";
  if (status === "canceled") return "Canceled";
  return "Inactive";
}