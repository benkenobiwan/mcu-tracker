# MCU Saga Tracker

Personal Marvel timeline tracker with cloud sync via Supabase.

## Quick start

### 1. Harvest your live progress (do this first)

Your `localstorage.json` in this repo is the **initial catalog only** — it does not include your watched/skipped progress.

**If you used the Netlify tracker** ([mcu-narrative-watch-order.netlify.app](https://mcu-narrative-watch-order.netlify.app/)) — this is the usual case — localStorage lives on that domain only. A local `harvest.html` file **cannot** see it.

1. Open [mcu-narrative-watch-order.netlify.app](https://mcu-narrative-watch-order.netlify.app/) in the browser where you've been checking things off.
2. Press **F12** → **Console**.
3. Paste this script and press Enter:

```javascript
(function () {
  var raw = localStorage.getItem('mcu_timeline_state');
  if (!raw || raw === '[]') { alert('No timeline data found.'); return; }
  var items = JSON.parse(raw);
  var payload = {
    startDate: localStorage.getItem('mcu_start_date') || '2026-05-04',
    items: items,
    exportedAt: new Date().toISOString(),
    source: location.hostname
  };
  var watched = items.filter(function (i) { return i.status === 'watched'; }).length;
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'my-state.json';
  a.click();
  URL.revokeObjectURL(a.href);
  alert('Downloaded my-state.json\n' + items.length + ' items · ' + watched + ' watched');
})();
```

4. Save the downloaded `my-state.json`.

Or open `MCU-Tracker/harvest.html` locally and click **Copy export script** — same script, with instructions.

**If you used a local copy of the tracker** on the same machine, open `harvest.html` from that same origin (or use the console script on that page).

### 2. Create Supabase project

1. Sign up at [supabase.com](https://supabase.com) (free tier is plenty).
2. Create a new project.
3. Open **SQL Editor** → **New query**.
4. Paste the contents of `supabase/migrations/001_tracker_app_state.sql` and run it.

### 3. Configure the app

1. In Supabase: **Project Settings → API**.
2. Copy **Project URL** and **anon/public key** (legacy anon key or new publishable key both work).
3. In this repo:

```bash
cp MCU-Tracker/config.example.js MCU-Tracker/config.js
```

4. Edit `MCU-Tracker/config.js` with your URL and key.

**Do not commit `config.js`** — it's gitignored.

### 4. Import your harvested state

1. Open `MCU-Tracker/index.html` (local file or host on GitHub Pages / Netlify).
2. Click **Import state.json** and choose `my-state.json` from step 1.
3. The app uploads to Supabase automatically if `config.js` is set up.

You should see **Synced** in the header. Click the start date to change it anytime — it saves to Supabase.

## Alternative: migrate without a file

This only works if the new tracker is on the **same URL** as the old one (same localStorage origin). If you're moving from Netlify to a new deploy, use the console export above instead.

## Daily use

- Checkoffs auto-save to Supabase (and localStorage as offline cache).
- **Export backup** downloads `{ startDate, items }` JSON anytime.
- **Import state.json** accepts either the old array format or the new `{ startDate, items }` format.

## Hosting (optional)

Static files only — no backend needed beyond Supabase.

- GitHub Pages: push repo, enable Pages on `/MCU-Tracker` or root.
- Or open locally with any static server:

```bash
npx serve MCU-Tracker
```

## Security note

This is a personal app: the anon key lives in `config.js` in your static site. That's fine for a solo tracker nobody else uses. Don't publish your keys in a public repo.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main tracker (Supabase + localStorage cache) |
| `harvest.html` | One-time export from old localStorage |
| `config.example.js` | Template for Supabase credentials |
| `localstorage.json` | Initial timeline catalog (no progress) |
| `supabase/migrations/001_tracker_app_state.sql` | Database schema |
