"use client";

import { useState } from "react";
import Link from "next/link";
import { MasterAvatar } from "@/components/master-avatar";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/translations";
import {
  getTimeZoneLabel,
  masterTimeZones,
  timeZoneText,
} from "@/lib/timezones";

type SettingsClientProps = {
  master: {
    slug: string;
    name: string;
    bookingEmail?: string | null;
    pageTheme?: string | null;
    customBookingMessage?: string | null;
    bookingPolicyText?: string | null;
    showInDirectory?: boolean | null;
    phone?: string | null;
    address?: string | null;
    country?: string | null;
    city?: string | null;
    timeZone?: string | null;
    neighborhood?: string | null;
    about?: string | null;
    photoUrl?: string | null;

    instagramUrl?: string | null;
    telegramUrl?: string | null;
    facebookUrl?: string | null;
    tiktokUrl?: string | null;
    vkUrl?: string | null;

    slotStepMinutes?: number;
    bookingWindowDays?: number;
  };
  updated: boolean;
  publicBookingUrl: string;
  telegram: {
    currentPlan: string;
    subscriptionStatus: string;
    isConnected: boolean;
    connectedAt?: string | null;
    botUsername: string;
  };
};

const MAX_SOURCE_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB before compression
const MAX_UPLOAD_AVATAR_BYTES = 1024 * 1024; // 1 MB after compression
const AVATAR_SIZE = 512;

const settingsText = {
  en: {
    label: "Master settings",
    title: "Edit profile",
    subtitle: "Update your public booking page information.",
    updated: "Profile updated successfully.",
    avatarTitle: "Profile photo",
    avatarSubtitle:
      "Upload a square avatar for your public page. JPG, PNG, or WebP. The image will be resized to 512×512 and uploaded as WebP.",
    chooseAvatar: "Choose photo",
    uploadAvatar: "Upload photo",
    avatarUploading: "Uploading...",
    avatarSuccess: "Avatar uploaded successfully.",
    avatarNoFile: "Please choose an image first.",
    avatarBadType: "Please choose a JPG, PNG, or WebP image.",
    avatarTooLarge: "Original image must be less than 5 MB.",
    avatarCompressedTooLarge:
      "Compressed avatar is still too large. Please choose a smaller image.",
    avatarProcessingFailed: "Could not process this image. Please try another file.",
    telegramTitle: "Telegram notifications",
    telegramSubtitle: "Premium masters can receive Telegram notifications when clients confirm or cancel appointments.",
    telegramConnected: "Telegram is connected.",
    telegramNotConnected: "Telegram is not connected yet.",
    telegramPremiumOnly: "Telegram notifications are available on Premium only.",
    telegramHowToConnect: "Click Connect Telegram, then press Start in the Telegram bot.",
    connectTelegram: "Connect Telegram",
    disconnectTelegram: "Disconnect Telegram",
    connectedAt: "Connected at",
    upgradeToPremium: "Upgrade to Premium",
    displayName: "Display name",
    bookingEmail: "Email for booking notifications",
    phone: "Phone",
    address: "Address",
    addressPlaceholder: "Optional address or service area",
    country: "Country",
    timeZone: timeZoneText.en.timeZone,
    timeZoneHelp: timeZoneText.en.timeZoneHelp,
    city: "City",
    neighborhood: "Neighborhood",
    about: "About",
    instagram: "Instagram",
    telegram: "Telegram",
    facebook: "Facebook",
    tiktok: "TikTok",
    vk: "VK",
    instagramPlaceholder: "@username or https://www.instagram.com/username",
    telegramPlaceholder: "@username or https://t.me/username",
    facebookPlaceholder: "page-name or https://www.facebook.com/page-name",
    tiktokPlaceholder: "@username or https://www.tiktok.com/@username",
    vkPlaceholder: "@username or https://vk.com/username",
    slotStep: "Slot step",
    bookingWindow: "Booking window",
    days14: "2 weeks",
    days21: "3 weeks",
    days30: "1 month",
    days60: "2 months",
    days90: "3 months",
    minutes15: "15 minutes",
    minutes30: "30 minutes",
    minutes45: "45 minutes",
    minutes60: "60 minutes",
    minutes120: "2 hours",
    minutes180: "3 hours",
    minutes240: "4 hours",
    minutes300: "5 hours",
    minutes360: "6 hours",
    minutes420: "7 hours",
    minutes480: "8 hours",
    saveProfile: "Save profile",
    backToDashboard: "Back to dashboard",
    openPublicPage: "Open public page",
    premiumPageToolsTitle: "Premium page tools",
    premiumPageToolsSubtitle: "Premium masters can add booking/policy text and choose whether their profile appears in the public Masters directory.",
    premiumPageToolsOnly: "Custom policy text and directory visibility controls are available on Premium only.",
    showInDirectory: "Show my profile in the public Masters directory",
    showInDirectoryHelp: "Turn this off if you want to use only your direct booking link without appearing in the public list.",
    customBookingMessage: "Custom booking message",
    customBookingMessagePlaceholder: "Optional welcome text above the booking form.",
    bookingPolicyText: "Booking / cancellation policy",
    bookingPolicyTextPlaceholder: "Optional: cancellation policy, arrival notes, deposit rules, or travel details.",
  },
  es: {
    label: "Configuración del maestro",
    title: "Editar perfil",
    subtitle: "Actualiza la información de tu página pública de reservas.",
    updated: "Perfil actualizado correctamente.",
    avatarTitle: "Foto de perfil",
    avatarSubtitle:
      "Sube un avatar cuadrado para tu página pública. JPG, PNG o WebP. La imagen se redimensionará a 512×512 y se subirá como WebP.",
    chooseAvatar: "Elegir foto",
    uploadAvatar: "Subir foto",
    avatarUploading: "Subiendo...",
    avatarSuccess: "Avatar subido correctamente.",
    avatarNoFile: "Primero elige una imagen.",
    avatarBadType: "Elige una imagen JPG, PNG o WebP.",
    avatarTooLarge: "La imagen original debe pesar menos de 5 MB.",
    avatarCompressedTooLarge:
      "El avatar comprimido sigue siendo demasiado grande. Elige una imagen más pequeña.",
    avatarProcessingFailed: "No se pudo procesar esta imagen. Prueba otro archivo.",
    telegramTitle: "Notificaciones de Telegram",
    telegramSubtitle: "Los usuarios Premium pueden recibir notificaciones de Telegram cuando los clientes confirman o cancelan citas.",
    telegramConnected: "Telegram está conectado.",
    telegramNotConnected: "Telegram todavía no está conectado.",
    telegramPremiumOnly: "Las notificaciones de Telegram están disponibles solo en Premium.",
    telegramHowToConnect: "Haz clic en Conectar Telegram y luego presiona Start en el bot de Telegram.",
    connectTelegram: "Conectar Telegram",
    disconnectTelegram: "Desconectar Telegram",
    connectedAt: "Conectado el",
    upgradeToPremium: "Cambiar a Premium",
    displayName: "Nombre visible",
    bookingEmail: "Email para notificaciones de reservas",
    phone: "Teléfono",
    address: "Dirección",
    addressPlaceholder: "Dirección o zona de servicio opcional",
    country: "País",
    timeZone: timeZoneText.es.timeZone,
    timeZoneHelp: timeZoneText.es.timeZoneHelp,
    city: "Ciudad",
    neighborhood: "Barrio",
    about: "Sobre ti",
    instagram: "Instagram",
    telegram: "Telegram",
    facebook: "Facebook",
    tiktok: "TikTok",
    vk: "VK",
    instagramPlaceholder: "@usuario o https://www.instagram.com/usuario",
    telegramPlaceholder: "@usuario o https://t.me/usuario",
    facebookPlaceholder: "nombre-de-pagina o URL completa de Facebook",
    tiktokPlaceholder: "@usuario o https://www.tiktok.com/@usuario",
    vkPlaceholder: "@usuario o https://vk.com/usuario",
    slotStep: "Intervalo de horarios",
    bookingWindow: "Ventana de reservas",
    days14: "2 semanas",
    days21: "3 semanas",
    days30: "1 mes",
    days60: "2 meses",
    days90: "3 meses",
    minutes15: "15 minutos",
    minutes30: "30 minutos",
    minutes45: "45 minutos",
    minutes60: "60 minutos",
    minutes120: "2 horas",
    minutes180: "3 horas",
    minutes240: "4 horas",
    minutes300: "5 horas",
    minutes360: "6 horas",
    minutes420: "7 horas",
    minutes480: "8 horas",
    saveProfile: "Guardar perfil",
    backToDashboard: "Volver al panel",
    openPublicPage: "Abrir página pública",
    premiumPageToolsTitle: "Herramientas Premium de página",
    premiumPageToolsSubtitle: "Los usuarios Premium pueden añadir texto de reservas/políticas y elegir si su perfil aparece en el directorio público.",
    premiumPageToolsOnly: "El texto personalizado y el control de visibilidad están disponibles solo en Premium.",
    showInDirectory: "Mostrar mi perfil en el directorio público",
    showInDirectoryHelp: "Desactívalo si quieres usar solo tu enlace directo de reservas sin aparecer en la lista pública.",
    customBookingMessage: "Mensaje personalizado de reservas",
    customBookingMessagePlaceholder: "Texto opcional de bienvenida sobre el formulario de reserva.",
    bookingPolicyText: "Política de reserva / cancelación",
    bookingPolicyTextPlaceholder: "Opcional: cancelación, llegada, depósito o detalles de desplazamiento.",
  },
  ru: {
    label: "Настройки мастера",
    title: "Редактировать профиль",
    subtitle: "Обновите информацию на публичной странице записи.",
    updated: "Профиль успешно обновлён.",
    avatarTitle: "Фото профиля",
    avatarSubtitle:
      "Загрузите аватарку для публичной страницы. JPG, PNG или WebP. Фото будет обрезано до квадрата 512×512 и загружено в WebP.",
    chooseAvatar: "Выбрать фото",
    uploadAvatar: "Загрузить фото",
    avatarUploading: "Загрузка...",
    avatarSuccess: "Аватарка успешно загружена.",
    avatarNoFile: "Сначала выберите изображение.",
    avatarBadType: "Выберите изображение JPG, PNG или WebP.",
    avatarTooLarge: "Исходное изображение должно быть меньше 5 MB.",
    avatarCompressedTooLarge:
      "После сжатия файл всё ещё слишком большой. Выберите фото меньшего размера.",
    avatarProcessingFailed: "Не получилось обработать изображение. Попробуйте другой файл.",
    telegramTitle: "Telegram-уведомления",
    telegramSubtitle: "Premium-мастера могут получать Telegram-уведомления, когда клиенты подтверждают или отменяют записи.",
    telegramConnected: "Telegram подключён.",
    telegramNotConnected: "Telegram пока не подключён.",
    telegramPremiumOnly: "Telegram-уведомления доступны только на Premium.",
    telegramHowToConnect: "Нажмите Подключить Telegram, затем нажмите Start в Telegram-боте.",
    connectTelegram: "Подключить Telegram",
    disconnectTelegram: "Отключить Telegram",
    connectedAt: "Подключено",
    upgradeToPremium: "Перейти на Premium",
    displayName: "Имя на странице",
    bookingEmail: "Email для уведомлений о записях",
    phone: "Телефон",
    address: "Адрес",
    addressPlaceholder: "Адрес или район выезда — необязательно",
    country: "Страна",
    timeZone: timeZoneText.ru.timeZone,
    timeZoneHelp: timeZoneText.ru.timeZoneHelp,
    city: "Город",
    neighborhood: "Район",
    about: "О себе",
    instagram: "Instagram",
    telegram: "Telegram",
    facebook: "Facebook",
    tiktok: "TikTok",
    vk: "VK",
    instagramPlaceholder: "@username или https://www.instagram.com/username",
    telegramPlaceholder: "@username или https://t.me/username",
    facebookPlaceholder: "page-name или полная ссылка Facebook",
    tiktokPlaceholder: "@username или https://www.tiktok.com/@username",
    vkPlaceholder: "@username или https://vk.com/username",
    slotStep: "Шаг времени",
    bookingWindow: "Окно записи",
    days14: "2 недели",
    days21: "3 недели",
    days30: "1 месяц",
    days60: "2 месяца",
    days90: "3 месяца",
    minutes15: "15 минут",
    minutes30: "30 минут",
    minutes45: "45 минут",
    minutes60: "60 минут",
    minutes120: "2 часа",
    minutes180: "3 часа",
    minutes240: "4 часа",
    minutes300: "5 часов",
    minutes360: "6 часов",
    minutes420: "7 часов",
    minutes480: "8 часов",
    saveProfile: "Сохранить профиль",
    backToDashboard: "Назад в кабинет",
    openPublicPage: "Открыть публичную страницу",
    premiumPageToolsTitle: "Premium-инструменты страницы",
    premiumPageToolsSubtitle: "Premium-мастера могут добавить текст записи/правил и выбрать, показывать ли профиль в общем каталоге мастеров.",
    premiumPageToolsOnly: "Текст правил и управление видимостью в каталоге доступны только на Premium.",
    showInDirectory: "Показывать мой профиль в общем каталоге мастеров",
    showInDirectoryHelp: "Отключите, если хотите использовать только прямую ссылку на страницу записи и не отображаться в общем списке.",
    customBookingMessage: "Свой текст над формой записи",
    customBookingMessagePlaceholder: "Необязательный приветственный текст над формой записи.",
    bookingPolicyText: "Правила записи / отмены",
    bookingPolicyTextPlaceholder: "Необязательно: правила отмены, приход заранее, депозит или условия выезда.",
  },
} satisfies Record<Locale, Record<string, string>>;

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not load image."));
      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function canvasToWebpBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not compress image."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      0.85
    );
  });
}

async function resizeAvatarToWebp(file: File) {
  const image = await loadImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported.");
  }

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.floor((image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.floor((image.naturalHeight - sourceSize) / 2);

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE
  );

  return canvasToWebpBlob(canvas);
}

export function SettingsClient({
  master,
  updated,
  publicBookingUrl,
  telegram,
}: SettingsClientProps) {
  const { locale } = useLocale();
  const text = settingsText[locale];

  const premiumFeaturesAvailable =
    telegram.currentPlan === "premium" &&
    (telegram.subscriptionStatus === "active" ||
      telegram.subscriptionStatus === "trialing");

  const telegramAvailable = premiumFeaturesAvailable;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [avatarError, setAvatarError] = useState("");

  async function handleAvatarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setAvatarStatus("loading");
    setAvatarError("");

    if (!avatarFile) {
      setAvatarStatus("error");
      setAvatarError(text.avatarNoFile);
      return;
    }

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (!allowedTypes.has(avatarFile.type)) {
      setAvatarStatus("error");
      setAvatarError(text.avatarBadType);
      return;
    }

    if (avatarFile.size > MAX_SOURCE_AVATAR_BYTES) {
      setAvatarStatus("error");
      setAvatarError(text.avatarTooLarge);
      return;
    }

    try {
      const avatarBlob = await resizeAvatarToWebp(avatarFile);

      if (avatarBlob.size > MAX_UPLOAD_AVATAR_BYTES) {
        setAvatarStatus("error");
        setAvatarError(text.avatarCompressedTooLarge);
        return;
      }

      const formData = new FormData();
      formData.append("slug", master.slug);
      formData.append("avatar", avatarBlob, "avatar.webp");

      const response = await fetch("/api/upload-master-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setAvatarStatus("error");
        setAvatarError(data?.error || text.avatarProcessingFailed);
        return;
      }

      setAvatarStatus("success");
      setAvatarFile(null);
      window.location.href = `/dashboard/${master.slug}/settings?updated=1`;
    } catch {
      setAvatarStatus("error");
      setAvatarError(text.avatarProcessingFailed);
    }
  }

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div>
          <p className="text-sm font-medium text-neutral-500">{text.label}</p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900">
            {text.title}
          </h1>

          <p className="mt-4 text-neutral-600">{text.subtitle}</p>
        </div>

        {updated && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {text.updated}
          </div>
        )}

        <form
          onSubmit={handleAvatarSubmit}
          className="mt-8 rounded-3xl border border-neutral-200 p-6"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {text.avatarTitle}
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {text.avatarSubtitle}
          </p>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <MasterAvatar photoUrl={master.photoUrl} name={master.name} />

            <div className="flex-1 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  {text.chooseAvatar}
                </label>

                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-300 bg-white p-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100">
                    {text.chooseAvatar}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) =>
                        setAvatarFile(e.target.files?.[0] || null)
                      }
                      className="sr-only"
                    />
                  </label>

                  <span className="text-sm text-neutral-600">
                    {avatarFile ? avatarFile.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={avatarStatus === "loading"}
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {avatarStatus === "loading"
                  ? text.avatarUploading
                  : text.uploadAvatar}
              </button>
            </div>
          </div>

          {avatarStatus === "success" && (
            <p className="mt-4 text-sm font-medium text-green-700">
              {text.avatarSuccess}
            </p>
          )}

          {avatarStatus === "error" && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {avatarError}
            </div>
          )}
        </form>

        <div className="mt-8 rounded-3xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {text.telegramTitle}
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {text.telegramSubtitle}
          </p>

          {!telegramAvailable ? (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <p>{text.telegramPremiumOnly}</p>

              <Link
                href={`/dashboard/${master.slug}/billing`}
                className="mt-4 inline-flex rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {text.upgradeToPremium}
              </Link>
            </div>
          ) : telegram.isConnected ? (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">{text.telegramConnected}</p>

              {telegram.connectedAt && (
                <p className="mt-2 text-green-700">
                  {text.connectedAt}: {new Date(telegram.connectedAt).toLocaleString()}
                </p>
              )}

              <form
                action="/api/disconnect-telegram"
                method="POST"
                className="mt-4"
              >
                <input type="hidden" name="slug" value={master.slug} />

                <button
                  type="submit"
                  className="rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                  {text.disconnectTelegram}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              <p>{text.telegramNotConnected}</p>
              <p className="mt-2">{text.telegramHowToConnect}</p>

              <form
                action="/api/connect-telegram"
                method="POST"
                className="mt-4"
              >
                <input type="hidden" name="slug" value={master.slug} />

                <button
                  type="submit"
                  className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {text.connectTelegram}
                </button>
              </form>
            </div>
          )}
        </div>

        <form
          action="/api/update-master-profile"
          method="POST"
          className="mt-8 space-y-6 rounded-3xl border border-neutral-200 p-6"
        >
          <input type="hidden" name="slug" value={master.slug} />

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.displayName}
            </label>
            <input
              name="name"
              required
              defaultValue={master.name}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.bookingEmail}
            </label>
            <input
              type="email"
              name="bookingEmail"
              required
              defaultValue={master.bookingEmail || ""}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.phone}
            </label>
            <input
              name="phone"
              defaultValue={master.phone || ""}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.address}
            </label>
            <input
              name="address"
              defaultValue={master.address || ""}
              placeholder={text.addressPlaceholder}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.country}
            </label>
            <input
              name="country"
              defaultValue={master.country || ""}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.timeZone}
            </label>
            <select
              name="timeZone"
              defaultValue={master.timeZone || "America/New_York"}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            >
              {masterTimeZones.map((item) => (
                <option key={item.value} value={item.value}>
                  {getTimeZoneLabel(item.value)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-neutral-500">
              {text.timeZoneHelp}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.city}
              </label>
              <input
                name="city"
                defaultValue={master.city || ""}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.neighborhood}
              </label>
              <input
                name="neighborhood"
                defaultValue={master.neighborhood || ""}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.instagram}
            </label>
            <input
              name="instagramUrl"
              defaultValue={master.instagramUrl || ""}
              placeholder={text.instagramPlaceholder}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.telegram}
            </label>
            <input
              name="telegramUrl"
              defaultValue={master.telegramUrl || ""}
              placeholder={text.telegramPlaceholder}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.facebook}
            </label>
            <input
              name="facebookUrl"
              defaultValue={master.facebookUrl || ""}
              placeholder={text.facebookPlaceholder}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.tiktok}
            </label>
            <input
              name="tiktokUrl"
              defaultValue={master.tiktokUrl || ""}
              placeholder={text.tiktokPlaceholder}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.vk}
            </label>
            <input
              name="vkUrl"
              defaultValue={master.vkUrl || ""}
              placeholder={text.vkPlaceholder}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              {text.about}
            </label>
            <textarea
              name="about"
              rows={5}
              defaultValue={master.about || ""}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
            />
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
              {text.premiumPageToolsTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {text.premiumPageToolsSubtitle}
            </p>

            {!premiumFeaturesAvailable ? (
              <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                <p>{text.premiumPageToolsOnly}</p>

                <Link
                  href={`/dashboard/${master.slug}/billing`}
                  className="mt-4 inline-flex rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {text.upgradeToPremium}
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <label className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
                  <input
                    type="checkbox"
                    name="showInDirectory"
                    value="1"
                    defaultChecked={master.showInDirectory !== false}
                    className="mt-1 h-4 w-4 rounded border-neutral-300"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-neutral-900">
                      {text.showInDirectory}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-neutral-600">
                      {text.showInDirectoryHelp}
                    </span>
                  </span>
                </label>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {text.customBookingMessage}
                  </label>
                  <textarea
                    name="customBookingMessage"
                    rows={4}
                    maxLength={600}
                    defaultValue={master.customBookingMessage || ""}
                    placeholder={text.customBookingMessagePlaceholder}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800">
                    {text.bookingPolicyText}
                  </label>
                  <textarea
                    name="bookingPolicyText"
                    rows={5}
                    maxLength={800}
                    defaultValue={master.bookingPolicyText || ""}
                    placeholder={text.bookingPolicyTextPlaceholder}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.slotStep}
              </label>
              <select
                name="slotStepMinutes"
                defaultValue={String(master.slotStepMinutes || 30)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="15">{text.minutes15}</option>
                <option value="30">{text.minutes30}</option>
                <option value="45">{text.minutes45}</option>
                <option value="60">{text.minutes60}</option>
                <option value="120">{text.minutes120}</option>
                <option value="180">{text.minutes180}</option>
                <option value="240">{text.minutes240}</option>
                <option value="300">{text.minutes300}</option>
                <option value="360">{text.minutes360}</option>
                <option value="420">{text.minutes420}</option>
                <option value="480">{text.minutes480}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-800">
                {text.bookingWindow}
              </label>
              <select
                name="bookingWindowDays"
                defaultValue={String(master.bookingWindowDays || 30)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-500"
              >
                <option value="14">{text.days14}</option>
                <option value="21">{text.days21}</option>
                <option value="30">{text.days30}</option>
                <option value="60">{text.days60}</option>
                <option value="90">{text.days90}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {text.saveProfile}
            </button>

            <Link
              href={`/dashboard/${master.slug}`}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.backToDashboard}
            </Link>

            <a
              href={publicBookingUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              {text.openPublicPage}
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}
