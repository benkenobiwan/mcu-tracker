const fs = require('fs');
const path = require('path');

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  console.error('Set them in Netlify UI or in a local .env file (see .env.example).');
  process.exit(1);
}

const outputPath = path.join(__dirname, '..', 'MCU-Tracker', 'config.js');
const contents = `// Generated at build time — do not edit manually on deploy targets.
window.SUPABASE_URL = ${JSON.stringify(url)};
window.SUPABASE_ANON_KEY = ${JSON.stringify(key)};
window.TMDB_API_KEY = ${JSON.stringify(process.env.TMDB_API_KEY || '')};
`;

fs.writeFileSync(outputPath, contents, 'utf8');

const sharedNavbarSrc = path.join(__dirname, '..', 'shared', 'navbar-component.js');
const sharedNavbarDest = path.join(__dirname, '..', 'MCU-Tracker', 'navbar-component.js');
fs.copyFileSync(sharedNavbarSrc, sharedNavbarDest);

console.log('Generated MCU-Tracker/config.js');
console.log('Copied shared/navbar-component.js to MCU-Tracker/');
