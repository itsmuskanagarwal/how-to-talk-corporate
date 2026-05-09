import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: [
    'https://*.slack.com/*',
    'https://mail.google.com/*',
    'https://*.atlassian.net/*',
    'https://teams.microsoft.com/*',
    'https://*.linkedin.com/*',
  ],
  run_at: 'document_idle',
};

/** Selectors for known message-composition text fields per platform. */
const FIELD_SELECTORS = [
  'div[role="textbox"][contenteditable="true"]', // Slack, Teams, Gmail compose
  'textarea#comment-form-field', // Jira comment
  'textarea[aria-label*="comment"]', // Jira / Linear comment
  'textarea[aria-label*="message"]', // LinkedIn DM
  'div[data-artdecor-textarea]', // LinkedIn
  'div[role="textbox"][aria-label*="message"]', // LinkedIn fallback
];

let button: HTMLButtonElement | null = null;
let activeField: HTMLElement | null = null;

function createButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = 'TW';
  btn.title = 'How to Talk Corporate — rewrite this message';
  Object.assign(btn.style, {
    position: 'absolute',
    zIndex: '9999',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid #e4e0d8',
    background: '#fff',
    color: '#c84b1e',
    fontFamily: '"Fraunces", serif',
    fontSize: '11px',
    fontWeight: '900',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
    transition: 'opacity 0.15s',
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.opacity = '1';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.opacity = '0.7';
  });
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openOverlay(activeField);
    btn.style.display = 'none';
  });
  return btn;
}

function positionButton(field: HTMLElement) {
  if (!button || !field.parentElement) return;
  const rect = field.getBoundingClientRect();
  button.style.top = `${window.scrollY + rect.top + 4}px`;
  button.style.left = `${window.scrollX + rect.right - 34}px`;
}

function findActiveTextfield(): HTMLElement | null {
  for (const sel of FIELD_SELECTORS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el && isVisible(el)) return el;
  }
  return null;
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function openOverlay(field: HTMLElement | null) {
  const fieldText = field?.textContent ?? '';
  window.dispatchEvent(new CustomEvent('tonewise:open-overlay', { detail: { text: fieldText } }));
}

function handleFocus() {
  const field = findActiveTextfield();
  if (!field) {
    hideButton();
    return;
  }
  activeField = field;
  positionButton(field);
  if (button) button.style.display = 'flex';
}

function handleBlur() {
  setTimeout(() => {
    if (
      button &&
      document.activeElement !== button &&
      !document.activeElement?.closest?.('#tonewise-overlay-root')
    ) {
      hideButton();
    }
  }, 200);
}

function hideButton() {
  if (button) button.style.display = 'none';
  activeField = null;
}

// Setup
if (typeof document !== 'undefined') {
  button = createButton();
  document.body.appendChild(button);

  document.addEventListener('focusin', handleFocus);
  document.addEventListener('focusout', handleBlur);
  window.addEventListener('scroll', () => {
    if (activeField) positionButton(activeField);
  });
}
