/**
 * Bootstrap loader — copy into each app (small, stable).
 * Loads component + links from Supabase, then calls window.initSharedNavbar().
 *
 * Each app MUST define initSharedNavbar() in its own HTML/JS before this script,
 * with colors/style in app source — not config.js. See shared/navbar-component.js.
 */
async function bootstrapSharedNavbar() {
  const mount = document.getElementById('shared-navbar-mount');
  if (!mount) {
    console.warn('Shared navbar skipped: #shared-navbar-mount not found in DOM.');
    return;
  }

  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || window.SUPABASE_URL.includes('YOUR_PROJECT_REF')) {
    console.warn('Shared navbar skipped: Supabase config missing.');
    return;
  }

  if (typeof window.initSharedNavbar !== 'function') {
    console.warn('Shared navbar skipped: define window.initSharedNavbar() before navbar-bootstrap.js (see shared/navbar-component.js).');
    return;
  }

  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  try {
    const { data, error } = await client
      .from('navbar_settings')
      .select('links, component_js')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;

    if (data?.component_js) {
      const script = document.createElement('script');
      script.textContent = data.component_js;
      document.head.appendChild(script);
    } else if (!window.SharedNavbar) {
      await new Promise((resolve, reject) => {
        const fallback = document.createElement('script');
        fallback.src = 'navbar-component.js';
        fallback.onload = resolve;
        fallback.onerror = () => reject(new Error('Navbar component missing in Supabase and local fallback.'));
        document.head.appendChild(fallback);
      });
    }

    if (!window.SharedNavbar) {
      throw new Error('SharedNavbar failed to load.');
    }

    window.initSharedNavbar({
      supabase: client,
      links: data?.links || [],
      mount
    });
  } catch (err) {
    console.error('Shared navbar failed to load:', err);
  }
}

function startSharedNavbarBootstrap() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapSharedNavbar);
  } else {
    bootstrapSharedNavbar();
  }
}

startSharedNavbarBootstrap();
