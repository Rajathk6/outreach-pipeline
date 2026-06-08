// stages/stageThree.js
//   Try 1: email-finder with linkedin_handle
//   Try 2: email-finder with full_name (fallback)
//   Verify Email
//   Deduplicates by email before returning

const axios = require('axios');
const config = require('../config');
const { sleep, deduplicateBy } = require('../utils/helper');

const BASE_URL = config.hunter.baseUrl;
const API_KEY  = config.hunter.apiKey;

// find email via linkedin url
async function findByLinkedin(domain, linkedinUrl) {
  try {
    const res = await axios.get(`${BASE_URL}/email-finder`, {
      params: { domain, linkedin_handle: linkedinUrl, api_key: API_KEY }
    });
    return res.data?.data?.email || null;
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      console.log('\n  Check your HUNTER_API_KEY in .env');
      process.exit(1);
    }
    if (status === 429) {
      console.log('\n  Monthly limit reached on Hunter.io. Upgrade your plan to continue.');
      process.exit(1);
    }
    return null;
  }
}

// find email via full name
async function findByName(domain, fullName) {
  try {
    const res = await axios.get(`${BASE_URL}/email-finder`, {
      params: { domain, full_name: fullName, api_key: API_KEY }
    });
    return res.data?.data?.email || null;
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      console.log('\n  Check your HUNTER_API_KEY in .env');
      process.exit(1);
    }
    if (status === 429) {
      console.log('\n  Monthly limit reached on Hunter.io. Upgrade your plan to continue.');
      process.exit(1);
    }
    return null;
  }
}

// Verify the email
async function verifyEmail(email) {
  try {
    const res = await axios.get(`${BASE_URL}/email-verifier`, {
      params: { email, api_key: API_KEY }
    });
    return res.data?.data?.status === 'valid';
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      console.log('\n  Check your HUNTER_API_KEY in .env');
      process.exit(1);
    }
    if (status === 429) {
      console.log('\n  Monthly limit reached on Hunter.io. Upgrade your plan to continue.');
      process.exit(1);
    }
    return false;
  }
}

async function resolveEmails(prospects) {
  const verified = [];

  for (const prospect of prospects) {
    const { name, title, linkedin_url, company_domain } = prospect;
    console.log(`\n  👤 ${name} @ ${company_domain}`);

    let foundEmail = null;

    // Try 1 — LinkedIn handle
    if (linkedin_url) {
      process.stdout.write(`    🔗 Trying LinkedIn handle...`);
      foundEmail = await findByLinkedin(company_domain, linkedin_url);
      console.log(foundEmail ? ` found → ${foundEmail}` : ` no result`);
      await sleep(1500);
    }

    // Try 2 — Full name fallback
    if (!foundEmail && name) {
      process.stdout.write(`    Trying full name fallback`);
      foundEmail = await findByName(company_domain, name);
      console.log(foundEmail ? ` found → ${foundEmail}` : ` no result`);
      await sleep(1500);
    }

    if (!foundEmail) {
      console.log(`    Could not find email — skipping`);
      continue;
    }

    // Verify — only keep valid emails
    process.stdout.write(`    Verifying ${foundEmail}...`);
    const isValid = await verifyEmail(foundEmail);

    if (isValid) {
      console.log(` valid ✅`);
      verified.push({ name, title, email: foundEmail, linkedin_url, company_domain });
    } else {
      console.log(` invalid ❌ — discarded`);
    }

    await sleep(2000);
  }

  const deduped = deduplicateBy(verified, 'email');

  const removed = verified.length - deduped.length;
  if (removed > 0) console.log(`\n  Removed ${removed} duplicate email(s)`);

  console.log(`\n  Stage 3 complete — ${deduped.length}/${prospects.length} valid emails found`);
  return deduped;
}

module.exports = { resolveEmails };