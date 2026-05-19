/**
 * In-page editor for the lesson show page. See
 * openspec/changes/easy-lesson-editor/.
 *
 * Activated by a toggle on the lesson show page. While active, clicking any
 * element marked with data-editable-field replaces that element's contents
 * with a textarea bound to the field's raw stored source. On blur, if the
 * value changed, the controller PATCHes the field-scoped endpoint, then
 * re-renders the saved value in place. No full-page reload.
 *
 * This module is dynamically imported so its weight (including
 * EnhancedSafeMarkdown) does not load for non-levelbuilders.
 */
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {
  getAuthenticityToken,
  AUTHENTICITY_TOKEN_HEADER,
} from '@cdo/apps/util/AuthenticityTokenStore';

// Fields the server preprocesses through MarkdownPreprocessor. Mirrors
// Services::LessonInlineEditing::MARKDOWN_RENDERED_FIELDS on the server. After
// save, these get re-rendered through EnhancedSafeMarkdown; non-markdown
// fields are written back as plain text.
const MARKDOWN_RENDERED = new Set([
  'Lesson:overview',
  'Lesson:purpose',
  'Lesson:preparation',
  'Lesson:assessment_opportunities',
  'ActivitySection:description',
]);

const SELECTOR = '[data-editable-field]';
const ACTIVE_CLASS = 'lesson-inline-editing-active';
const HOVER_STYLE_ID = 'lesson-inline-editing-style';

let active = false;
let lessonId = null;
let clickHandler = null;

function parseIdentifier(id) {
  if (!id || typeof id !== 'string') return null;
  const parts = id.split(':');
  if (parts.length !== 3) return null;
  const [model, recordId, field] = parts;
  if (!model || !field || !/^\d+$/.test(recordId)) return null;
  return {model, recordId, field};
}

async function fetchRawValue({model, recordId, field}) {
  const url =
    `/lessons/${lessonId}/inline_field?model=${encodeURIComponent(model)}` +
    `&record_id=${encodeURIComponent(recordId)}&field=${encodeURIComponent(
      field
    )}`;
  const res = await fetch(url, {credentials: 'include'});
  if (!res.ok) throw new Error(`load failed (${res.status})`);
  const body = await res.json();
  return body.value || '';
}

async function saveField({model, recordId, field, value}) {
  const token = await getAuthenticityToken();
  const url = `/lessons/${lessonId}/inline_field`;
  const res = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [AUTHENTICITY_TOKEN_HEADER]: token,
    },
    body: JSON.stringify({model, record_id: recordId, field, value}),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `save failed (${res.status})`);
  }
  return body;
}

function unmountAnyRoot(target) {
  if (target.__inlineEditingRoot) {
    target.__inlineEditingRoot.unmount();
    target.__inlineEditingRoot = null;
  }
}

function renderSaved(target, model, field, response) {
  // Unmount any prior React root attached during a previous save.
  unmountAnyRoot(target);
  target.innerHTML = '';

  if (MARKDOWN_RENDERED.has(`${model}:${field}`)) {
    const root = createRoot(target);
    // Wrap in the same Redux store the rest of the page uses;
    // EnhancedSafeMarkdown → ExpandableImagesWrapper needs it.
    root.render(
      <Provider store={getStore()}>
        <EnhancedSafeMarkdown
          markdown={response.rendered_source}
          expandableImages
        />
      </Provider>
    );
    target.__inlineEditingRoot = root;
  } else {
    target.textContent = response.value;
  }

  flashSavedIndicator(target);
}

function flashSavedIndicator(target) {
  const indicator = document.createElement('span');
  indicator.textContent = 'Saved';
  indicator.style.cssText =
    'background:#2c7;color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;margin-left:6px;display:inline-block;vertical-align:middle;';
  target.appendChild(indicator);
  setTimeout(() => indicator.remove(), 1500);
}

function buildTextarea(initialValue) {
  const textarea = document.createElement('textarea');
  textarea.value = initialValue;
  textarea.style.cssText =
    'width:100%;min-height:6em;box-sizing:border-box;font-family:monospace;font-size:13px;padding:6px;';
  textarea.rows = Math.max(4, initialValue.split('\n').length + 1);
  return textarea;
}

async function openEditor(target) {
  const id = target.getAttribute('data-editable-field');
  const triple = parseIdentifier(id);
  if (!triple) return;

  // Snapshot the current rendered HTML as a detached string so we can restore
  // it if the user blurs without changes. Critically, do this BEFORE unmounting
  // any prior React root — once we unmount, React clears its DOM. The string
  // copy carries no references to React-owned nodes, so handing it back via
  // innerHTML on cancel will not collide with React's reconciler.
  const snapshot = target.innerHTML;
  unmountAnyRoot(target);

  // Show a placeholder textarea immediately so the click feels responsive.
  target.innerHTML = '';
  const textarea = buildTextarea('Loading…');
  textarea.disabled = true;
  target.appendChild(textarea);
  textarea.focus();

  let initialValue;
  try {
    initialValue = await fetchRawValue(triple);
  } catch (e) {
    restoreSnapshot(target, snapshot);
    appendErrorBelow(target, e.message);
    return;
  }

  textarea.value = initialValue;
  textarea.disabled = false;
  textarea.rows = Math.max(4, initialValue.split('\n').length + 1);
  textarea.focus();
  textarea.select();

  let saving = false;
  textarea.addEventListener('blur', async () => {
    if (saving) return;
    saving = true;

    const newValue = textarea.value;
    if (newValue === initialValue) {
      restoreSnapshot(target, snapshot);
      return;
    }

    try {
      const result = await saveField({...triple, value: newValue});
      renderSaved(target, triple.model, triple.field, result);
    } catch (e) {
      saving = false;
      textarea.style.outline = '2px solid #c33';
      appendErrorBelow(target, e.message);
      textarea.focus();
    }
  });
}

function restoreSnapshot(target, snapshot) {
  unmountAnyRoot(target);
  target.innerHTML = snapshot;
}

function appendErrorBelow(target, message) {
  const div = document.createElement('div');
  div.className = 'inline-editing-error';
  div.style.cssText = 'color:#c33;font-size:12px;margin-top:4px;';
  div.textContent = `Error: ${message}`;
  target.appendChild(div);
}

function onClick(e) {
  const target = e.target.closest(SELECTOR);
  if (!target) return;
  // Already editing this region — let the textarea handle clicks itself.
  if (target.querySelector('textarea')) return;
  e.preventDefault();
  e.stopPropagation();
  openEditor(target);
}

function injectHoverStyle() {
  if (document.getElementById(HOVER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HOVER_STYLE_ID;
  style.textContent = `
    body.${ACTIVE_CLASS} ${SELECTOR} {
      outline: 1px dashed #888;
      outline-offset: 2px;
      cursor: text;
    }
    body.${ACTIVE_CLASS} ${SELECTOR}:hover {
      outline: 2px solid #4a90e2;
      background-color: rgba(74, 144, 226, 0.05);
    }
  `;
  document.head.appendChild(style);
}

export function enable(currentLessonId) {
  if (active) return;
  active = true;
  lessonId = currentLessonId;
  injectHoverStyle();
  document.body.classList.add(ACTIVE_CLASS);
  clickHandler = onClick;
  document.addEventListener('click', clickHandler, true);
}

export function disable() {
  if (!active) return;
  active = false;
  document.body.classList.remove(ACTIVE_CLASS);
  if (clickHandler) {
    document.removeEventListener('click', clickHandler, true);
    clickHandler = null;
  }
}

// Exported for unit testing.
export const __TEST_ONLY__ = {parseIdentifier, MARKDOWN_RENDERED};
