import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("Missing RESEND_API_KEY environment variable.");
}

const resend = new Resend(resendApiKey);

const fromEmail = "Appointly <booking@appointly.vip>";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTimeZoneLine(timeZone?: string | null) {
  if (!timeZone) return "";

  return `<br /><strong>Time zone:</strong> ${escapeHtml(timeZone)}`;
}

function renderClientNoteBlock(clientNote?: string | null) {
  if (!clientNote) return "";

  return `
        <p>
          <strong>Client message:</strong><br />
          ${escapeHtml(clientNote).replaceAll("\n", "<br />")}
        </p>
  `;
}

function renderBookingPolicyBlock(bookingPolicyText?: string | null) {
  if (!bookingPolicyText) return "";

  return `
        <div style="margin-top:16px;padding:14px;border:1px solid #e5e5e5;border-radius:16px;background:#fafafa;">
          <strong>Booking policy:</strong><br />
          ${escapeHtml(bookingPolicyText).replaceAll("\n", "<br />")}
        </div>
  `;
}

type SendBookingConfirmationEmailParams = {
  masterName: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  timeZone?: string | null;
  clientNote?: string | null;
  bookingPolicyText?: string | null;
  confirmUrl: string;
  cancelUrl: string;
};

export async function sendBookingConfirmationEmail(
  params: SendBookingConfirmationEmailParams
) {
  const masterName = escapeHtml(params.masterName);
  const clientName = escapeHtml(params.clientName);
  const clientEmail = params.clientEmail;
  const serviceName = escapeHtml(params.serviceName);
  const appointmentDate = escapeHtml(params.appointmentDate);
  const appointmentTime = escapeHtml(params.appointmentTime);

  await resend.emails.send({
    from: fromEmail,
    to: clientEmail,
    subject: `Please confirm your appointment: ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Please confirm your appointment</h2>

        <p>Hello ${clientName},</p>

        <p>
          We received your booking request with <strong>${masterName}</strong>.
          Please confirm your email address to finalize this appointment.
        </p>

        <p>
          <strong>Service:</strong> ${serviceName}<br />
          <strong>Date:</strong> ${appointmentDate}<br />
          <strong>Time:</strong> ${appointmentTime}${renderTimeZoneLine(params.timeZone)}
        </p>

        ${renderClientNoteBlock(params.clientNote)}
        ${renderBookingPolicyBlock(params.bookingPolicyText)}

        <p>
          Your appointment is not confirmed yet. Please click the button below within 1 hour.
        </p>

        <p>
          <a href="${params.confirmUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;">
            Confirm appointment
          </a>
        </p>

        <p>If you did not request this appointment, you can cancel it here:</p>

        <p>
          <a href="${params.cancelUrl}" style="display:inline-block;background:#fff;color:#111;padding:10px 16px;border-radius:999px;text-decoration:none;border:1px solid #d4d4d4;">
            Cancel appointment
          </a>
        </p>

        <p>
          If you do not see this email in your inbox, please check your spam or junk folder.
        </p>
      </div>
    `,
  });
}

type SendMasterNewConfirmedAppointmentEmailParams = {
  masterName: string;
  masterEmail: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  timeZone?: string | null;
  clientNote?: string | null;
  cancelUrl: string;
};

export async function sendMasterNewConfirmedAppointmentEmail(
  params: SendMasterNewConfirmedAppointmentEmailParams
) {
  const masterEmail = params.masterEmail;
  const clientName = escapeHtml(params.clientName);
  const clientPhone = escapeHtml(params.clientPhone);
  const clientEmail = escapeHtml(params.clientEmail);
  const serviceName = escapeHtml(params.serviceName);
  const appointmentDate = escapeHtml(params.appointmentDate);
  const appointmentTime = escapeHtml(params.appointmentTime);

  await resend.emails.send({
    from: fromEmail,
    to: masterEmail,
    subject: `Confirmed appointment: ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>New confirmed appointment</h2>

        <p>
          A client confirmed an appointment on your Appointly page.
        </p>

        <p>
          <strong>Client:</strong> ${clientName}<br />
          <strong>Phone:</strong> ${clientPhone}<br />
          <strong>Email:</strong> ${clientEmail}
        </p>

        ${renderClientNoteBlock(params.clientNote)}

        <p>
          <strong>Service:</strong> ${serviceName}<br />
          <strong>Date:</strong> ${appointmentDate}<br />
          <strong>Time:</strong> ${appointmentTime}${renderTimeZoneLine(params.timeZone)}
        </p>

        <p>
          <a href="${params.cancelUrl}" style="display:inline-block;background:#fff;color:#111;padding:10px 16px;border-radius:999px;text-decoration:none;border:1px solid #d4d4d4;">
            Cancel appointment
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendAppointmentReminderEmail(params: {
  to: string;
  clientName: string;
  masterName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  timeZone?: string | null;
  bookingPolicyText?: string | null;
  cancelUrl: string;
}) {
  const clientName = escapeHtml(params.clientName);
  const masterName = escapeHtml(params.masterName);
  const serviceName = escapeHtml(params.serviceName);
  const appointmentDate = escapeHtml(params.appointmentDate);
  const appointmentTime = escapeHtml(params.appointmentTime);

  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: `Reminder: your appointment is tomorrow at ${appointmentTime}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Appointment reminder</h2>

        <p>Hello ${clientName},</p>

        <p>This is a reminder that your appointment with <strong>${masterName}</strong> is coming up.</p>

        <p>
          <strong>Service:</strong> ${serviceName}<br />
          <strong>Date:</strong> ${appointmentDate}<br />
          <strong>Time:</strong> ${appointmentTime}${renderTimeZoneLine(params.timeZone)}
        </p>

        ${renderBookingPolicyBlock(params.bookingPolicyText)}

        <p>If you need to cancel this appointment, use the button below:</p>

        <p>
          <a href="${params.cancelUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;">
            Cancel appointment
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendMasterCancelledAppointmentEmail(params: {
  to: string;
  clientName: string;
  masterName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  publicPageUrl: string;
  reason?: string | null;
}) {
  const clientName = escapeHtml(params.clientName);
  const masterName = escapeHtml(params.masterName);
  const serviceName = escapeHtml(params.serviceName);
  const appointmentDate = escapeHtml(params.appointmentDate);
  const appointmentTime = escapeHtml(params.appointmentTime);
  const reason = params.reason ? escapeHtml(params.reason) : "";

  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: `Appointment cancelled: ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Your appointment was cancelled</h2>

        <p>Hello ${clientName},</p>

        <p>
          Your appointment with <strong>${masterName}</strong> was cancelled by the master.
        </p>

        <p>
          <strong>Service:</strong> ${serviceName}<br />
          <strong>Date:</strong> ${appointmentDate}<br />
          <strong>Time:</strong> ${appointmentTime}
        </p>

        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}

        <p>Please choose another available day and time.</p>

        <p>
          <a href="${params.publicPageUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;">
            Book another appointment
          </a>
        </p>

        <p>Thank you.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: "Reset your Appointly password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Reset your Appointly password</h2>

        <p>We received a request to reset your Appointly password.</p>

        <p>This link will expire in 1 hour.</p>

        <p>
          <a href="${params.resetUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;">
            Reset password
          </a>
        </p>

        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  masterName: string;
  loginEmail: string;
  publicPageUrl: string;
  dashboardUrl: string;
  loginUrl: string;
}) {
  const masterName = escapeHtml(params.masterName);
  const loginEmail = escapeHtml(params.loginEmail);

  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: "Welcome to Appointly",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Your Appointly page is ready</h2>

        <p>Hello ${masterName},</p>

        <p>Your Appointly booking page has been created.</p>

        <p>
          <strong>Login email:</strong> ${loginEmail}
        </p>

        <p>
          <a href="${params.publicPageUrl}">Open your public booking page</a>
        </p>

        <p>
          <a href="${params.dashboardUrl}">Open your dashboard</a>
        </p>

        <p>
          <a href="${params.loginUrl}">Log in to Appointly</a>
        </p>

        <p>For security, we never send passwords by email. If you forget your password, use the password reset option on the login page.</p>
      </div>
    `,
  });
}

export async function sendContactRequestEmail(params: {
  to: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
}) {
  const name = escapeHtml(params.name);
  const email = escapeHtml(params.email);
  const phone = escapeHtml(params.phone || "-");
  const message = escapeHtml(params.message || "-");

  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: `New contact request from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>New contact request from Appointly</h2>

        <p>
          <strong>Name:</strong> ${name}<br />
          <strong>Email:</strong> ${email}<br />
          <strong>Phone:</strong> ${phone}
        </p>

        <p>
          <strong>Message:</strong><br />
          ${message.replaceAll("\n", "<br />")}
        </p>
      </div>
    `,
  });
}
