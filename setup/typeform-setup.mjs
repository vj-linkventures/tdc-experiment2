#!/usr/bin/env node
/**
 * Creates (or updates) the Typeform that collects interest-form submissions,
 * with hidden fields whose names match TYPEFORM_FIELDS in index.html.
 *
 *   TYPEFORM_SECRET=tfp_xxx node setup/typeform-setup.mjs
 *   TYPEFORM_SECRET=tfp_xxx node setup/typeform-setup.mjs --form-id AbCd1234   # update in place
 *   TYPEFORM_SECRET=tfp_xxx node setup/typeform-setup.mjs --list               # show your forms + IDs
 *
 * Why this exists: Typeform has no API for submitting a response, so index.html
 * validates the answers and hands off to this form with everything preloaded
 * into hidden fields. The respondent's confirmation on the last screen is what
 * actually writes the response. Hidden fields only work if they are declared on
 * the form itself — that is what this script sets up.
 *
 * The token is read from the environment and never written to disk. Keep it out
 * of index.html: anything in that file is public the moment the site deploys.
 */

const API = 'https://api.typeform.com';
const TOKEN = process.env.TYPEFORM_SECRET || process.env.TYPEFORM_TOKEN;

const HIDDEN_FIELDS = ['name', 'email', 'class_year', 'interest', 'linkedin', 'notes'];
const FORM_TITLE = 'Claude-TDC-Typeform';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : (process.argv[i + 1] ?? true);
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${path} → ${res.status}\n${text}`);
  }
  return text ? JSON.parse(text) : null;
}

/** The form the handoff lands on: a short confirmation, plus the mentor upload. */
function formDefinition() {
  return {
    title: FORM_TITLE,
    type: 'form',
    settings: {
      is_public: true,
      progress_bar: 'proportion',
      show_progress_bar: false,
    },
    hidden: HIDDEN_FIELDS,
    welcome_screens: [
      {
        ref: 'welcome',
        title: 'One last step',
        properties: {
          description:
            "Your answers came over from the site. Confirm below — and if you're offering to mentor, attach a resume, bio or deck so we can summarize what you could advise on.",
          show_button: true,
          button_text: 'Confirm',
        },
      },
    ],
    fields: [
      {
        ref: 'materials',
        title: 'Resume, bio or deck — anything that shows your work',
        type: 'file_upload',
        validations: { required: false },
        properties: {
          description:
            'Mentors only — skip this if it does not apply. You will see the AI summary we draft from it and can correct it before it is used for any introduction.',
        },
      },
      {
        ref: 'confirm_email',
        title: 'Confirm the best email to reach you',
        type: 'email',
        validations: { required: true },
        properties: {
          description: 'Prefilled from the site — correct it here if it is wrong.',
        },
      },
    ],
    thankyou_screens: [
      {
        ref: 'done',
        title: "You're on the list.",
        properties: {
          show_button: false,
          share_icons: false,
        },
      },
    ],
  };
}

function stripUndefined(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function main() {
  if (!TOKEN) {
    console.error(
      'Missing token. Run with:  TYPEFORM_SECRET=tfp_xxx node setup/typeform-setup.mjs\n' +
        'Create one at typeform.com → Settings → Personal tokens, with scopes forms:write and forms:read.'
    );
    process.exit(1);
  }

  if (arg('--list')) {
    const { items = [] } = await api('/forms?page_size=200');
    if (!items.length) return console.log('No forms on this account yet.');
    console.log('Your forms:\n');
    for (const f of items) console.log(`  ${f.id}   ${f.title}`);
    console.log('\nThe ID is what goes in TYPEFORM_ID in index.html.');
    return;
  }

  const definition = stripUndefined(formDefinition());
  const formId = arg('--form-id');

  const form = formId
    ? await api(`/forms/${formId}`, { method: 'PUT', body: JSON.stringify(definition) })
    : await api('/forms', { method: 'POST', body: JSON.stringify(definition) });

  const id = form.id;
  const link = form._links?.display || `https://form.typeform.com/to/${id}`;

  console.log(`\n${formId ? 'Updated' : 'Created'}: ${form.title}`);
  console.log(`Form ID:  ${id}`);
  console.log(`Live at:  ${link}`);
  console.log(`Hidden fields: ${HIDDEN_FIELDS.join(', ')}`);
  console.log(`\nNext: set  const TYPEFORM_ID = '${id}';  in index.html, then commit.`);
  console.log('Test the handoff with:');
  console.log(`  ${link}?name=Test&email=test%40example.com&interest=mentoring\n`);
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
