# tdc-experiment2 — "Re-charge the Charge" teaser site

A fork of `tdc-experiment1`, restructured into a **minimalist teaser site** whose job is to
drum up interest in contributing to the recharge of the TDC house.

Where experiment1 is a nine-scene interactive walkthrough with a pledge meter, this one is a
single quiet scrolling page with four parts:

1. **Hero + film** — the video carries the whole storyline; the copy around it just frames it.
2. **Updates** — a timeline, opening with the site going live and a link to the emailed letter
   (~Sept 21, 2026), followed by a "coming soon" roll-up of what gets published next.
3. **FAQ** — accordion, eleven questions, final approved copy: ownership, management, who's
   covering carrying costs, why the house is empty, the fall 2027 reopening goal, funding, and
   who to contact.
4. **Interest form** — donations / volunteering / mentoring new startups / updates-only.
   It captures intent, not money. Checking **Mentoring new startups** reveals a panel asking
   for a LinkedIn URL, and tells mentors their resume/bio/deck is attached on the following
   Typeform screen, so those can be run through an AI summarizer to
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
| `TYPEFORM_ID` | Short ID of the collecting Typeform — the code in `typeform.com/to/XXXXXXXX`, **not** the form's name | falls back to `MAILTO_FALLBACK` |
| `TYPEFORM_FIELDS` | Maps our field names to the Typeform's hidden-field names | already matches `setup/typeform-setup.mjs` |
| `MAILTO_FALLBACK` | Address that receives prefilled submissions if there's no Typeform | form shows a "not connected yet" notice |

## How the Typeform backend works

**Typeform has no API for submitting a response.** Its API creates and edits forms, reads and
deletes responses, and manages webhooks — but nothing writes a response. A response only exists
once a human completes the Typeform itself. Hidden-field prefill *displays* values; it does not
submit them, and Typeform cannot pre-answer a visible question. So a custom HTML form cannot
POST into Typeform, with or without a backend proxy.

What the page does instead:

1. The visitor fills in the form here. All validation and the conditional mentor panel run
   exactly as before — the page UI is untouched by the Typeform switch.
2. On submit, the page loads the Typeform embed SDK and opens the form **in a popup over the
   page**, passing every answer as a hidden field.
3. The visitor confirms — attaching files if they're a mentor — and that submission is what
   records the response. `onSubmit` fires, the page resets the form and shows its own
   confirmation line; closing without submitting says so rather than pretending it sent.

Details worth knowing:

- **The SDK is only fetched on first submit**, never on page view, so no third-party script
  runs for someone who just reads the page — the same rule the video player follows.
- **If the embed can't load** (blocked, offline, slow: 8s timeout) the page falls back to a
  full-page handoff to the same form with the same hidden fields, so the submission still
  lands. Both paths are exercised in the Chromium tests.
- **File uploads happen on the Typeform side**, which is why there's no in-page file picker:
  neither a URL nor a hidden field can carry a file. Typeform stores them, which also settles
  where resumes live.
- **Anyone who closes the popup without submitting is not recorded** anywhere — the page keeps
  no copy. Typeform's completion rate is the real conversion number.
- **Styling inside the popup is Typeform's**, not this page's: it's a cross-origin iframe, so
  the site's CSS cannot reach in. The setup script creates a theme in the site palette
  (`#06080D` background, `#1B4FA0` buttons, `#F2F5FA` text) to keep it from looking like a
  stranger, and skips the theme rather than failing if the account rejects it.

Hidden fields, logic rules, file-upload questions and custom fonts each depend on the
Typeform plan — check yours covers them.

### Creating the Typeform

`setup/typeform-setup.mjs` builds the form with hidden fields whose names match
`TYPEFORM_FIELDS`. Hidden fields only work when declared on the form, so run this rather than
hand-building it:

```bash
TYPEFORM_SECRET=tfp_xxx node setup/typeform-setup.mjs           # create it, prints the form ID
TYPEFORM_SECRET=tfp_xxx node setup/typeform-setup.mjs --list    # list forms and their IDs
TYPEFORM_SECRET=tfp_xxx node setup/typeform-setup.mjs --form-id AbCd1234   # update in place
```

Then set `TYPEFORM_ID` in `index.html` to the printed ID and commit.

The script builds one visible question — the optional file upload — behind a "One last step"
welcome screen. To hide that upload from non-mentors entirely, add a Logic rule on it in the
Typeform editor: skip when the hidden field `interest` does not contain `mentoring`. Left
alone, non-mentors just see an optional upload they can skip.

### About the token

The token is only ever used by that script, from a shell. **It must never go into
`index.html`** — this is a public repo serving a static site, so anything in that file is
readable by anyone, and a Typeform token can read and delete every response on the account.

A secret stored in **GitHub repository secrets is not available to a GitHub Pages site** either:
those are exposed only inside GitHub Actions runs, never to the browser. There is nothing the
page needs it for — the handoff URL is public by design, exactly like a Typeform link in an
email.

**The video** is set on the `#videoFrame` element in the markup, not in the config block:

- Hosted embed: `data-embed="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0"`
- Self-hosted file: `data-src="media/recharge.mp4"` plus optional `data-poster="media/poster.jpg"`

Both empty leaves a branded placeholder frame with a "Film — placeholder" badge. Nothing is
embedded until the visitor clicks play, so no third-party player loads on page view.

## Notes

- Single self-contained `index.html`; no build step, no dependencies. Drop it on GitHub Pages
  (Settings → Pages → deploy from `main` / root) or any static host.
- Verified rendering at 1280px and 390px, no horizontal overflow. Exercised in Chromium: form
  validation, the mentor panel's reveal/hide, the popup handoff (all six hidden fields arrive
  correctly encoded, including the normalized LinkedIn URL), submit vs. close-without-submit,
  the blocked-SDK fallback to a full-page handoff, and the no-Typeform notice.
- Honors `prefers-reduced-motion`, and a `<noscript>` rule keeps every section visible if
  JavaScript is off.
- A fixed **scroll cue** (bottom center) names the next section — Updates, FAQ, Get involved —
  and scrolls to it when clicked, so the tall dark bands don't read as the end of the page. It
  retires within 90px of the true bottom and inside the last section. Sections advertise their
  cue label via `data-cue`, so adding a section to the sequence means adding that attribute;
  the cue starts with class `gone` and is enabled by script, so it never appears empty.
- The FAQ carries real, load-bearing claims — House Corp.'s 1966 ownership, the 372 Management
  Co. arrangement, who is funding carrying costs, the fall 2027 target. That copy was supplied
  approved; treat any edit to it as a factual change, not a wording change.
- Two names appear with no contact details (Román Cepeda '97, Matt Rita '89, in the last
  question). Add emails or a link there so the closing answer is actionable.
- The only date on the page is the Sept 21, 2026 update entry.
