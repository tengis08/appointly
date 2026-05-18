import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: {
      id?: number | string;
    };
  };
};

function isPremiumActive(params: {
  planType?: string | null;
  subscriptionStatus?: string | null;
}) {
  return (
    params.planType === "premium" &&
    (params.subscriptionStatus === "active" ||
      params.subscriptionStatus === "trialing")
  );
}

function getStartToken(text: string) {
  const trimmed = text.trim();

  if (!trimmed.startsWith("/start")) return "";

  const parts = trimmed.split(/\s+/);
  return parts[1]?.trim() || "";
}

function isAuthorizedTelegramRequest(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedSecret) {
    return true;
  }

  const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");

  return incomingSecret === expectedSecret;
}

export async function POST(request: Request) {
  if (!isAuthorizedTelegramRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;

  const chatId = update?.message?.chat?.id;
  const text = update?.message?.text || "";
  const token = getStartToken(text);

  if (!chatId || !token) {
    return NextResponse.json({ ok: true });
  }

  const chatIdText = String(chatId);

  const { data: account, error: accountError } = await supabaseAdmin
    .from("master_accounts")
    .select(
      "master_slug, plan_type, subscription_status, telegram_connect_expires_at"
    )
    .eq("telegram_connect_token", token)
    .maybeSingle();

  if (accountError) {
    console.error("telegram webhook account error:", accountError);
    await sendTelegramMessage({
      chatId: chatIdText,
      text: "Could not connect Telegram. Please try again from Appointly Settings.",
    }).catch((error) => console.error("telegram error reply failed:", error));

    return NextResponse.json({ ok: true });
  }

  if (!account) {
    await sendTelegramMessage({
      chatId: chatIdText,
      text: "This Telegram connection link is invalid or expired. Please generate a new link from Appointly Settings.",
    }).catch((error) => console.error("telegram invalid reply failed:", error));

    return NextResponse.json({ ok: true });
  }

  const expiresAt = account.telegram_connect_expires_at
    ? new Date(account.telegram_connect_expires_at).getTime()
    : 0;

  if (!expiresAt || expiresAt < Date.now()) {
    await sendTelegramMessage({
      chatId: chatIdText,
      text: "This Telegram connection link has expired. Please generate a new link from Appointly Settings.",
    }).catch((error) => console.error("telegram expired reply failed:", error));

    return NextResponse.json({ ok: true });
  }

  if (
    !isPremiumActive({
      planType: account.plan_type,
      subscriptionStatus: account.subscription_status,
    })
  ) {
    await sendTelegramMessage({
      chatId: chatIdText,
      text: "Telegram notifications are available on Appointly Premium only.",
    }).catch((error) => console.error("telegram premium reply failed:", error));

    return NextResponse.json({ ok: true });
  }

  const { error: updateError } = await supabaseAdmin
    .from("master_accounts")
    .update({
      telegram_chat_id: chatIdText,
      telegram_connect_token: null,
      telegram_connect_expires_at: null,
      telegram_connected_at: new Date().toISOString(),
      telegram_notifications_enabled: true,
    })
    .eq("master_slug", account.master_slug)
    .eq("telegram_connect_token", token);

  if (updateError) {
    console.error("telegram webhook update error:", updateError);
    await sendTelegramMessage({
      chatId: chatIdText,
      text: "Could not save Telegram connection. Please try again from Appointly Settings.",
    }).catch((error) => console.error("telegram update reply failed:", error));

    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage({
    chatId: chatIdText,
    text: "Telegram notifications are connected. You will receive Appointly notifications here when clients confirm or cancel appointments.",
  }).catch((error) => console.error("telegram success reply failed:", error));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "telegram-webhook" });
}
