import {buildWidgetDocument} from './widgetChrome';

const CSS = `
  body { padding: 12px 16px; }
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
`;

const BODY = `
<h2 id="title"></h2>
<p id="body"></p>
`;

const JS = String.raw`
(function () {
  'use strict';
  const titleEl = document.getElementById('title');
  const bodyEl = document.getElementById('body');

  McpApp.on('toolInput', input => {
    titleEl.textContent = input.title || '';
    bodyEl.textContent = input.body || '';
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
