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
   It captures intent, not money. Checking **Mentoring new startups** reveals a panel asking
   for a LinkedIn URL and any resume/bio/deck, so those can be run through an AI summarizer to
   draft what each person could advise on. The panel says plainly that the summary goes back to
   them to correct before it's used for an introduction — worth keeping if you rewrite the copy,
   since people are handing over a resume on the strength of it.

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

## Before launch — what to set

Everything lives in one `CONFIG` block at the top of the `<script>` in `index.html`:

| Constant | What it does | Empty / default behavior |
| --- | --- | --- |
| `LETTER_URL` | Hosted copy of the emailed letter | "Read the letter" link hides itself |
| `FORM_ENDPOINT` | URL the interest form posts to (Formspree, Basin, an Apps Script web app, your own handler) | falls back to `MAILTO_FALLBACK` |
| `MAILTO_FALLBACK` | Address that receives prefilled submissions if there's no endpoint | form shows a "not connected yet" notice |
| `ACCEPTS_UPLOADS` | Whether `FORM_ENDPOINT` can take file uploads | `true` |
| `MAX_FILES` / `MAX_UPLOAD_MB` | Client-side caps on mentor materials | 5 files, 15 MB total |

### How submissions are sent

- **No files attached** → JSON POST to `FORM_ENDPOINT`.
- **Files attached** → the same URL, but as a `multipart/form-data` POST with the files under
  the field name `files`. Your endpoint has to accept uploads; if it doesn't, set
  `ACCEPTS_UPLOADS = false` and submissions stay JSON with the filenames listed under
  `attachments` instead, so you know what to ask for by email.
- **No endpoint at all** → the `MAILTO_FALLBACK` draft. A web page can't attach files to a
  mail client, so the draft ends with a line naming the files and asking the sender to attach
  them. Anyone serious about collecting resumes should set a real endpoint.

Over the file caps, the drop zone turns red, names the overage, and submit is blocked until
it's fixed. A LinkedIn URL typed without a scheme (`linkedin.com/in/…`) is normalized to
`https://` before it's sent.

**The video** is set on the `#videoFrame` element in the markup, not in the config block:

- Hosted embed: `data-embed="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0"`
- Self-hosted file: `data-src="media/recharge.mp4"` plus optional `data-poster="media/poster.jpg"`

Both empty leaves a branded placeholder frame with a "Film — placeholder" badge. Nothing is
embedded until the visitor clicks play, so no third-party player loads on page view.

## Notes

- Single self-contained `index.html`; no build step, no dependencies. Drop it on GitHub Pages
  (Settings → Pages → deploy from `main` / root) or any static host.
- Verified rendering at 1280px and 390px, no horizontal overflow. Exercised in Chromium: form
  validation, the mentor panel's reveal/hide, the oversize-file guard, the multipart upload
  (confirmed both files and the normalized LinkedIn URL reach the endpoint), the JSON path, and
  the no-endpoint notice.
- Honors `prefers-reduced-motion`, and a `<noscript>` rule keeps every section visible if
  JavaScript is off.
- Unlike experiment1, this page makes **no factual claims** — no founding year, no dollar
  figures, no named alumni — so nothing needs fact-checking before it goes public. The only
  date on the page is the Sept 21, 2026 update entry.
