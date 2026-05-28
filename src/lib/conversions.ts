const GA4_ID = import.meta.env.PUBLIC_GA4_ID;
const ADS_ID = import.meta.env.PUBLIC_GOOGLE_ADS_ID;

const LABELS = {
  purchase:   import.meta.env.PUBLIC_ADS_LABEL_PURCHASE,
  contact:    import.meta.env.PUBLIC_ADS_LABEL_CONTACT,
  audit_form: import.meta.env.PUBLIC_ADS_LABEL_AUDIT_FORM,
} as const;

export type ConversionType = keyof typeof LABELS;

interface ConversionOptions {
  value?: number;
  transactionId?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA4_EVENT: Record<ConversionType, string> = {
  purchase:   'purchase',
  contact:    'generate_lead',
  audit_form: 'generate_lead',
};

export function reportConversion(type: ConversionType, opts: ConversionOptions = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const payload: Record<string, unknown> = {};
  if (opts.value !== undefined) {
    payload.value    = opts.value;
    payload.currency = 'USD';
  }
  if (opts.transactionId) payload.transaction_id = opts.transactionId;

  if (GA4_ID) {
    window.gtag('event', GA4_EVENT[type], { send_to: GA4_ID, ...payload });
  }

  const label = LABELS[type];
  if (ADS_ID && label) {
    window.gtag('event', 'conversion', { send_to: `${ADS_ID}/${label}`, ...payload });
  }
}
