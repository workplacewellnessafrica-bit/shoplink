import twilio from "twilio";

/**
 * Twilio SMS service for sending OTP and notifications
 * Requires environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!client && accountSid && authToken) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

export interface SendSMSOptions {
  to: string; // Phone number in E.164 format (e.g., +254712345678)
  body: string;
  retries?: number;
}

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS via Twilio with retry logic
 */
export async function sendSMS(
  options: SendSMSOptions
): Promise<SendSMSResult> {
  const { to, body, retries = 1 } = options;

  // Validate configuration
  if (!accountSid || !authToken || !fromPhoneNumber) {
    console.warn(
      "[SMS] Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
    );
    return {
      success: false,
      error: "SMS service not configured",
    };
  }

  // Validate phone number format
  if (!to.startsWith("+")) {
    console.error(`[SMS] Invalid phone number format: ${to}. Must be E.164 format (+254...)`);
    return {
      success: false,
      error: "Invalid phone number format",
    };
  }

  const client = getTwilioClient();
  if (!client) {
    return {
      success: false,
      error: "Failed to initialize Twilio client",
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[SMS] Sending SMS to ${to} (attempt ${attempt}/${retries})`);

      const message = await client.messages.create({
        body,
        from: fromPhoneNumber,
        to,
      });

      console.log(`[SMS] SMS sent successfully. SID: ${message.sid}`);
      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[SMS] Failed to send SMS (attempt ${attempt}/${retries}):`, lastError.message);

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Failed to send SMS after retries",
  };
}

/**
 * Send OTP via SMS
 */
export async function sendOTPViaSMS(
  phoneNumber: string,
  otpCode: string
): Promise<SendSMSResult> {
  const body = `Your ShopLink verification code is: ${otpCode}. This code expires in 10 minutes.`;
  return sendSMS({
    to: phoneNumber,
    body,
    retries: 2,
  });
}

/**
 * Send order notification via SMS
 */
export async function sendOrderNotificationViaSMS(
  phoneNumber: string,
  orderDetails: {
    orderId: number;
    businessName: string;
    totalAmount: string;
  }
): Promise<SendSMSResult> {
  const body = `Order #${orderDetails.orderId} confirmed from ${orderDetails.businessName}. Total: ${orderDetails.totalAmount}. Track your order in the ShopLink app.`;
  return sendSMS({
    to: phoneNumber,
    body,
    retries: 1,
  });
}

/**
 * Check if SMS service is available
 */
export function isSMSAvailable(): boolean {
  return !!(accountSid && authToken && fromPhoneNumber);
}
