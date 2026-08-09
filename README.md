# MCU Saga Tracker

Personal Marvel timeline tracker with cloud sync via Supabase.

## Quick start

### 1. Harvest your live progress (do this first)

Your `localstorage.json` in this repo is the **initial catalog only** — it does not include your watched/skipped progress.

1. Open the **old tracker** in the browser where you've been checking things off (same browser/profile).
2. Open `MCU-Tracker/harvest.html` in that same browser (double-click or serve locally).
3. Click **Download my-state.json** — this captures `mcu_timeline_state` from localStorage plus your start date.

Keep that file safe until step 4.

**If harvest shows no data** (common with `file://` URLs), open your old tracker, press F12 → Console, paste:

```javascript
copy(JSON.stringify({
  startDate: '2026-05-04',
  items: JSON.parse(localStorage.getItem('mcu_timeline_state') || '[]')
}, null, 2))
```

Paste into a new file named `my-state.json`.

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

If you open the new tracker in the **same browser** that still has localStorage data:

1. Set up Supabase + `config.js` first.
2. Open `index.html`.
3. A **Migrate local progress?** prompt appears when cloud is empty but localStorage has watched/skipped items.
4. Click **Upload to Supabase**.

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
