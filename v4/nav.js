/* ============================================================================
   Shared site header — SINGLE SOURCE OF TRUTH for the nav.
   Every page includes <div id="site-header"></div><script src="nav.js"></script>
   right after <body>, so this runs synchronously (header exists before the
   page's bottom inline JS wires #invert / #burger / #mobile). Edit links ONCE
   here and every page updates — no more hand-syncing nav across files.

   This file ALSO owns the mobile-menu behavior so it stays consistent on every
   page: the burger morphs to an X when open, a dimming overlay sits under the
   menu, background scroll is locked, and tapping the overlay (or Escape) closes
   it. The per-page inline script still toggles `.open` on the burger + closes on
   link click; here we only ADD close/overlay/lock behaviors (no double-binding).
   ========================================================================== */
(function () {
  var HOME = 'evolved-home-v3.html';

  // current page filename (e.g. "books.html"); '' or HOME both mean home
  var file = (location.pathname.split('/').pop() || HOME).toLowerCase();
  var isHome = (file === '' || file === HOME || file === 'index.html');

  // Home + logo always link to the home page (no #top anchor)
  var homeHref = HOME;

  var ITEMS = [
    { href: homeHref,      label: 'Home',    match: function () { return isHome; } },
    { href: 'books.html',  label: 'Books',   match: function () { return file === 'books.html'; } },
    { href: 'authors.html',label: 'Authors', match: function () { return file === 'authors.html' || file === 'authors-dan-herbatschek.html'; } },
    { href: 'about.html',  label: 'About',   match: function () { return file === 'about.html'; } }
  ];

  function links() {
    return ITEMS.map(function (it) {
      return '<a href="' + it.href + '"' + (it.match() ? ' aria-current="page"' : '') + '>' + it.label + '</a>';
    }).join('');
  }

  var html =
    '<header class="nav" id="nav">' +
      '<div class="nav__in">' +
        '<a href="' + homeHref + '" class="mark" aria-label="Grothendieck House — home">' +
          '<span class="mark__name">Grothendieck</span>' +
          '<span class="mark__sub">House</span>' +
        '</a>' +
        '<nav class="nav__links" aria-label="Primary">' + links() + '</nav>' +
        '<div class="nav__right">' +
          '<button class="invert desk" id="invert" type="button" aria-pressed="false">Light</button>' +
          '<button class="burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobile">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile" id="mobile">' + links() +
        '<button class="invert" id="invert-m" type="button" aria-pressed="false">Light</button>' +
      '</div>' +
    '</header>' +
    // dimming backdrop — sibling of the header so it sits UNDER the header+menu (z-50) but OVER the page
    '<div class="nav-overlay" id="nav-overlay"></div>';

  // ---- styles for the mobile-menu chrome (injected once, after the page's own <style> so it wins) ----
  var css =
    /* logo nudged 4pt lower in the nav bar (transform → no layout shift; applies on every page) */
    '.mark{transform:translateY(4pt)}' +
    /* V4 [4]: nav bar 4px taller (page CSS sets .nav__in height:78px; this wins, applies on every page) */
    '.nav__in{height:82px}' +
    /* V4 [20]/[2026-06-24]: nav menu font +2pt total (page CSS sets .nav__links a font-size:12px; capped here) */
    '.nav__links a{font-size:14px}' +
    /* V4 [2026-06-24]: light/dark toggle matches the nav-menu font (size + tracking); page CSS had 11px/.12em */
    '.invert{font-size:14px;letter-spacing:.1em}' +
    /* V4: consistent wide content band on big screens across ALL pages (matches the home page's >=1440 band) */
    '@media(min-width:1440px){:root{--maxw:1480px;--pad:clamp(44px,3vw,56px)}}' +
    /* V4 [59] site-wide: graded warm dark background on EVERY page (dark mode only) — matches the home page.
       body:not(.light) out-specifies the per-page :root --bg and the base body{background:var(--bg)}. */
    'body:not(.light){--bg:#121212;--bg-2:#1B1B1B;background:var(--bg)}' +
    /* burger → X morph */
    '.burger span{transition:transform .32s cubic-bezier(.4,0,.2,1),opacity .2s ease}' +
    '.nav.open .burger span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}' +
    '.nav.open .burger span:nth-child(2){opacity:0}' +
    '.nav.open .burger span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}' +
    /* dimming overlay under the open menu.
       NOTE: deliberately NO backdrop-filter here. On iOS Safari an element with -webkit-backdrop-filter is
       composited so it ignores z-index and paints OVER the sticky header (z-50) + menu (z-49) — which hid the
       whole menu behind the blur. A plain translucent layer respects z-index, so the header+menu stay on top.
       The dim alone gives the "separated" look. */
    '.nav-overlay{position:fixed;inset:0;z-index:48;background:rgba(8,6,4,.66);' +
      'opacity:0;visibility:hidden;pointer-events:none;transition:opacity .28s ease,visibility .28s ease}' +
    '.nav.open ~ .nav-overlay{opacity:1;visibility:visible;pointer-events:auto}' +
    '@media(min-width:861px){.nav-overlay{display:none}}' +   // desktop never needs it
    /* CRITICAL iOS FIX (mobile only): the header's own backdrop-filter (a) makes `.nav` the containing block
       for the fixed `.mobile` menu — so once you scroll, the menu is positioned relative to the header's
       scrolled-away origin and renders OFF-SCREEN (you only see the overlay); and (b) triggers the iOS
       z-index compositing bug for the stuck sticky header. Dropping backdrop-filter on mobile makes `.mobile`
       viewport-fixed again and restores normal stacking. Solid bg keeps the bar clean without the blur.
       Desktop (>860) keeps the frosted header. */
    '@media(max-width:860px){.nav{-webkit-backdrop-filter:none;backdrop-filter:none;background:var(--bg)}' +
      /* keep the header pinned to the viewport while the menu is open. A sticky header DE-STICKS (jumps
         off-screen, top→ -scrollY) the moment the page is scroll-locked, because the lock removes the scroll
         container it depends on — that's why a scrolled-down + open menu showed only the overlay. */
      '.nav.open{position:fixed;top:0;left:0;right:0}}' +
    /* scroll lock: position:fixed on body preserves the scroll position (overflow:hidden alone does NOT on
       iOS, and it also de-sticks the header). The observer sets top:-scrollY on lock and restores on unlock. */
    'body.nav-locked{position:fixed;left:0;right:0;width:100%;overflow:hidden}' +
    /* V4 [130]/[222]/[243]/[261]: scroll-driven section tint (shared). Mark a block .tint-on-scroll
       (add .tint--half for a softer level); it brightens to a cool tint + dark text when centered in
       the viewport, reverts as the next block takes over. Full-bleed via ::before. Dark mode only. */
    '.tint-on-scroll{position:relative;isolation:isolate;transition:color .55s ease}' +
    '.tint-on-scroll::before{content:"";position:absolute;top:0;bottom:0;left:calc(50% - 50vw);width:100vw;background:transparent;transition:background-color .55s ease;z-index:-1}' +
    'body:not(.light) .tint-on-scroll.tint-on{--bg-2:#EAEAEA;--text:#15171A;--text-2:#54585E;--text-3:#646A71;--line:#E2E2E2;--line-2:#D4D4D4;--accent:#2C66B5;--hair-color:color-mix(in srgb,#777777 70%,transparent);color:var(--text)}' +
    'body:not(.light) .tint-on-scroll.tint-on::before{background:#ECF1F6}' +          /* dark mode: default = brightest cool tint */
    'body:not(.light) .tint-on-scroll.tint--half.tint-on::before{background:#D2DCE6}' + /* dark mode: softer "half" level */
    /* light mode: page is already light, so DEEPEN the active section to a cool grey for scroll separation [291] */
    'body.light .tint-on-scroll.tint-on::before{background:#D2DBE4}' +
    'body.light .tint-on-scroll.tint--half.tint-on::before{background:#E4EAF0}' +
    '@media(prefers-reduced-motion:reduce){.burger span,.nav-overlay,.tint-on-scroll,.tint-on-scroll::before{transition:none}}';

  var slot = document.getElementById('site-header');
  if (slot) slot.outerHTML = html;

  var styleEl = document.createElement('style');
  styleEl.id = 'nav-menu-css';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---- behavior: close on overlay tap / Escape, and lock scroll while open ----
  var navEl = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var overlay = document.getElementById('nav-overlay');

  function close() {
    if (!navEl.classList.contains('open')) return;
    navEl.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (overlay) overlay.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) close();
  });

  // scroll-lock follows the `.open` class no matter who toggles it (burger / link / overlay / Escape).
  // Uses the position:fixed-body technique so the scroll position is preserved (and restored) on iOS.
  if (navEl && 'MutationObserver' in window) {
    var lockedY = 0, isLocked = false;
    var sync = function () {
      var open = navEl.classList.contains('open');
      if (open && !isLocked) {
        lockedY = window.scrollY || window.pageYOffset || 0;
        document.body.style.top = (-lockedY) + 'px';
        document.body.classList.add('nav-locked');
        isLocked = true;
      } else if (!open && isLocked) {
        document.body.classList.remove('nav-locked');
        document.body.style.top = '';
        isLocked = false;
        window.scrollTo(0, lockedY);              // restore exactly where they were
      }
    };
    new MutationObserver(sync).observe(navEl, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  // safety: if the viewport grows to desktop while the menu is open, close it (and release the lock)
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) close();
  }, { passive: true });

  // ---- V4: scroll-driven section tint. Any .tint-on-scroll block brightens when centered; .tint--half = softer level.
  // Deferred to DOMContentLoaded because nav.js runs before the page's sections are parsed. ----
  function initTintScroll() {
    var secs = document.querySelectorAll('.tint-on-scroll');
    if (!secs.length || !('IntersectionObserver' in window)) return;
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('tint-on', en.isIntersecting); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    secs.forEach(function (s) { tio.observe(s); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTintScroll);
  else initTintScroll();
})();
