// main.js
console.log('main.js loaded');

(function () {
  // --- small DOM helpers ---
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  // clean up badges in the sidebar so text isn’t duplicated in labels
  document.querySelectorAll('.submenu .badge').forEach(badge => {
    if (!badge.hasAttribute('data-label')) {
      badge.setAttribute('data-label', badge.textContent.trim());
      badge.textContent = '';
    }
    badge.setAttribute('aria-hidden', 'true');
  });

  // Enable in-panel SPA navigation for data-page elements inside .content too
document.addEventListener('click', function (event) {
  const target = event.target.closest('[data-page]');
  if (!target) return;

  // Prevent full page reload
  event.preventDefault();

  const page = target.getAttribute('data-page');
  if (!page) return;

  // Highlight selected state if you want
  document.querySelectorAll('.submenu li').forEach(li => li.classList.remove('selected'));

  // Load the HTML into the main content area
  fetch(page)
    .then(response => response.text())
    .then(html => {
      const content = document.querySelector('.content');
      if (content) {
        content.innerHTML = html;
        // Optional: scroll to top after load
        content.scrollTo({ top: 0, behavior: 'smooth' });
      }
    })
    .catch(err => console.error('Error loading page:', err));
});


  // --- fuzzy matching helpers (used by search overlay) ---
  const _norm = (s) => String(s || '')
    .toLowerCase()
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s'"]/gu, ' ')
    .trim();

  const _tokens = (s) => _norm(s).split(' ').filter(Boolean);

  function _score(label, wanted) {
    const a = _tokens(label);
    const b = _tokens(wanted);
    if (!a.length || !b.length) return 0;

    if (a.join(' ') === b.join(' ')) return 100; // exact match

    const aset = new Set(a);
    const hits = b.filter(t => aset.has(t)).length;
    const coverage = hits / b.length;

    const aStr = a.join(' ');
    const bStr = b.join(' ');
    const starts = aStr.startsWith(bStr) ? 0.2 : 0;
    const incl   = aStr.includes(bStr) ? 0.1 : 0;

    return Math.round((coverage * 80) + (starts * 10) + (incl * 10));
  }

  // quick alias map if names don’t line up exactly
  const TITLE_ALIASES = {
    'Project Attributes': 'Project Attributions',
    'Project Labels': 'Project Labels',
  };

  function findMenuItemByTitleSmart(title) {
    const wanted = TITLE_ALIASES[title] || title || '';
    const esc = (v) => (window.CSS && CSS.escape) ? CSS.escape(v) : v;

    // try direct lookup first
    let li =
      document.querySelector(`.submenu li[data-section="${esc(wanted)}"]`) ||
      document.querySelector(`.submenu li[data-title="${esc(wanted)}"]`);
    if (li) return li;

    // otherwise score all items and pick the best
    let best = null, bestScore = 0;
    $all('.submenu li').forEach(el => {
      const label = el.getAttribute('data-section') ||
                    el.getAttribute('data-title') ||
                    el.textContent || '';
      const s = _score(label, wanted);
      if (s > bestScore) { best = el; bestScore = s; }
    });
    return bestScore >= 60 ? best : null;
  }

  // --- scrolling helpers ---
  function getScrollContainer(el) {
    let node = el?.parentElement;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      if (/(auto|scroll|overlay)/i.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }
    return document.querySelector('.sidebar') || document.scrollingElement || document.documentElement;
  }

  function scrollIntoViewWithin(container, target) {
    if (!container || !target) return;
    const offsetTop = target.offsetTop - container.offsetTop;
    const targetCenter = offsetTop - (container.clientHeight / 2) + (target.clientHeight / 2);
    container.scrollTo({ top: Math.max(0, targetCenter), behavior: 'smooth' });
  }

  // --- selecting + loading pages ---
  function selectMenuItem(li) {
    $all('.submenu li.selected').forEach(el => el.classList.remove('selected'));
    li.classList.add('selected');
  }

  function loadPage(page) {
    const contentEl = $('.content');
    if (!page || !contentEl) return;
    fetch(page)
      .then(r => r.text())
      .then(html => {
        contentEl.innerHTML = html;
        if (window.hydrateInjectedVideo) {
          try { window.hydrateInjectedVideo(contentEl); } catch (e) { console.warn(e); }
        }
      })
      .catch(err => {
        console.error('Error loading content:', err);
        contentEl.innerHTML = `<p>Failed to load content.</p>`;
      });
  }

  function bindSubmenuClicks() {
    $all('.submenu li').forEach(item => {
      if (item._bound) return; // don’t double bind
      item._bound = true;
      item.addEventListener('click', () => {
        selectMenuItem(item);
        const page = item.getAttribute('data-page');
        loadPage(page);
      }, { passive: true });
    });
  }
  bindSubmenuClicks();

  // --- home button: jumps to Logging In ---
  const HOME_TARGET_PAGE = 'pages/introduction/logging-in.html';
  const homeBtn = document.querySelector('.home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      const li = document.querySelector(`.submenu li[data-page="${HOME_TARGET_PAGE}"]`);
      if (!li) return console.warn('Home target not found:', HOME_TARGET_PAGE);

      // make sure section is open
      const submenu = li.closest('.submenu');
      if (submenu && submenu.classList.contains('collapsed')) {
        const header = submenu.previousElementSibling;
        header ? header.click() : submenu.classList.remove('collapsed');
      }

      // trigger normal click
      selectMenuItem(li);
      li.click();

      // scroll it into view
      const container = getScrollContainer(li);
      scrollIntoViewWithin(container, li);

      // quick spotlight animation
      li.classList.add('spotlight');
      setTimeout(() => li.classList.remove('spotlight'), 1100);
    });
  }

  // --- sidebar toggle for mobile ---
  const toggleBtn = $('#menu-toggle');
  const mainContainer = $('.main-container');
  toggleBtn?.addEventListener('click', () => {
    mainContainer?.classList.toggle('offcanvas');
  });

  // --- section expand/collapse ---
  function initSectionToggles() {
    $all('.section-title, .section-header').forEach((header) => {
      const submenu = header.nextElementSibling;
      if (!submenu || !submenu.classList.contains('submenu')) return;

      const isCollapsed = submenu.classList.contains('collapsed');
      header.classList.toggle('open', !isCollapsed);
      header.classList.toggle('closed', isCollapsed);
      header.setAttribute('aria-expanded', String(!isCollapsed));

      const icon = header.querySelector('.toggle-icon, .dropdown-icon');
      const setIcon = (collapsed) => { if (icon) icon.textContent = collapsed ? '▶' : '▼'; };
      setIcon(isCollapsed);

      const toggle = () => {
        const willCollapse = !submenu.classList.contains('collapsed');
        submenu.classList.toggle('collapsed', willCollapse);
        header.classList.toggle('open', !willCollapse);
        header.classList.toggle('closed', willCollapse);
        header.setAttribute('aria-expanded', String(!willCollapse));
        setIcon(willCollapse);
      };

      header.addEventListener('click', (e) => { e.preventDefault(); toggle(); });
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }
  initSectionToggles();

  // --- hook for search modal events ---
  window.addEventListener('search:openTutorial', (e) => {
    const mainContainer = document.querySelector('.main-container');
    const sidebar = document.querySelector('.sidebar');
    mainContainer?.classList.remove('offcanvas', 'collapsed');
    sidebar?.classList.remove('collapsed');

    const title = (e.detail && (e.detail.title || e.detail.layer)) || '';
    if (!title) return;

    const li = findMenuItemByTitleSmart(title);
    if (!li) return console.warn('No menu match for:', title);

    const submenu = li.closest('.submenu');
    if (submenu && submenu.classList.contains('collapsed')) {
      const header = submenu.previousElementSibling;
      header ? header.click() : submenu.classList.remove('collapsed');
    }

    selectMenuItem(li);
    li.click();

    const container = getScrollContainer(li);
    scrollIntoViewWithin(container, li);

    li.classList.add('spotlight');
    setTimeout(() => li.classList.remove('spotlight'), 1100);
  });

// --- Role-card spotlight navigation (for Logging In page) ---
document.addEventListener('click', (e) => {
  const card = e.target.closest('.role-card[data-page]');
  if (!card) return;

  e.preventDefault();
  const page = card.getAttribute('data-page');
  if (!page) return;

  // Find matching sidebar item
  const li = document.querySelector(`.submenu li[data-page="${page}"]`);
  if (!li) {
    console.warn('No matching sidebar item for:', page);
    return;
  }

  // Expand the section if collapsed
  const submenu = li.closest('.submenu');
  if (submenu && submenu.classList.contains('collapsed')) {
    const header = submenu.previousElementSibling;
    if (header) header.click();
  }

  // Select and trigger load
  li.classList.add('selected');
  li.click();

  // Smooth scroll and spotlight (uses your existing functions)
  const container = getScrollContainer(li);
  scrollIntoViewWithin(container, li);

  li.classList.add('spotlight');
  setTimeout(() => li.classList.remove('spotlight'), 1100);
});


})();
