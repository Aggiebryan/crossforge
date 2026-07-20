/**
 * Section 8 integrations — provider-agnostic adapter interfaces. Concrete
 * providers (SendGrid, Twilio, …) implement these so they can be swapped
 * without touching call sites. Selection is env-driven; when unconfigured the
 * no-op adapters keep the app running and log intent.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

export interface EmailAdapter {
  send(msg: EmailMessage): Promise<{ id: string; provider: string }>;
}

export interface SmsMessage {
  to: string; // E.164
  body: string;
  /** 10DLC campaign/messaging-service reference. */
  messagingServiceSid?: string;
}

export interface SmsAdapter {
  send(msg: SmsMessage): Promise<{ id: string; provider: string }>;
}

/** Events emitted to the webhook layer (n8n compatible). */
export type WebhookEventType =
  | "stage_change"
  | "contract_signed"
  | "deadline_approaching"
  | "buyer_graded"
  | "deal_funded";

export interface WebhookEnvelope<T = unknown> {
  event: WebhookEventType;
  org_id: string;
  occurred_at: string;
  data: T;
}

// --- No-op fallbacks so the app runs without credentials ---
export const noopEmail: EmailAdapter = {
  async send(msg) {
    console.info("[email:noop]", msg.to, msg.subject);
    return { id: "noop", provider: "noop" };
  },
};

export const noopSms: SmsAdapter = {
  async send(msg) {
    console.info("[sms:noop]", msg.to);
    return { id: "noop", provider: "noop" };
  },
};

export function getEmailAdapter(): EmailAdapter {
  // Concrete providers plug in here based on process.env.EMAIL_PROVIDER.
  return noopEmail;
}

export function getSmsAdapter(): SmsAdapter {
  return noopSms;
}
