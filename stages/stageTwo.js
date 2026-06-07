// stages/stage2_prospeo.js
// Stage 2 — Find top management LinkedIn URLs via Prospeo
// One call per company:
//   search-person → returns person name, title, linkedin_url
// No email enrichment here — that's Stage 3 (Eazyreach)

const axios = require('axios');
const config = require('../config');
const { sleep, withRetry } = require('../utils/helper');

const BASE_URL = config.prospeo.baseUrl;
const HEADERS = {
  'X-KEY': config.prospeo.apiKey,
  'Content-Type': 'application/json'
};

const TARGET_SENIORITIES = ['Founder/Owner', 'C-Suite', 'Vice President'];

// Max people to pull per company — free plan safety
const MAX_PER_COMPANY = 2;

// ── Search for top management at a given domain ────────────────────────────
async function searchPeopleAtDomain(domain) {
  try {
    const response = await withRetry(() =>
      axios.post(`${BASE_URL}/search-person`, {
        filters: {
          company: {
            websites: {
              include: [domain]
            }
          },
          person_seniority: {
            include: TARGET_SENIORITIES
          }
        }
      }, { headers: HEADERS })
    );

    if (response.data.error) {
      console.log(`  ⚠️  ${domain}: ${response.data.error_code}`);
      return [];
    }

    const results = response.data.results || [];
    return results.slice(0, MAX_PER_COMPANY);

  } catch (err) {
    console.log(`  ❌ Failed for ${domain}: ${err.message}`);
    return [];
  }
}

// ── Main Stage 2 function ──────────────────────────────────────────────────
async function findDecisionMakers(domains) {
  const allProspects = [];

  for (const domain of domains) {
    console.log(`\n  📡 Processing: ${domain}`);

    const people = await searchPeopleAtDomain(domain);

    if (!people.length) {
      console.log(`  ⏭️  No results — skipping`);
      await sleep(2000);
      continue;
    }

    for (const result of people) {
      const person = result.person || result;

      const linkedinUrl = person.linkedin_url || person.linkedin || null;
      const name        = person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
      const title       = person.current_job_title || person.job_title || null;

      if (!linkedinUrl) {
        console.log(`    ⏭️  ${name} — no LinkedIn URL, skipping`);
        continue;
      }

      allProspects.push({
        name,
        title,
        linkedin_url: linkedinUrl,
        company_domain: domain
      });

      console.log(`    ✅ ${name} (${title}) → ${linkedinUrl}`);
    }

    // Pause between companies to respect rate limits
    await sleep(3000);
  }

  console.log(`\n  ✅ Stage 2 complete — ${allProspects.length} prospects with LinkedIn URLs`);
  return allProspects;
}

module.exports = { findDecisionMakers };