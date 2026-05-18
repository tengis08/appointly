import { supabaseAdmin } from "@/lib/supabase-admin";

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

type TelegramInlineKeyboardButton = {
  text: string;
  url: string;
};

type TelegramReplyMarkup = {
  inline_keyboard: TelegramInlineKeyboardButton[][];
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

function buildDashboardUrl(masterSlug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${siteUrl}/dashboard/${masterSlug}`;
}

async function telegramApi(method: string, body: Record<string, unknown>) {
  if (!telegramBotToken) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable.");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(data?.description || "Telegram API request failed.");
  }

  return data;
}

export async function sendTelegramMessage(params: {
  chatId: string;
  text: string;
  replyMarkup?: TelegramReplyMarkup;
}) {
  return telegramApi("sendMessage", {
    chat_id: params.chatId,
    text: params.text,
    disable_web_page_preview: true,
    ...(params.replyMarkup ? { reply_markup: params.replyMarkup } : {}),
  });
}

async function getTelegramAccount(masterSlug: string) {
  const { data: account, error } = await supabaseAdmin
    .from("master_accounts")
    .select(
      "master_slug, plan_type, subscription_status, telegram_chat_id, telegram_notifications_enabled"
    )
    .eq("master_slug", masterSlug)
    .maybeSingle();

  if (error) {
    console.error("telegram account lookup error:", error);
    return null;
  }

  if (!account) return null;

  if (
    !isPremiumActive({
      planType: account.plan_type,
      subscriptionStatus: account.subscription_status,
    })
  ) {
    return null;
  }

  if (!account.telegram_notifications_enabled || !account.telegram_chat_id) {
    return null;
  }

  return account;
}

export async function sendMasterTelegramNewConfirmedAppointment(params: {
  masterSlug: string;
  masterName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  clientNote?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  timeZone?: string | null;
}) {
  const account = await getTelegramAccount(params.masterSlug);

  if (!account?.telegram_chat_id) return;

  const dashboardUrl = buildDashboardUrl(params.masterSlug);

  const text = [
    "New confirmed booking",
    "",
    `Master: ${params.masterName}`,
    `Client: ${params.clientName}`,
    `Phone: ${params.clientPhone || "-"}`,
    `Email: ${params.clientEmail}`,
    params.clientNote ? `Message: ${params.clientNote}` : "",
    "",
    `Service: ${params.serviceName}`,
    `Date: ${params.appointmentDate}`,
    `Time: ${params.appointmentTime}`,
    params.timeZone ? `Time zone: ${params.timeZone}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegramMessage({
    chatId: account.telegram_chat_id,
    text,
    replyMarkup: {
      inline_keyboard: [[{ text: "Open dashboard", url: dashboardUrl }]],
    },
  });
}

export async function sendMasterTelegramCancelledAppointment(params: {
  masterSlug: string;
  masterName: string;
  clientName: string;
  clientPhone?: string | null;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  timeZone?: string | null;
}) {
  const account = await getTelegramAccount(params.masterSlug);

  if (!account?.telegram_chat_id) return;

  const dashboardUrl = buildDashboardUrl(params.masterSlug);

  const text = [
    "Booking cancelled",
    "",
    `Master: ${params.masterName}`,
    `Client: ${params.clientName}`,
    params.clientPhone ? `Phone: ${params.clientPhone}` : "",
    `Email: ${params.clientEmail}`,
    "",
    `Service: ${params.serviceName}`,
    `Date: ${params.appointmentDate}`,
    `Time: ${params.appointmentTime}`,
    params.timeZone ? `Time zone: ${params.timeZone}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegramMessage({
    chatId: account.telegram_chat_id,
    text,
    replyMarkup: {
      inline_keyboard: [[{ text: "Open dashboard", url: dashboardUrl }]],
    },
  });
}
