import {buildWidgetDocument} from './widgetChrome';

const CSS = `
  body { padding: 12px 16px; }
  #row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  #title {
    margin: 0 0 4px;
    font-size: 14px;
  }
  #body {
    margin: 0;
    color: #3e4952;
    white-space: pre-wrap;
  }
  #body:empty { display: none; }
  #feedback {
    display: none;
    margin-top: 8px;
    padding: 6px 10px;
    border-left: 3px solid;
    border-radius: 0 4px 4px 0;
    white-space: pre-wrap;
  }
  #feedback.validation {
    display: block;
    border-color: #2e7d32;
    background: #e8f5e9;
    color: #1e4620;
  }
  #feedback.suggestion {
    display: block;
    border-color: #0093a4;
    background: #e6f4f6;
    color: #005560;
  }
  #feedback.correction {
    display: block;
    border-color: #b45309;
    background: #fff4e5;
    color: #7c3a02;
  }
  #controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    font-size: 12px;
    color: #56626b;
  }
  #grade {
    padding: 4px 8px;
    border: 1px solid #d8dbdd;
    border-radius: 4px;
    font-size: 12px;
    background: #fff;
  }
  #status { min-width: 70px; }
`;

const BODY = `
<div id="row">
  <div>
    <h2 id="title"></h2>
    <p id="body"></p>
    <div id="feedback" role="status"></div>
  </div>
  <div id="controls">
    <span id="status" aria-live="polite"></span>
    <label>Grade
      <select id="grade" aria-label="Grade level">
        <option value="grade 3">3</option>
        <option value="grade 4">4</option>
        <option value="grade 5" selected>5</option>
        <option value="grade 6">6</option>
        <option value="grade 7">7</option>
        <option value="grade 8">8</option>
        <option value="high school">HS</option>
      </select>
    </label>
  </div>
</div>
`;

const FEEDBACK_PREFIX = {
  validation: '✓ ',
  suggestion: '💡 ',
  correction: '⚠ ',
};

const JS = String.raw`
(function () {
  'use strict';
  // Must match DEFAULT_INSTRUCTIONS_GRADE on the server: canonical text is
  // written at this level, so selecting it skips the relevel round trip.
  const DEFAULT_GRADE = 'grade 5';
  const FEEDBACK_PREFIX = ${JSON.stringify(FEEDBACK_PREFIX)};

  const titleEl = document.getElementById('title');
  const bodyEl = document.getElementById('body');
  const feedbackEl = document.getElementById('feedback');
  const gradeEl = document.getElementById('grade');
  const statusEl = document.getElementById('status');

  // The server is the source of truth: every panel tool returns the full
  // panel state as structuredContent, and this view only renders it. The
  // canonical copy is kept for instant display at the default grade.
  let canonical = null;

  function render(state) {
    titleEl.textContent = state.title || '';
    bodyEl.textContent = state.body || '';
    if (state.feedback && state.feedback.text) {
      feedbackEl.className = state.feedback.kind;
      feedbackEl.textContent =
        (FEEDBACK_PREFIX[state.feedback.kind] || '') + state.feedback.text;
    } else {
      feedbackEl.className = '';
      feedbackEl.textContent = '';
    }
    McpApp.reportSize();
  }

  // Releveling is the plugin's own capability: a tools/call to this
  // widget's server, which rewrites the stored canonical panel. The tutor
  // model is not involved.
  async function applyGrade() {
    if (!canonical) {
      return;
    }
    const grade = gradeEl.value;
    if (grade === DEFAULT_GRADE) {
      statusEl.textContent = '';
      render(canonical);
      return;
    }
    statusEl.textContent = 'Adjusting…';
    try {
      const result = await McpApp.callTool('relevel_instructions', {
        grade: grade,
      });
      render((result && result.structuredContent) || canonical);
      statusEl.textContent = '';
    } catch (e) {
      render(canonical);
      statusEl.textContent = 'Could not adjust';
    }
  }

  gradeEl.addEventListener('change', () => {
    applyGrade();
    // The tutor should adapt the rest of the lesson too, so the grade
    // change also goes to the model — as a widget event, like any other
    // student interaction.
    McpApp.updateModelContext({
      content: [
        {
          type: 'text',
          text: 'The student set their grade level to ' + gradeEl.value + '.',
        },
      ],
      structuredContent: {
        type: 'grade_level_changed',
        grade: gradeEl.value,
      },
    });
  });

  // set_instructions and set_feedback both land here, each carrying the
  // complete panel state.
  McpApp.on('toolResult', result => {
    if (result && result.structuredContent) {
      canonical = result.structuredContent;
      // New canonical text still honors a previously selected grade.
      applyGrade();
    }
  });

  McpApp.connect();
})();
`;

export function buildInstructionsWidgetHtml(): string {
  return buildWidgetDocument({
    title: 'Instructions',
    css: CSS,
    bodyHtml: BODY,
    js: JS,
  });
}
