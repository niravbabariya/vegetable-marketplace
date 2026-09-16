#!/usr/bin/env node
/**
 * Veggitable — Data Seed Script
 * ─────────────────────────────
 * Run this to initialise or RESET data from seed files.
 *
 * Usage:
 *   node seed.js            → only creates missing data files (safe, won't overwrite)
 *   node seed.js --force    → RESETS all data files to seed defaults (deletes live data!)
 *
 * Seed source files live in: data/seed/
 * They ARE committed to git.
 *
 * Live data files (data/*.json) are in .gitignore
 * and will NOT be overwritten on git pull.
 */

'use strict';
require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const SEED_DIR = path.join(DATA_DIR, 'seed');
const FORCE    = process.argv.includes('--force');

const files = [
  { live: 'users.json',    seed: 'users.seed.json'    },
  { live: 'products.json', seed: 'products.seed.json' },
  { live: 'orders.json',   seed: null                  }, // orders always start empty
];

console.log('\n🌱  Veggitable Data Seed');
console.log('─'.repeat(40));

files.forEach(({ live, seed }) => {
  const livePath = path.join(DATA_DIR, live);
  const exists   = fs.existsSync(livePath);

  if (exists && !FORCE) {
    console.log(`✔  ${live} — already exists (skipped)`);
    return;
  }

  if (live === 'orders.json') {
    fs.writeFileSync(livePath, '[]');
    console.log(`✔  ${live} — ${exists && FORCE ? 'RESET' : 'created'} (empty)`);
    return;
  }

  const seedPath = path.join(SEED_DIR, seed);
  if (!fs.existsSync(seedPath)) {
    console.warn(`⚠  ${live} — seed file missing at ${seedPath}, skipped`);
    return;
  }

  fs.copyFileSync(seedPath, livePath);
  console.log(`✔  ${live} — ${exists && FORCE ? 'RESET from seed' : 'created from seed'}`);
});

console.log('─'.repeat(40));
if (FORCE) {
  console.log('⚠  All data has been RESET to seed defaults.');
} else {
  console.log('✅  Done. Run with --force to reset all data to defaults.');
}
console.log('');
