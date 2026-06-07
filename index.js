// index.js — Main pipeline runner
const { findLookalikeCompanies } = require('./stages/stageOne');
const { findDecisionMakers }     = require('./stages/stageTwo');
const { resolveEmails }          = require('./stages/stageThree');
const { sendOutreach }           = require('./stages/stageFour');
const { saveData, loadData, printStage } = require('./utils/helper');

async function runPipeline(seedDomain) {
  console.log('\n' + '═'.repeat(50));
  console.log('  🚀 OUTREACH PIPELINE');
  console.log(`  Seed: ${seedDomain}`);
  console.log('═'.repeat(50));

  // ── STAGE 1 ────────────────────────────────────────────
  printStage(1, 'Finding Lookalike Companies');
  const companies = findLookalikeCompanies(seedDomain, 10);
  saveData('companies.json', companies);

  if (!companies.length) {
    console.log('\n  ❌ No companies found. Stopping.');
    return;
  }
  console.log('\n  ✅ Stage 1 complete. companies.json written.');

  // ── STAGE 2 ────────────────────────────────────────────
  printStage(2, 'Finding Decision Makers + LinkedIn URLs (Prospeo)');
  const prospects = await findDecisionMakers(companies);
  saveData('prospects.json', prospects);

  if (!prospects.length) {
    console.log('\n  ❌ No prospects found. Stopping.');
    return;
  }
  console.log('\n  ✅ Stage 2 complete. prospects.json written.');

  // ── STAGE 3 ────────────────────────────────────────────
  printStage(3, 'Resolving Verified Emails (Hunter.io)');
  const verified = await resolveEmails(prospects);
  saveData('verified_contacts.json', verified);

  if (!verified.length) {
    console.log('\n  ❌ No verified emails found. Stopping.');
    return;
  }
  console.log('\n  ✅ Stage 3 complete. verified_contacts.json written.');

  // ── STAGE 4 ────────────────────────────────────────────
  printStage(4, 'Sending Cold Outreach Emails (Brevo)');
  await sendOutreach(verified);

  console.log('\n  ✅ Pipeline complete!\n');
}

// ── CLI entry ──────────────────────────────────────────────────────────────
const seedDomain = process.argv[2];

if (!seedDomain) {
  console.log('\n  Usage:   node index.js <domain>');
  console.log('  Example: node index.js stripe.com\n');
  process.exit(1);
}

runPipeline(seedDomain).catch(err => {
  console.error('\n💥 Pipeline crashed:', err.message);
  process.exit(1);
});