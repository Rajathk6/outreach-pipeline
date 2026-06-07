// stages/stageThree.js
//   Try 1: email-finder with linkedin_handle
//   Try 2: email-finder with full_name (fallback)
//   Verify Email

const axios = require('axios');
const config = require('../config');
const { sleep } = require('../utils/helper');

const BASE_URL = config.hunter.baseUrl;
const API_KEY  = config.hunter.apiKey;

// find email via linkedin url
async function findByLinkedin(domain, linkedinUrl) {
  try {
    const res = await axios.get(`${BASE_URL}/email-finder`, {
      params: {
        domain,
        linkedin_handle: linkedinUrl,
        api_key: API_KEY
      }
    });

    const email = res.data?.data?.email;
    return email || null;

  } catch (err) {
    return null;
  }
}

// find email via full name 
async function findByName(domain, fullName) {
  try {
    const parts      = fullName.trim().split(' ');
    const first_name = parts[0];
    const last_name  = parts.slice(1).join(' ') || parts[0];

    const res = await axios.get(`${BASE_URL}/email-finder`, {
      params: {
        domain,
        full_name: fullName,
        api_key: API_KEY
      }
    });

    const email = res.data?.data?.email;
    return email || null;

  } catch (err) {
    return null;
  }
}

// Verify the email 
async function verifyEmail(email) {
  try {
    const res = await axios.get(`${BASE_URL}/email-verifier`, {
      params: {
        email,
        api_key: API_KEY
      }
    });

    const status = res.data?.data?.status;
    return status === 'valid';

  } catch (err) {
    return false;
  }
}

// ── Main Stage 3 function ──────────────────────────────────────────────────
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

      if (foundEmail) {
        console.log(` found → ${foundEmail}`);
      } else {
        console.log(` no result`);
      }

      await sleep(1500);
    }

    // Try 2 — Full name fallback
    if (!foundEmail && name) {
      process.stdout.write(`    Trying full name fallback`);
      foundEmail = await findByName(company_domain, name);

      if (foundEmail) {
        console.log(` found → ${foundEmail}`);
      } else {
        console.log(` no result`);
      }

      await sleep(1500);
    }

    // No email found at all — skip
    if (!foundEmail) {
      console.log(`    Could not find email — skipping`);
      continue;
    }

    // Verify — only keep valid emails
    process.stdout.write(`    Verifying ${foundEmail}...`);
    const isValid = await verifyEmail(foundEmail);

    if (isValid) {
      console.log(` valid ✅`);
      verified.push({
        name,
        title,
        email: foundEmail,
        linkedin_url,
        company_domain
      });
    } else {
      console.log(` invalid ❌ — discarded`);
    }

    await sleep(2000);
  }

  console.log(`\n  Stage 3 complete — ${verified.length}/${prospects.length} valid emails found`);
  return verified;
}

module.exports = { resolveEmails };