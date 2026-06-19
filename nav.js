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
    /* burger → X morph */
    '.burger span{transition:transform .32s cubic-bezier(.4,0,.2,1),opacity .2s ease}' +
    '.nav.open .burger span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}' +
    '.nav.open .burger span:nth-child(2){opacity:0}' +
    '.nav.open .burger span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}' +
    /* dimming overlay under the open menu */
    '.nav-overlay{position:fixed;inset:0;z-index:48;background:rgba(8,6,4,.55);' +
      '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);' +
      'opacity:0;visibility:hidden;pointer-events:none;transition:opacity .28s ease,visibility .28s ease}' +
    '.nav.open ~ .nav-overlay{opacity:1;visibility:visible;pointer-events:auto}' +
    '@media(min-width:861px){.nav-overlay{display:none}}' +   // desktop never needs it
    /* lock background scroll while the menu is open (class set by the observer below) */
    'html.nav-open,html.nav-open body{overflow:hidden}' +
    '@media(prefers-reduced-motion:reduce){.burger span,.nav-overlay{transition:none}}';

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

  // scroll-lock follows the `.open` class no matter who toggles it (burger / link / overlay / Escape)
  if (navEl && 'MutationObserver' in window) {
    var sync = function () {
      document.documentElement.classList.toggle('nav-open', navEl.classList.contains('open'));
    };
    new MutationObserver(sync).observe(navEl, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  // safety: if the viewport grows to desktop while the menu is open, close it (and release the lock)
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) close();
  }, { passive: true });
})();
