import {buildWidgetDocument} from './widgetChrome';

const CSS = `
  #instructions {
    margin: 0 0 12px;
    padding: 8px 12px;
    background: #f3f7f8;
    border-radius: 4px;
    white-space: pre-wrap;
  }
  #editor {
    width: 100%;
    min-height: 160px;
    padding: 8px;
    border: 1px solid #d8dbdd;
    border-radius: 4px;
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 13px;
    line-height: 1.5;
    resize: vertical;
    tab-size: 2;
  }
  #editor:focus { outline: 2px solid #0093a4; }
  #toolbar { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
  #output {
    margin-top: 8px;
    padding: 8px 12px;
    min-height: 24px;
    background: #292f36;
    color: #e7e9ea;
    border-radius: 4px;
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 13px;
    white-space: pre-wrap;
  }
  #output.error { color: #ffb0a1; }
  #output:empty { display: none; }
`;

const BODY = `
<h2>Code it</h2>
<div id="instructions"></div>
<textarea id="editor" spellcheck="false" aria-label="Code editor"></textarea>
<div id="toolbar">
  <button id="run" class="primary">&#9654; Run</button>
  <span id="note" class="sent-note"></span>
</div>
<pre id="output"></pre>
`;

const JS = String.raw`
(function () {
  'use strict';
  const instructionsEl = document.getElementById('instructions');
  const editorEl = document.getElementById('editor');
  const runEl = document.getElementById('run');
  const outputEl = document.getElementById('output');
  const noteEl = document.getElementById('note');

  // The sandboxed iframe is the isolation boundary: the code can't reach the
  // host page, cookies, or the network (CSP). It does share the tab's event
  // loop, so an infinite loop hangs the tab until reload — acceptable for a
  // demo; a worker with a timeout is the production answer.
  function runStudentCode(code) {
    const logs = [];
    function format(value) {
      if (typeof value === 'string') {
        return value;
      }
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    const fakeConsole = {
      log: function () {
        logs.push(Array.prototype.map.call(arguments, format).join(' '));
      },
    };
    fakeConsole.info = fakeConsole.warn = fakeConsole.error = fakeConsole.log;
    let error = null;
    let returned;
    try {
      returned = new Function('console', '"use strict";\n' + code)(fakeConsole);
    } catch (e) {
      error = String(e);
    }
    return {logs: logs, error: error, returned: returned};
  }

  editorEl.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorEl.selectionStart;
      editorEl.setRangeText('  ', start, editorEl.selectionEnd, 'end');
    }
  });

  runEl.addEventListener('click', () => {
    const code = editorEl.value;
    const result = runStudentCode(code);
    const consoleOutput = result.logs.join('\n');
    if (result.error) {
      outputEl.textContent = result.error;
      outputEl.className = 'error';
    } else {
      outputEl.textContent =
        consoleOutput || '(no output — try console.log)';
      outputEl.className = '';
    }
    McpApp.reportSize();
    // Only Run is a "major interaction". Keystrokes stay local so the tutor
    // isn't spammed with half-typed code.
    McpApp.updateModelContext({
      content: [
        {
          type: 'text',
          text: result.error
            ? 'The student ran their code and got an error.'
            : 'The student ran their code.',
        },
      ],
      structuredContent: {
        type: 'code_run',
        code: code,
        consoleOutput: consoleOutput,
        error: result.error,
        returnedValue:
          result.returned === undefined ? null : String(result.returned),
      },
    });
    noteEl.textContent = 'Run result sent to your tutor.';
  });

  McpApp.on('toolInput', input => {
    instructionsEl.textContent = input.instructions || '';
    editorEl.value = input.starterCode || '';
    outputEl.textContent = '';
    noteEl.textContent = '';
  });

  McpApp.connect();
})();
`;

export function buildCodeWidgetHtml(): string {
  return buildWidgetDocument({
    title: 'Code exercise',
    css: CSS,
    bodyHtml: BODY,
    js: JS,
    // Student code runs via new Function inside this widget's sandbox.
    allowEval: true,
  });
}
