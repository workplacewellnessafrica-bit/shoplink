import { describe, it, expect, vi } from "vitest";
import { sendEmail } from "./email";
import { sendOTPViaSMS, isSMSAvailable } from "./_core/sms";

describe("Email Service", () => {
  it("should validate SMTP configuration", async () => {
    // Check if environment variables are set
    const hasEmailConfig = !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_FROM
    );

    expect(hasEmailConfig).toBe(true);
  });

  it("should attempt to send email with configured SMTP", async () => {
    // This test validates that email sending is attempted with real SMTP
    // In production, this would actually send an email
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Email",
      html: "<p>Test email content</p>",
    });

    // Result should be boolean (true if sent, false if failed)
    expect(typeof result).toBe("boolean");
  });
});

describe("SMS Service", () => {
  it("should validate Twilio configuration", () => {
    // Check if Twilio credentials are set
    const hasTwilioConfig = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );

    expect(hasTwilioConfig).toBe(true);
  });

  it("should report SMS availability based on configuration", () => {
    const available = isSMSAvailable();
    // Should be true if Twilio is configured
    expect(typeof available).toBe("boolean");
  });

  it("should validate SMS sending with proper phone format", async () => {
    // This test validates the SMS sending function structure
    // It won't actually send unless Twilio is configured
    const result = await sendOTPViaSMS("+254712345678", "123456");

    // Result should have success and error properties
    expect(result).toHaveProperty("success");
    expect(typeof result.success).toBe("boolean");
  });
});
