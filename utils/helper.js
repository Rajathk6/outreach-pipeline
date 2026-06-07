const fs = require('fs');
const path = require('path');

// ── Sleep between API calls to avoid rate limits ───────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Save stage output to /data folder ─────────────────────────────────────
const saveData = (filename, data) => {
  const dir = path.join(__dirname, '../data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`  Saved → data/${filename} (${Array.isArray(data) ? data.length + ' records' : 'object'})`);
};

// ── Load previously saved data ─────────────────────────────────────────────
const loadData = (filename) => {
  const filepath = path.join(__dirname, '../data', filename);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
};

// ── Retry wrapper — retries a failing API call up to N times ──────────────
const withRetry = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = i === retries - 1;
      if (isLast) throw err;
      console.log(`  Attempt ${i + 1} failed: ${err.message}`);
      console.log(`  Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
};

// ── Pretty section header ──────────────────────────────────────────────────
const printStage = (num, title) => {
  console.log('\n' + '━'.repeat(50));
  console.log(`  STAGE ${num} — ${title}`);
  console.log('━'.repeat(50));
};

module.exports = { sleep, saveData, loadData, withRetry, printStage };