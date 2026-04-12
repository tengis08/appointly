type ContactButtonsProps = {
  phone?: string | null;
  whatsapp?: string | null;
};

export function ContactButtons({ phone, whatsapp }: ContactButtonsProps) {
  if (!phone && !whatsapp) return null;

  const smsHref = phone ? `sms:${phone}` : undefined;
  const telHref = phone ? `tel:${phone}` : undefined;
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`
    : undefined;

  return (
    <div className="flex flex-wrap gap-3">
      {telHref && (
        <a
          href={telHref}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
        >
          Call
        </a>
      )}

      {smsHref && (
        <a
          href={smsHref}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
        >
          Text
        </a>
      )}

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
        >
          WhatsApp
        </a>
      )}
    </div>
  );
}