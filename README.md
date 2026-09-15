# tdc-experiment2 — "Re-charge the Charge" teaser site

A fork of `tdc-experiment1`, restructured into a **minimalist teaser site** whose job is to
drum up interest in contributing to the recharge of the TDC house.

Where experiment1 is a nine-scene interactive walkthrough with a pledge meter, this one is a
single quiet scrolling page with four parts:

1. **Hero + film** — the video carries the whole storyline; the copy around it just frames it.
2. **Updates** — a timeline, opening with the site going live and a link to the emailed letter
   (~Sept 21, 2026), followed by a "coming soon" roll-up of what gets published next.
3. **FAQ** — accordion. **All Q&A is deliberately fake placeholder copy**, sitting in the real
   layout so the section can be reviewed and swapped one-for-one later.
4. **Interest form** — donations / volunteering / mentoring new startups / updates-only.
   It captures intent, not money.

## Branding

Theta Delta Chi's black, white and blue, echoing the Theta Deuteron Charge crest imagery:

| Token | Value | Use |
| --- | --- | --- |
| `--black` | `#06080d` | page base |
| `--blue` | `#1b4fa0` | charge blue — borders, primary button |
| `--blue-bright` | `#4c86d9` | interactive accents, crest outline |
| `--blue-light` | `#9fc3f0` | eyebrows, small type |
| `--white` | `#f2f5fa` | body text |

Branding touches: an inline SVG shield crest carrying **ΘΔΧ** and a small bolt (reused in the
header and footer and as the favicon), an oversized ΘΔΧ watermark behind the hero, and one
"charge rule" divider with a pulse that travels along it. Headline face is Fraunces, with IBM
Plex Sans/Mono for body and labels.

## Before launch — the three things to set

All three live in one `CONFIG` block at the top of the `<script>` in `index.html`:

| Constant | What it does | Empty behavior |
| --- | --- | --- |
| `LETTER_URL` | Hosted copy of the emailed letter | "Read the letter" link hides itself |
| `FORM_ENDPOINT` | URL the interest form JSON-POSTs to (Formspree, Basin, an Apps Script web app, your own handler) | falls back to `MAILTO_FALLBACK` |
| `MAILTO_FALLBACK` | Address that receives prefilled submissions if there's no endpoint | form shows a "not connected yet" notice |

**The video** is set on the `#videoFrame` element in the markup, not in the config block:

- Hosted embed: `data-embed="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0"`
- Self-hosted file: `data-src="media/recharge.mp4"` plus optional `data-poster="media/poster.jpg"`

Both empty leaves a branded placeholder frame with a "Film — placeholder" badge. Nothing is
embedded until the visitor clicks play, so no third-party player loads on page view.

## Notes

- Single self-contained `index.html`; no build step, no dependencies. Drop it on GitHub Pages
  (Settings → Pages → deploy from `main` / root) or any static host.
- Verified rendering at 1280px and 390px, no horizontal overflow, with the form's validation
  and fallback paths exercised in Chromium.
- Honors `prefers-reduced-motion`, and a `<noscript>` rule keeps every section visible if
  JavaScript is off.
- Unlike experiment1, this page makes **no factual claims** — no founding year, no dollar
  figures, no named alumni — so nothing needs fact-checking before it goes public. The only
  date on the page is the Sept 21, 2026 update entry.
