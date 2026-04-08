import nodemailer from "nodemailer";

// For development, we'll use a test email service
// In production, configure with your email provider (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.EMAIL_PORT || "2525"),
  auth: {
    user: process.env.EMAIL_USER || "demo@example.com",
    pass: process.env.EMAIL_PASS || "demo@example.com",
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@shoplink.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html,
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: number,
  items: Array<{ name: string; quantity: number; price: string }>,
  total: string,
  businessName: string
): Promise<boolean> {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr><td style="padding:8px">${item.name}</td><td style="padding:8px;text-align:center">${item.quantity}</td><td style="padding:8px;text-align:right">KES ${item.price}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1f2937">Order Confirmation</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your order! Here are your order details:</p>
      
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Status:</strong> Pending Confirmation</p>
      </div>
      
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#e5e7eb">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="border-top:2px solid #e5e7eb;padding-top:16px;text-align:right">
        <p style="font-size:18px"><strong>Total: KES ${total}</strong></p>
      </div>
      
      <p style="color:#6b7280;margin-top:24px">
        The business owner will confirm your order shortly. You can track your order status in your account.
      </p>
      
      <p style="color:#6b7280">
        Best regards,<br/>
        <strong>ShopLink Team</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - #${orderId}`,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderId: number,
  status: string,
  businessName: string
): Promise<boolean> {
  const statusMessages: Record<string, string> = {
    pending: "Your order has been received and is awaiting confirmation.",
    confirmed: "Your order has been confirmed by the business!",
    processing: "Your order is being prepared for shipment.",
    shipped: "Your order has been shipped! Track it using the tracking number.",
    delivered: "Your order has been delivered. Thank you for shopping with us!",
    cancelled: "Your order has been cancelled. Please contact the business for more details.",
  };

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1f2937">Order Status Update</h2>
      <p>Hi ${customerName},</p>
      
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>New Status:</strong> <span style="color:#2563eb;font-weight:bold">${status.toUpperCase()}</span></p>
      </div>
      
      <p>${statusMessages[status] || "Your order status has been updated."}</p>
      
      <p style="color:#6b7280;margin-top:24px">
        Best regards,<br/>
        <strong>ShopLink Team</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order #${orderId} - ${status.toUpperCase()}`,
    html,
  });
}
