type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

export async function verifyTurnstileToken(params: {
  token: string;
  remoteIp?: string | null;
}) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("Missing TURNSTILE_SECRET_KEY environment variable.");

    if (process.env.NODE_ENV === "production") {
      return false;
    }

    return true;
  }

  if (!params.token) {
    return false;
  }

  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", params.token);

  if (params.remoteIp) {
    formData.append("remoteip", params.remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    console.error("Turnstile verification request failed:", response.status);
    return false;
  }

  const result = (await response.json()) as TurnstileResponse;

  if (!result.success) {
    console.error("Turnstile verification failed:", result["error-codes"]);
    return false;
  }

  return true;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("cf-connecting-ip");
}