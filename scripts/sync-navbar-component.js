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
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const componentPath = path.join(__dirname, '..', 'shared', 'navbar-component.js');
const componentJs = fs.readFileSync(componentPath, 'utf8');

async function main() {
  const response = await fetch(`${url}/rest/v1/navbar_settings?id=eq.1`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ component_js: componentJs })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase sync failed (${response.status}): ${body}`);
  }

  console.log('Synced shared/navbar-component.js to navbar_settings.component_js');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
