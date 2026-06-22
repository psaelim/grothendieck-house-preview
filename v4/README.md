# Grothendieck House — design preview

A redesign of grothendieckhouse.com (dark + light). Five linked pages sharing one nav and design system.

## How to view

**Easiest — open the hosted link** (if you were sent one): just open it in **Chrome** and click around.

**Or run it locally** (the book covers on the homepage rotate on hover — that needs a tiny local server, not double-clicking the file):

```bash
# from inside this folder:
python3 serve.py
# then open the URL it prints, e.g. http://localhost:8732/
```

> Double-clicking `index.html` mostly works, but the **3D book-rotation hover** on the homepage
> only animates when served over HTTP (via `serve.py`) — so prefer the server for the full effect.

## Pages

| Page | File |
|------|------|
| Home | `evolved-home-v3.html` (or just `/`) |
| Books | `books.html` |
| Authors | `authors.html` |
| About | `about.html` |
| Author profile | `authors-dan-herbatschek.html` |

- **Dark / light toggle** is top-right in the nav.
- Use **Chrome** — the homepage hero books physically rotate to face-you on hover. (Safari can't play the
  transparent video format and falls back to a static cover — no animation, but the rest looks identical.)

## Notes / known placeholders
- Dan's **author-profile photo** is an empty frame, awaiting his hi-res portrait.
- The homepage/authors portrait is an upscaled stand-in (a sharper original is still coming from Dan).
- Fonts and book-cover images load from the web (Google Fonts + the live site's CDN), so **keep internet on**.
- Footer links like *Submissions / Booksellers / Privacy* are placeholders and won't go anywhere yet.
