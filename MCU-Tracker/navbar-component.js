/**
 * ============================================================================
 * SHARED NAVBAR — integration guide for apps and Cursor agents
 * ============================================================================
 *
 * STORED IN SUPABASE (shared across all Netlify apps):
 *   navbar_settings.links         — [{ id, label, url }, ...]  edit via pencil UI
 *   navbar_settings.component_js  — this file (push with: npm run sync-navbar)
 *
 * NOT IN SUPABASE OR config.js — owned by each app in its own source code:
 *   Link colors and optional shell styling (see initSharedNavbar below).
 *
 * ── Per-app setup ──────────────────────────────────────────────────────────
 *
 *   <div id="shared-navbar-mount"></div>
 *
 *   <script src="config.js"></script>           <!-- SUPABASE_URL + ANON_KEY only -->
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *
 *   <script>
 *     // Define BEFORE navbar-bootstrap.js — colors/style live in app code, not config.
 *     window.initSharedNavbar = function ({ supabase, links, mount }) {
 *       SharedNavbar.init({
 *         supabase,
 *         links,
 *         mount,
 *
 *         // REQUIRED — Tailwind text/hover classes for nav links
 *         colors: {
 *           link:   'text-gray-400',        // inactive link
 *           hover:  'hover:text-gray-200',  // inactive link hover (prefix hover:)
 *           active: 'text-white'            // current page (matched by URL)
 *         },
 *
 *         // OPTIONAL — shell chrome (omit to use dark-theme defaults below)
 *         style: {
 *           nav:             'border-b border-gray-700/40 bg-black/40 backdrop-blur-md sticky top-0 z-30',
 *           linkBase:        'text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition',
 *           activeUnderline: 'underline decoration-gray-500 underline-offset-4',
 *           editButton:      'text-gray-500 hover:text-gray-200 transition p-1 rounded hover:bg-black/40 cursor-pointer shrink-0',
 *           modalBackdrop:   'fixed inset-0 bg-black/80 backdrop-blur-sm hidden items-center justify-center z-50 p-4',
 *           modalPanel:      'bg-[#1a0a0a] rounded-xl border border-gray-600/40 max-w-lg w-full p-5 shadow-2xl relative',
 *           modalAccentBar:  'absolute top-0 left-0 w-full h-1 bg-gray-500/40',
 *           modalTitle:      'text-sm font-bold text-gray-200 uppercase tracking-widest',
 *           modalSubtitle:   'text-xs text-gray-500',
 *           modalSave:       'bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer',
 *           modalCancel:     'bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer'
 *         }
 *       });
 *     };
 *   </script>
 *
 *   <script src="navbar-bootstrap.js"></script>
 *
 * ── colors (required) ──────────────────────────────────────────────────────
 *   Property   Type     Description
 *   link       string   Tailwind classes for inactive link text color
 *   hover      string   Tailwind hover:* classes (combined with link on <a>)
 *   active     string   Tailwind classes for the link whose URL matches this page
 *
 *   Example palettes:
 *     Dark grey (MCU):  link text-gray-400, hover hover:text-gray-200, active text-white
 *     Warm accent:      link text-gray-400, hover hover:text-red-300, active text-[#E23636]
 *
 * ── style (optional) ───────────────────────────────────────────────────────
 *   Property          Applied to
 *   nav               outer <nav> bar
 *   linkBase          every nav <a> (typography shared across states)
 *   activeUnderline   extra classes on active link only
 *   editButton        pencil icon button
 *   modalBackdrop     full-screen edit overlay
 *   modalPanel        edit dialog box
 *   modalAccentBar    top accent strip inside dialog
 *   modalTitle        dialog heading
 *   modalSubtitle     dialog helper text
 *   modalSave         save button
 *   modalCancel       cancel button
 *
 * Use Tailwind utility strings only (this project loads Tailwind via CDN).
 * ============================================================================
 */
(function () {
  function normalizeUrl(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin + parsed.pathname.replace(/\/$/, '');
    } catch {
      return String(url || '').trim().replace(/\/$/, '');
    }
  }

  function isActiveLink(url) {
    return normalizeUrl(url) === normalizeUrl(window.location.href);
  }

  function defaultStyle() {
    return {
      nav: 'border-b border-gray-700/40 bg-black/40 backdrop-blur-md sticky top-0 z-30',
      linkBase: 'text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition',
      activeUnderline: 'underline decoration-gray-500 underline-offset-4',
      editButton: 'text-gray-500 hover:text-gray-200 transition p-1 rounded hover:bg-black/40 cursor-pointer shrink-0',
      modalBackdrop: 'fixed inset-0 bg-black/80 backdrop-blur-sm hidden items-center justify-center z-50 p-4',
      modalPanel: 'bg-[#1a0a0a] rounded-xl border border-gray-600/40 max-w-lg w-full p-5 shadow-2xl relative',
      modalAccentBar: 'absolute top-0 left-0 w-full h-1 bg-gray-500/40',
      modalTitle: 'text-sm font-bold text-gray-200 uppercase tracking-widest',
      modalSubtitle: 'text-xs text-gray-500',
      modalSave: 'bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer',
      modalCancel: 'bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer'
    };
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.SharedNavbar = {
    links: [],
    supabase: null,
    mount: null,
    colors: null,
    style: defaultStyle(),

    init(options) {
      if (!options.colors) {
        console.warn('SharedNavbar: pass colors in initSharedNavbar() — see navbar-component.js header docs.');
      }

      this.supabase = options.supabase;
      this.mount = options.mount;
      this.links = Array.isArray(options.links) ? options.links : [];
      this.colors = options.colors || {
        link: 'text-gray-400',
        hover: 'hover:text-gray-200',
        active: 'text-white'
      };
      this.style = { ...defaultStyle(), ...(options.style || {}) };
      this.render();
    },

    render() {
      if (!this.mount) return;

      const s = this.style;

      this.mount.innerHTML = `
        <nav class="${s.nav}">
          <div class="max-w-5xl mx-auto px-4 h-10 flex items-center justify-between gap-4">
            <div id="shared-navbar-links" class="flex items-center gap-5 min-w-0 overflow-x-auto"></div>
            <button type="button" id="shared-navbar-edit" title="Edit navigation links" class="${s.editButton}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </nav>
        <div id="shared-navbar-modal" class="${s.modalBackdrop}">
          <div class="${s.modalPanel}">
            <div class="${s.modalAccentBar}"></div>
            <h3 class="${s.modalTitle} mb-1">Navigation links</h3>
            <p class="${s.modalSubtitle} mb-4">Shared across all apps via Supabase.</p>
            <div id="shared-navbar-editor-rows" class="space-y-2 max-h-72 overflow-y-auto pr-1"></div>
            <button type="button" id="shared-navbar-add-row"
              class="mt-3 text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-200 cursor-pointer">
              + Add link
            </button>
            <div class="flex justify-end gap-2 mt-5">
              <button type="button" id="shared-navbar-cancel" class="${s.modalCancel}">Cancel</button>
              <button type="button" id="shared-navbar-save" class="${s.modalSave}">Save</button>
            </div>
            <p id="shared-navbar-error" class="text-xs text-red-400 mt-3 hidden"></p>
          </div>
        </div>
      `;

      this.renderLinks();
      this.bindEvents();
    },

    renderLinks() {
      const container = document.getElementById('shared-navbar-links');
      if (!container) return;

      container.innerHTML = this.links.map(link => {
        const active = isActiveLink(link.url);
        const colorClass = active
          ? this.colors.active
          : `${this.colors.link} ${this.colors.hover}`;
        const underline = active ? this.style.activeUnderline : '';
        return `<a href="${escapeHtml(link.url)}" class="${this.style.linkBase} ${colorClass} ${underline}">${escapeHtml(link.label)}</a>`;
      }).join('');
    },

    bindEvents() {
      document.getElementById('shared-navbar-edit')?.addEventListener('click', () => this.openEditor());
      document.getElementById('shared-navbar-cancel')?.addEventListener('click', () => this.closeEditor());
      document.getElementById('shared-navbar-add-row')?.addEventListener('click', () => this.addEditorRow());
      document.getElementById('shared-navbar-save')?.addEventListener('click', () => this.saveEditor());

      document.getElementById('shared-navbar-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'shared-navbar-modal') this.closeEditor();
      });
    },

    openEditor() {
      const modal = document.getElementById('shared-navbar-modal');
      const rows = document.getElementById('shared-navbar-editor-rows');
      const error = document.getElementById('shared-navbar-error');
      if (!modal || !rows) return;

      error?.classList.add('hidden');
      rows.innerHTML = '';
      this.links.forEach(link => this.addEditorRow(link));
      if (!this.links.length) this.addEditorRow();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    },

    closeEditor() {
      const modal = document.getElementById('shared-navbar-modal');
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
    },

    addEditorRow(link = {}) {
      const rows = document.getElementById('shared-navbar-editor-rows');
      if (!rows) return;

      const row = document.createElement('div');
      row.className = 'grid grid-cols-[1fr_1.4fr_auto] gap-2 items-center';
      row.innerHTML = `
        <input type="text" data-field="label" placeholder="Label" value="${escapeHtml(link.label || '')}"
          class="bg-black/50 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-gray-500">
        <input type="url" data-field="url" placeholder="https://..." value="${escapeHtml(link.url || '')}"
          class="bg-black/50 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-gray-500">
        <button type="button" data-action="remove" title="Remove"
          class="text-gray-500 hover:text-red-400 px-1 cursor-pointer">✕</button>
      `;

      row.querySelector('[data-action="remove"]')?.addEventListener('click', () => row.remove());
      rows.appendChild(row);
    },

    readEditorRows() {
      const rows = document.querySelectorAll('#shared-navbar-editor-rows > div');
      const links = [];

      rows.forEach((row, index) => {
        const label = row.querySelector('[data-field="label"]')?.value.trim();
        const url = row.querySelector('[data-field="url"]')?.value.trim();
        if (!label && !url) return;
        if (!label || !url) throw new Error('Each link needs both a label and URL.');
        links.push({
          id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'link'}-${index}`,
          label,
          url
        });
      });

      return links;
    },

    async saveEditor() {
      const error = document.getElementById('shared-navbar-error');
      const saveBtn = document.getElementById('shared-navbar-save');
      if (!this.supabase || !saveBtn) return;

      try {
        const links = this.readEditorRows();
        error?.classList.add('hidden');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving…';

        const { error: dbError } = await this.supabase
          .from('navbar_settings')
          .update({ links })
          .eq('id', 1);

        if (dbError) throw dbError;

        this.links = links;
        this.renderLinks();
        this.closeEditor();
      } catch (err) {
        if (error) {
          error.textContent = err.message || 'Could not save navigation links.';
          error.classList.remove('hidden');
        }
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    }
  };
})();
