// stages/stageTwo.js
//   search-person by seniority → returns person name, title, linkedin_url
//   deduplicates by linkedin_url before returning

const axios = require('axios');
const config = require('../config');
const { sleep, withRetry, deduplicateBy } = require('../utils/helper');

const BASE_URL = config.prospeo.baseUrl;
const HEADERS = {
  'X-KEY': config.prospeo.apiKey,
  'Content-Type': 'application/json'
};

const TARGET_SENIORITIES = ['Founder/Owner', 'C-Suite', 'Vice President'];
const MAX_PER_COMPANY    = 2;

async function searchPeopleAtDomain(domain) {
  try {
    const response = await withRetry(() =>
      axios.post(`${BASE_URL}/search-person`, {
        page: 1,
        filters: {
          company: {
            websites: { include: [domain] }
          },
          person_seniority: {
            include: TARGET_SENIORITIES
          }
        },
      }, { headers: HEADERS })
    );

    if (response.data.error) {
      console.log(`  ${domain}: ${response.data.error_code}`);
      return [];
    }

    const results = response.data.results || [];
    return results.slice(0, MAX_PER_COMPANY);

  } catch (err) {
    const status = err.response?.status;
    const msg    = err.response?.data?.message || err.message;

    console.log(`  Failed for ${domain} [${status}]: ${msg}`);

    if (status === 401 || status === 403) {
      console.log('  Check your PROSPEO_API_KEY in .env');
      process.exit(1);
    }
    if (status === 429) {
      console.log('  Monthly limit reached on Prospeo. Upgrade your plan to continue.');
      process.exit(1);
    }

    return [];
  }
}

async function findDecisionMakers(domains) {
  const allProspects = [];

  for (const domain of domains) {
    console.log(`\n   Processing: ${domain}`);

    const people = await searchPeopleAtDomain(domain);

    if (!people.length) {
      console.log(`   No results — skipping`);
      await sleep(2000);
      continue;
    }

    for (const result of people) {
      const person      = result.person || result;
      const linkedinUrl = person.linkedin_url || person.linkedin || null;
      const name        = person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
      const title       = person.current_job_title || person.job_title || null;

      if (!linkedinUrl) {
        console.log(`   ${name} — no LinkedIn URL, skipping`);
        continue;
      }

      allProspects.push({ name, title, linkedin_url: linkedinUrl, company_domain: domain });
      console.log(`    ${name} (${title}) → ${linkedinUrl}`);
    }

    await sleep(3000);
  }

  const deduped = deduplicateBy(allProspects, 'linkedin_url');

  const removed = allProspects.length - deduped.length;
  if (removed > 0) console.log(`\n  Removed ${removed} duplicate LinkedIn URL(s)`);

  console.log(`\n  Stage 2 complete — ${deduped.length} unique prospects with LinkedIn URLs`);
  return deduped;
}

module.exports = { findDecisionMakers };