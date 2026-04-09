import { sendEmail } from "../email";
import { sendWhatsAppOTP } from "./whatsapp";

export interface OrderNotificationData {
  orderId: number;
  customerName: string;
  customerPhone: string;
  businessName: string;
  businessEmail?: string;
  businessWhatsApp?: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  total: string;
  orderUrl: string;
}

/**
 * Send email notification to business when order is placed
 */
export async function sendBusinessOrderEmailNotification(
  data: OrderNotificationData
): Promise<boolean> {
  if (!data.businessEmail) {
    console.log("[BusinessNotifications] No email configured for business");
    return false;
  }

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr><td style="padding:8px">${item.name}</td><td style="padding:8px;text-align:center">${item.quantity}</td><td style="padding:8px;text-align:right">KES ${item.price}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1f2937">🎉 New Order Received!</h2>
      <p>Hi ${data.businessName},</p>
      <p>You have a new order from a customer. Here are the details:</p>
      
      <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
        <p><strong>Order ID:</strong> #${data.orderId}</p>
        <p><strong>Customer Name:</strong> ${data.customerName}</p>
        <p><strong>Customer Phone:</strong> ${data.customerPhone}</p>
        <p><strong>Order Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <h3 style="color:#1f2937;margin-top:20px">Order Items</h3>
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
      
      <div style="border-top:2px solid #e5e7eb;padding-top:16px;text-align:right;margin-top:16px">
        <p style="font-size:18px"><strong>Total: KES ${data.total}</strong></p>
      </div>
      
      <div style="margin-top:24px;padding:16px;background:#dbeafe;border-radius:8px">
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Review the order details</li>
          <li>Confirm or reject the order</li>
          <li>Update the customer on order status</li>
        </ol>
        <p style="margin-top:12px">
          <a href="${data.orderUrl}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            View Order in Dashboard
          </a>
        </p>
      </div>
      
      <p style="color:#6b7280;margin-top:24px">
        Best regards,<br/>
        <strong>ShopLink Team</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: data.businessEmail,
    subject: `New Order #${data.orderId} from ${data.customerName}`,
    html,
  });
}

/**
 * Send WhatsApp notification to business when order is placed
 */
export async function sendBusinessOrderWhatsAppNotification(
  data: OrderNotificationData
): Promise<boolean> {
  if (!data.businessWhatsApp) {
    console.log("[BusinessNotifications] No WhatsApp number configured for business");
    return false;
  }

  const itemsList = data.items.map((item) => `${item.name} (x${item.quantity})`).join("\n");

  const message = `🎉 *New Order Received!*

*Order #${data.orderId}*
Customer: ${data.customerName}
Phone: ${data.customerPhone}

*Items:*
${itemsList}

*Total: KES ${data.total}*

Please confirm or reject this order in your ShopLink dashboard.`;

  try {
    // Send via WhatsApp API
    const result = await sendWhatsAppOTP(data.businessWhatsApp, message);
    return result;
  } catch (error) {
    console.error("[BusinessNotifications] Failed to send WhatsApp notification:", error);
    return false;
  }
}

/**
 * Send both email and WhatsApp notifications to business
 */
export async function notifyBusinessOfNewOrder(
  data: OrderNotificationData
): Promise<{ email: boolean; whatsapp: boolean }> {
  console.log(`[BusinessNotifications] Notifying ${data.businessName} of order #${data.orderId}`);

  const [emailSent, whatsappSent] = await Promise.all([
    sendBusinessOrderEmailNotification(data),
    sendBusinessOrderWhatsAppNotification(data),
  ]);

  return { email: emailSent, whatsapp: whatsappSent };
}
