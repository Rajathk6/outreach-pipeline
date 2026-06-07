// stages/stage4_brevo.js
// Stage 4 — Send personalized cold outreach emails via Brevo
// Flow:
//   1. Generate personalized email for each contact
//   2. Save all emails to data/email_preview.json for review
//   3. Ask for confirmation (y to send, anything else cancels)
//   4. Send emails one by one via Brevo SMTP API

const axios   = require('axios');
const readline = require('readline');
const config  = require('../config');
const { sleep, saveData } = require('../utils/helper');

const BASE_URL = config.brevo.baseUrl;
const HEADERS  = {
  'api-key':      config.brevo.apiKey,
  'Content-Type': 'application/json'
};

// ── Generate personalized email copy for each contact ─────────────────────
function generateEmail(contact) {
  const firstName = contact.name.split(' ')[0];
  const company   = contact.company_domain
    .replace(/\.(com|io|co|in|net|org).*/, '')
    .replace(/^www\./, '');
  const companyFormatted = company.charAt(0).toUpperCase() + company.slice(1);
  const title = contact.title || 'there';

  const subject = `Quick idea for ${companyFormatted}, ${firstName}`;

  const body = `Hi ${firstName},

I came across ${companyFormatted} and was genuinely impressed by what your team is building.

As ${title}, you're likely thinking about how to scale pipeline and outreach without linearly increasing headcount or manual effort.

We help companies automate their entire outbound process end to end — from identifying the right accounts to landing personalized emails in the right inboxes, completely hands-free.

Would you be open to a 15-minute conversation this week to see if there's a fit?

Best,
${config.sender.name}
${config.sender.email}`;

  return { subject, body };
}

// ── Build full preview of all emails before sending ───────────────────────
function buildEmailPreviews(contacts) {
  return contacts.map((contact, i) => {
    const { subject, body } = generateEmail(contact);
    return {
      index:          i + 1,
      to_name:        contact.name,
      to_email:       contact.email,
      company:        contact.company_domain,
      title:          contact.title,
      subject,
      body
    };
  });
}

// ── Wait for user confirmation ─────────────────────────────────────────────
function waitForConfirmation() {
  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question('\n  Type  y  to send all emails, any other key to cancel: ', answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

// ── Send a single email via Brevo ──────────────────────────────────────────
async function sendEmail(contact) {
  const { subject, body } = generateEmail(contact);

  const response = await axios.post(`${BASE_URL}/smtp/email`, {
    sender: {
      name:  config.sender.name,
      email: config.sender.email
    },
    to: [{
      email: contact.email,
      name:  contact.name
    }],
    subject,
    textContent: body
  }, { headers: HEADERS });

  return response.status === 201;
}

// ── Main Stage 4 function ──────────────────────────────────────────────────
async function sendOutreach(contacts) {

  // Step 1 — Generate and save all email previews
  console.log(`\n  ✍️  Generating email previews for ${contacts.length} contacts...`);
  const previews = buildEmailPreviews(contacts);
  saveData('email_preview.json', previews);

  // Step 2 — Print summary to terminal
  console.log('\n' + '═'.repeat(50));
  console.log('  📋 OUTREACH SUMMARY — REVIEW BEFORE SENDING');
  console.log('═'.repeat(50));

  previews.forEach(p => {
    console.log(`\n  [${p.index}] ${p.to_name} — ${p.to_email}`);
    console.log(`      Company : ${p.company}`);
    console.log(`      Subject : ${p.subject}`);
  });

  console.log('\n' + '═'.repeat(50));
  console.log(`  📁 Full email content saved to: data/email_preview.json`);
  console.log(`  Open that file to review each email body before approving.`);
  console.log('═'.repeat(50));

  // Step 3 — Wait for confirmation
  const confirmed = await waitForConfirmation();

  if (!confirmed) {
    console.log('\n  🚫 Cancelled — no emails sent.');
    return;
  }

  // Step 4 — Send emails one by one
  console.log('\n  🚀 Sending emails...\n');
  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      process.stdout.write(`  📨 Sending to ${contact.name} (${contact.email})...`);
      const ok = await sendEmail(contact);

      if (ok) {
        console.log(` ✅ sent`);
        sent++;
      } else {
        console.log(` ❌ failed`);
        failed++;
      }
    } catch (err) {
      console.log(` ❌ error: ${err.message}`);
      failed++;
    }

    await sleep(500);
  }

  // Final report
  console.log('\n' + '═'.repeat(50));
  console.log(`  📊 DONE — ${sent} sent, ${failed} failed out of ${contacts.length} total`);
  console.log('═'.repeat(50));
}

module.exports = { sendOutreach };