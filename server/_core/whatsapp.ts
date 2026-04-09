import { ENV } from "./env";
import { TRPCError } from "@trpc/server";

/**
 * Send OTP via WhatsApp using Manus Forge API
 * Sends a simple text message with the OTP code to the customer's phone number
 */
export async function sendWhatsAppOTP(
  phoneNumber: string,
  otpCode: string
): Promise<boolean> {
  // Validate phone number format
  if (!phoneNumber || phoneNumber.length < 7) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid phone number",
    });
  }

  // Normalize phone number (remove non-digits, ensure it starts with +)
  const normalizedPhone = phoneNumber.replace(/\D/g, "");
  const formattedPhone = normalizedPhone.startsWith("+")
    ? normalizedPhone
    : `+${normalizedPhone}`;

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[WhatsApp] Forge API not configured, skipping OTP send");
    return false;
  }

  try {
    // Use Manus Forge API to send WhatsApp message
    const response = await fetch(`${ENV.forgeApiUrl}/v1/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: formattedPhone,
        type: "text",
        text: {
          body: `Your ShopLink verification code is: ${otpCode}\n\nThis code expires in 10 minutes.`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      console.warn(
        `[WhatsApp] Failed to send OTP (${response.status}): ${error}`
      );
      return false;
    }

    console.log(`[WhatsApp] OTP sent successfully to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending OTP:", error);
    return false;
  }
}

/**
 * Send WhatsApp order confirmation message
 */
export async function sendWhatsAppOrderConfirmation(
  businessPhoneNumber: string,
  orderDetails: string
): Promise<boolean> {
  if (!businessPhoneNumber || businessPhoneNumber.length < 7) {
    return false;
  }

  const normalizedPhone = businessPhoneNumber.replace(/\D/g, "");
  const formattedPhone = normalizedPhone.startsWith("+")
    ? normalizedPhone
    : `+${normalizedPhone}`;

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[WhatsApp] Forge API not configured, skipping order confirmation");
    return false;
  }

  try {
    const response = await fetch(`${ENV.forgeApiUrl}/v1/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: formattedPhone,
        type: "text",
        text: {
          body: orderDetails,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[WhatsApp] Failed to send order confirmation (${response.status})`);
      return false;
    }

    console.log(`[WhatsApp] Order confirmation sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending order confirmation:", error);
    return false;
  }
}
