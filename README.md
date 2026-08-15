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

### 3. Configure Supabase credentials

**Netlify (recommended for deploy):**

1. In Supabase: **Project Settings → API** → copy **Project URL** and **anon/public key**.
2. In Netlify: **Site configuration → Environment variables** → add:

| Variable | Value |
|----------|--------|
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_ANON_KEY` | your anon/publishable key |
| `TMDB_API_KEY` | your [TMDB v3 API key](https://www.themoviedb.org/settings/api) (optional, for Add Item search) |

3. Deploy — the build generates `config.js` from those variables automatically.

**Local dev** (pick one):

- Keep your existing `MCU-Tracker/config.js`, or
- Copy `.env.example` → `.env`, fill in values, then run `npm run dev`

**Do not commit `config.js` or `.env`** — both are gitignored.


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

## Hosting on Netlify

Connect the GitHub repo in Netlify. Settings are already in `netlify.toml`:

| Setting | Value |
|---------|--------|
| **Build command** | `npm run build` |
| **Publish directory** | `MCU-Tracker` |
| **Run command** | *(none — static site)* |

Add environment variables in the Netlify UI (see step 3 above), then deploy.

## Shared navbar (multi-app)

Navigation links and the navbar UI (including the edit popup) are stored in Supabase so every Netlify app can share the same menu.

1. Run `supabase/migrations/002_navbar_settings.sql` in the SQL editor (seeds MCU + Example links).
2. Push the component source to Supabase once:

```bash
npm run sync-navbar
```

3. Each app needs:
   - `<div id="shared-navbar-mount"></div>` at the top of the body
   - `navbar-bootstrap.js` (copy from this repo)
   - `config.js` with `SUPABASE_URL` and `SUPABASE_ANON_KEY` only
   - `window.initSharedNavbar()` defined **in the app's HTML/JS before bootstrap** — see the header comment in `shared/navbar-component.js` for `colors` and `style` Tailwind classes

**Per-app customization:** set `colors` (required) and optional `style` in `initSharedNavbar()` in each app's source. Do not put colors in config or Supabase. Edit link labels/URLs with the pencil icon (saves to Supabase for all apps).

**New app checklist:**

```html
<div id="shared-navbar-mount"></div>
<script src="config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  window.initSharedNavbar = function ({ supabase, links, mount }) {
    SharedNavbar.init({
      supabase, links, mount,
      colors: { link: 'text-gray-400', hover: 'hover:text-gray-200', active: 'text-white' }
    });
  };
</script>
<script src="navbar-bootstrap.js"></script>
```

After editing `shared/navbar-component.js`, run `npm run sync-navbar` to update all apps on next load.

Local preview with the same build step:

```bash
npm run dev
```

## Security note

This is a personal app: the anon key lives in `config.js` in your static site. That's fine for a solo tracker nobody else uses. Don't publish your keys in a public repo.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main tracker (Supabase + localStorage cache) |
| `harvest.html` | One-time export from old localStorage |
| `config.example.js` | Local manual config template |
| `.env.example` | Local env template for `npm run build` |
| `netlify.toml` | Netlify build + publish settings |
| `scripts/generate-config.js` | Writes `config.js` from env vars at build time |
| `shared/navbar-component.js` | Shared navbar source (synced to Supabase) |
| `MCU-Tracker/navbar-bootstrap.js` | Loader copied into each app |
| `supabase/migrations/002_navbar_settings.sql` | Shared navbar links + component storage |
| `localstorage.json` | Initial timeline catalog (no progress) |
| `supabase/migrations/001_tracker_app_state.sql` | Database schema |
