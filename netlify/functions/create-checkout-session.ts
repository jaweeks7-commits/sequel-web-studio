import Stripe from 'stripe';

type LambdaEvent = {
  httpMethod: string;
  body: string | null;
  isBase64Encoded?: boolean;
};

type LambdaResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    console.error('[create-checkout-session] STRIPE_SECRET_KEY or STRIPE_PRICE_ID not set.');
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Payment is not configured yet. Please contact us directly.' }) };
  }

  let name: string, business: string, url: string, email: string, notes: string;
  try {
    const body = JSON.parse(event.body ?? '{}');
    name     = (body.name     ?? '').trim();
    business = (body.business ?? '').trim();
    url      = (body.url      ?? '').trim();
    email    = (body.email    ?? '').trim();
    notes    = (body.notes    ?? '').trim();
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid request.' }) };
  }

  if (!name || !business || !url || !email) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Please fill in all required fields.' }) };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'https://sequelwebstudio.com';

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: email,
      metadata: {
        clientName:   name,
        businessName: business,
        siteUrl:      url,
        email,
        notes:        notes.slice(0, 500),
      },
      success_url: `${siteUrl}/audit?order=success`,
      cancel_url:  `${siteUrl}/audit?order=cancelled`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error';
    const priceIdSuffix = (process.env.STRIPE_PRICE_ID ?? '').slice(-8);
    console.error('[create-checkout-session] Stripe error:', message);
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: `Stripe error: ${message}`, debug_price_suffix: priceIdSuffix }) };
  }

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ checkoutUrl: session.url }),
  };
};
