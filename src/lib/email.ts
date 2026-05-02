import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("Missing RESEND_API_KEY environment variable.");
}

const resend = new Resend(resendApiKey);

const fromEmail = "Appointly <booking@appointly.vip>";

type SendBookingEmailsParams = {
  masterName: string;
  masterEmail: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  cancelUrl: string;
};

export async function sendBookingEmails(params: SendBookingEmailsParams) {
  const {
    masterName,
    masterEmail,
    clientName,
    clientPhone,
    clientEmail,
    serviceName,
    appointmentDate,
    appointmentTime,
    cancelUrl,
  } = params;

  await resend.emails.send({
    from: fromEmail,
    to: clientEmail,
    subject: `Booking request confirmed: ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your booking request was sent</h2>
        <p>Hello ${clientName},</p>
        <p>Your booking request with <strong>${masterName}</strong> has been received.</p>

        <p>
          <strong>Service:</strong> ${serviceName}<br />
          <strong>Date:</strong> ${appointmentDate}<br />
          <strong>Time:</strong> ${appointmentTime}
        </p>

        <p>If you need to cancel this appointment, use the link below:</p>

        <p>
          <a href="${cancelUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;">
            Cancel appointment
          </a>
        </p>

        <p>Thank you.</p>
      </div>
    `,
  });

  await resend.emails.send({
    from: fromEmail,
    to: masterEmail,
    subject: `New booking request: ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New booking request</h2>

        <p>
          <strong>Client:</strong> ${clientName}<br />
          <strong>Phone:</strong> ${clientPhone}<br />
          <strong>Email:</strong> ${clientEmail}
        </p>

        <p>
          <strong>Service:</strong> ${serviceName}<br />
          <strong>Date:</strong> ${appointmentDate}<br />
          <strong>Time:</strong> ${appointmentTime}
        </p>
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
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
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
  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: "Welcome to Appointly",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your Appointly page is ready</h2>

        <p>Hello ${params.masterName},</p>

        <p>Your Appointly booking page has been created.</p>

        <p>
          <strong>Login email:</strong> ${params.loginEmail}
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