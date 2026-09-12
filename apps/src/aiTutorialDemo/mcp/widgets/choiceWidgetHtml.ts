import {buildWidgetDocument} from './widgetChrome';

const CSS = `
  .brand { color: #be185d; }
  ul { list-style: none; margin: 0 0 12px; padding: 0; }
  li { margin: 4px 0; }
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid #d8dbdd;
    border-radius: 4px;
    cursor: pointer;
  }
  label:hover { background: #f3f7f8; }
  label.selected { border-color: #0093a4; background: #e6f4f6; }
`;

const BODY = `
<div class="widget-header">
  <h2 id="question"></h2>
  <span class="brand">Multiple Choice, LLC</span>
</div>
<ul id="choices"></ul>
<button id="submit" class="primary" disabled>Submit answer</button>
<div id="note" class="sent-note"></div>
`;

const JS = String.raw`
(function () {
  'use strict';
  const state = {question: '', choices: [], selected: -1};

  const questionEl = document.getElementById('question');
  const choicesEl = document.getElementById('choices');
  const submitEl = document.getElementById('submit');
  const noteEl = document.getElementById('note');

  function render() {
    questionEl.textContent = state.question;
    choicesEl.textContent = '';
    state.choices.forEach((choice, i) => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      if (i === state.selected) {
        label.className = 'selected';
      }
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'choice';
      input.checked = i === state.selected;
      input.addEventListener('change', () => {
        state.selected = i;
        render();
      });
      const span = document.createElement('span');
      span.textContent = choice;
      label.appendChild(input);
      label.appendChild(span);
      li.appendChild(label);
      choicesEl.appendChild(li);
    });
    submitEl.disabled = state.selected < 0;
  }

  submitEl.addEventListener('click', () => {
    const selectedText = state.choices[state.selected];
    // Resubmitting after changing the selection is allowed on purpose: each
    // submit is one event to the tutor, and second thoughts are part of
    // learning.
    McpApp.updateModelContext({
      content: [
        {
          type: 'text',
          text: 'The student answered "' + selectedText + '".',
        },
      ],
      structuredContent: {
        type: 'choice_submitted',
        question: state.question,
        selectedIndex: state.selected,
        selectedText: selectedText,
      },
    });
    noteEl.textContent = 'Answer sent to your tutor.';
  });

  McpApp.on('toolInput', input => {
    state.question = input.question || '';
    state.choices = Array.isArray(input.choices) ? input.choices : [];
    state.selected = -1;
    noteEl.textContent = '';
    render();
  });

  McpApp.connect();
})();
`;

export function buildChoiceWidgetHtml(): string {
  return buildWidgetDocument({
    title: 'Multiple choice',
    css: CSS,
    bodyHtml: BODY,
    js: JS,
  });
}
