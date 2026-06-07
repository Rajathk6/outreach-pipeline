// stages/stageOne.js
// POST https://api.companyenrich.com/companies/similar
// Auth: Bearer token
// Returns: list of similar company domains

const axios = require('axios');
const config = require('../config');
const { withRetry } = require('../utils/helper');

async function findLookalikeCompanies(seedDomain, limit = 10) {
  console.log(`\n  Finding companies similar to: ${seedDomain}`);

  // Normalize input
  const normalized = seedDomain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .trim()
    .toLowerCase();

  try {
    const response = await withRetry(() =>
      axios.post(
        `${config.companyEnrich.baseUrl}/companies/similar`,
        {
          domain: normalized,
          pageSize: limit
        },
        {
          headers: {
            Authorization: `Bearer ${config.companyEnrich.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
    );

    const data = response.data;

    const items = data?.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      console.log('  No results returned from CompanyEnrich');
      console.log('  Raw response:', JSON.stringify(data).slice(0, 300));
      return [];
    }

    // Extract domain
    const domains = items
      .map(c => c.domain || c.website || c.primaryDomain || c.url || null)
      .filter(Boolean)
      .map(d =>
        d.replace(/^https?:\/\//, '')
         .replace(/^www\./, '')
         .replace(/\/$/, '')
         .toLowerCase()
      )
      .filter(d => d !== normalized);

    console.log(`  Found ${domains.length} lookalike companies:\n`);
    domains.forEach((d, i) => console.log(`     ${i + 1}. ${d}`));

    return domains;

  } catch (err) {
    const status = err.response?.status;
    const msg    = err.response?.data?.message || err.message;

    console.log(`  CompanyEnrich API error [${status}]: ${msg}`);

    if (status === 401 || status === 403) {
      console.log('  🔑 Check your COMPANY_ENRICH_API_KEY in .env');
      process.exit(1);
    }
    if (status === 402 || status === 429) {
      console.log('  💳 Out of credits or rate limited');
      process.exit(1);
    }

    return [];
  }
}

module.exports = { findLookalikeCompanies };