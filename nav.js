/* ============================================================================
   Shared site header — SINGLE SOURCE OF TRUTH for the nav.
   Every page includes <div id="site-header"></div><script src="nav.js"></script>
   right after <body>, so this runs synchronously (header exists before the
   page's bottom inline JS wires #invert / #burger / #mobile). Edit links ONCE
   here and every page updates — no more hand-syncing nav across files.
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
    '</header>';

  var slot = document.getElementById('site-header');
  if (slot) slot.outerHTML = html;
})();
