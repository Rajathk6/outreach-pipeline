// stages/stage1_companies.js
// Stage 1 — Lookalike Company Finder
// Since lookalike APIs are all paywalled on free plans, we maintain a curated
// dataset of companies grouped by industry vertical. Given a seed domain,
// we identify its vertical and return similar company domains.

const INDUSTRY_MAP = {

  // ── Payments & Fintech ─────────────────────────────────────────────────────
  'stripe.com': 'payments',
  'paypal.com': 'payments',
  'square.com': 'payments',
  'razorpay.com': 'payments',
  'braintreepayments.com': 'payments',
  'adyen.com': 'payments',

  // ── E-commerce & Retail Tech ───────────────────────────────────────────────
  'shopify.com': 'ecommerce',
  'bigcommerce.com': 'ecommerce',
  'woocommerce.com': 'ecommerce',
  'magento.com': 'ecommerce',
  'wix.com': 'ecommerce',

  // ── SaaS / B2B Software ────────────────────────────────────────────────────
  'salesforce.com': 'saas',
  'hubspot.com': 'saas',
  'zendesk.com': 'saas',
  'freshworks.com': 'saas',
  'intercom.com': 'saas',
  'notion.so': 'saas',

  // ── Cloud & DevOps ─────────────────────────────────────────────────────────
  'aws.amazon.com': 'cloud',
  'digitalocean.com': 'cloud',
  'heroku.com': 'cloud',
  'render.com': 'cloud',
  'vercel.com': 'cloud',
  'netlify.com': 'cloud',

  // ── HR & Recruitment Tech ──────────────────────────────────────────────────
  'workday.com': 'hrtech',
  'greenhouse.io': 'hrtech',
  'lever.co': 'hrtech',
  'bamboohr.com': 'hrtech',
  'darwinbox.com': 'hrtech',

  // ── Marketing & Analytics ──────────────────────────────────────────────────
  'mailchimp.com': 'marketing',
  'klaviyo.com': 'marketing',
  'segment.com': 'marketing',
  'mixpanel.com': 'marketing',
  'amplitude.com': 'marketing',

  // ── AI & ML Tooling ────────────────────────────────────────────────────────
  'openai.com': 'ai',
  'anthropic.com': 'ai',
  'cohere.com': 'ai',
  'huggingface.co': 'ai',
  'scale.com': 'ai',
  'weights-biases.com': 'ai',
};

// For each vertical, who are the lookalike companies
const LOOKALIKES = {
  payments: [
    'razorpay.com', 'adyen.com', 'braintreepayments.com',
    'paddle.com', 'payoneer.com', 'mollie.com',
    'checkout.com', 'paystack.com', 'cashfree.com',
    'paytm.com', 'phonepe.com', 'billdesk.com'
  ],
  ecommerce: [
    'bigcommerce.com', 'woocommerce.com', 'squarespace.com',
    'weebly.com', 'prestashop.com', 'opencart.com',
    'ecwid.com', 'volusion.com', 'shift4shop.com'
  ],
  saas: [
    'freshworks.com', 'zoho.com', 'pipedrive.com',
    'monday.com', 'asana.com', 'clickup.com',
    'notion.so', 'airtable.com', 'coda.io',
    'intercom.com', 'drift.com', 'crisp.chat'
  ],
  cloud: [
    'digitalocean.com', 'linode.com', 'vultr.com',
    'render.com', 'railway.app', 'fly.io',
    'vercel.com', 'netlify.com', 'cloudflare.com'
  ],
  hrtech: [
    'bamboohr.com', 'greenhouse.io', 'lever.co',
    'rippling.com', 'gusto.com', 'deel.com',
    'remote.com', 'personio.com', 'darwinbox.com'
  ],
  marketing: [
    'klaviyo.com', 'activecampaign.com', 'drip.com',
    'convertkit.com', 'sendinblue.com', 'moosend.com',
    'omnisend.com', 'getresponse.com', 'campaign-monitor.com'
  ],
  ai: [
    'cohere.com', 'huggingface.co', 'replicate.com',
    'together.ai', 'mistral.ai', 'perplexity.ai',
    'elevenlabs.io', 'stability.ai', 'runway.ml'
  ]
};

// ── Main function ──────────────────────────────────────────────────────────────
function findLookalikeCompanies(seedDomain, limit = 10) {
  console.log(`\n  🔍 Finding companies similar to: ${seedDomain}`);

  // Normalize input — strip www, https, etc.
  const normalized = seedDomain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .trim()
    .toLowerCase();

  // Step 1: Find the vertical for this seed domain
  const vertical = INDUSTRY_MAP[normalized];

  if (!vertical) {
    // Domain not in our map — try to guess from the domain itself
    console.log(`  ⚠️  "${normalized}" not in industry map.`);
    console.log(`  💡 Add it manually to INDUSTRY_MAP in stage1_companies.js`);
    console.log(`  ↩️  Falling back to SaaS vertical as default\n`);

    const fallback = LOOKALIKES['saas'].slice(0, limit);
    console.log(`  ✅ Returning ${fallback.length} fallback companies (SaaS)`);
    return fallback;
  }

  // Step 2: Get lookalikes for that vertical, exclude the seed itself
  const lookalikes = LOOKALIKES[vertical]
    .filter(domain => domain !== normalized)
    .slice(0, limit);

  console.log(`  📂 Vertical detected: ${vertical.toUpperCase()}`);
  console.log(`  ✅ Found ${lookalikes.length} lookalike companies:\n`);
  lookalikes.forEach((d, i) => console.log(`     ${i + 1}. ${d}`));

  return lookalikes;
}

module.exports = { findLookalikeCompanies };