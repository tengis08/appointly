import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmails(data: {
  masterName: string;
  masterEmail: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  cancelUrl: string;
}) {
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
  } = data;

  await resend.emails.send({
    from: "Appointly <bookings@appointly.vip>",
    to: masterEmail,
    subject: `New booking request for ${masterName}`,
    html: `
      <h2>New booking request</h2>
      <p><b>Client:</b> ${clientName}</p>
      <p><b>Phone:</b> ${clientPhone}</p>
      <p><b>Email:</b> ${clientEmail}</p>
      <p><b>Service:</b> ${serviceName}</p>
      <p><b>Date:</b> ${appointmentDate}</p>
      <p><b>Time:</b> ${appointmentTime}</p>
    `,
  });

  await resend.emails.send({
    from: "Appointly <bookings@appointly.vip>",
    to: clientEmail,
    subject: "Your booking request has been received",
    html: `
      <h2>Thank you for your booking request</h2>
      <p>Your request has been sent to ${masterName}.</p>
      <p><b>Service:</b> ${serviceName}</p>
      <p><b>Date:</b> ${appointmentDate}</p>
      <p><b>Time:</b> ${appointmentTime}</p>
      <p>If you need to cancel this request, use this link:</p>
      <p><a href="${cancelUrl}">Cancel appointment</a></p>
    `,
  });
}