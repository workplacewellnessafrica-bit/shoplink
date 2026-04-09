import { sendEmail } from "./email";

/**
 * Send attendant invite email
 */
export async function sendAttendantInviteEmail(
  attendantEmail: string,
  attendantName: string,
  businessName: string,
  inviteLink: string
): Promise<boolean> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1f2937">You're Invited to ShopLink!</h2>
      <p>Hi ${attendantName},</p>
      
      <p>${businessName} has invited you to join their team on ShopLink as a team member.</p>
      
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
        <p><strong>Business:</strong> ${businessName}</p>
        <p style="margin-top:12px">
          <a href="${inviteLink}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold">
            Accept Invitation
          </a>
        </p>
      </div>
      
      <p style="color:#6b7280;margin-top:24px">
        If you didn't expect this invitation or have questions, please contact the business owner directly.
      </p>
      
      <p style="color:#6b7280">
        Best regards,<br/>
        <strong>ShopLink Team</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: attendantEmail,
    subject: `You're invited to join ${businessName} on ShopLink`,
    html,
  });
}

/**
 * Send attendant welcome email after account creation
 */
export async function sendAttendantWelcomeEmail(
  attendantEmail: string,
  attendantName: string,
  businessName: string,
  dashboardUrl: string
): Promise<boolean> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1f2937">Welcome to ShopLink!</h2>
      <p>Hi ${attendantName},</p>
      
      <p>Your account has been successfully created. You're now part of the ${businessName} team on ShopLink.</p>
      
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
        <p><strong>Business:</strong> ${businessName}</p>
        <p style="margin-top:12px">
          <a href="${dashboardUrl}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold">
            Go to Dashboard
          </a>
        </p>
      </div>
      
      <h3 style="color:#1f2937;margin-top:20px">What you can do:</h3>
      <ul style="color:#6b7280">
        <li>View and manage orders</li>
        <li>Update inventory and stock levels</li>
        <li>Track sales and transactions</li>
        <li>Collaborate with your team</li>
      </ul>
      
      <p style="color:#6b7280;margin-top:24px">
        Best regards,<br/>
        <strong>ShopLink Team</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: attendantEmail,
    subject: `Welcome to ShopLink, ${attendantName}!`,
    html,
  });
}
