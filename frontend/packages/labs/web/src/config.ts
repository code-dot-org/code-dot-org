import {css} from '@codemirror/lang-css';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';

import type {CodebridgeConfig} from '@code-dot-org/codebridge';

/**
 * Web Lab's Codebridge configuration. Ported from
 * apps/src/weblab2/constants.ts (WEBLAB2_EDITABLE_FILE_TYPES /
 * WEBLAB2_SUPPORTED_FILE_TYPES) and Weblab2View's `weblab2LangMapping`.
 *
 * The image types legacy derives from `SafeAndSupportedImageTypes` are listed
 * here directly — that generated constant is a dashboard artifact this package
 * does not depend on. Uploading images is deferred, so these only affect which
 * files the browser will show and treat as non-editable.
 */
const IMAGE_FILE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'];

export const WEB_EDITABLE_FILE_TYPES = [
  'html',
  'css',
  'js',
  'md',
  'txt',
  'csv',
  'json',
];

export const webConfig: Partial<CodebridgeConfig> = {
  editableFileTypes: WEB_EDITABLE_FILE_TYPES,
  supportedFileTypes: [...WEB_EDITABLE_FILE_TYPES, ...IMAGE_FILE_TYPES],
  languageMapping: {
    html: 'html',
    css: 'css',
    js: 'javascript',
    md: 'markdown',
    json: 'json',
  },
  languageExtensions: {
    html: html(),
    css: css(),
    javascript: javascript(),
    markdown: markdown(),
    json: json(),
  },
};
