import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';

import type {CodebridgeConfig} from '@code-dot-org/codebridge';

/**
 * World Lab's Codebridge configuration. A World project is a web-based Phaser 4
 * game world: a page that hosts the game plus the JavaScript that drives it.
 *
 * This is a deliberately small starting set — HTML / JS / JSON / MD / TXT. New
 * editors and file types (the ones this lab is being built to add) get wired in
 * here as they land: extend `editableFileTypes` / `supportedFileTypes` and add
 * the matching `languageMapping` / `languageExtensions` entry.
 */
export const WORLD_EDITABLE_FILE_TYPES = ['html', 'js', 'json', 'md', 'txt'];

export const worldConfig: Partial<CodebridgeConfig> = {
  editableFileTypes: WORLD_EDITABLE_FILE_TYPES,
  supportedFileTypes: [...WORLD_EDITABLE_FILE_TYPES],
  languageMapping: {
    html: 'html',
    js: 'javascript',
    json: 'json',
    md: 'markdown',
  },
  languageExtensions: {
    html: html(),
    javascript: javascript(),
    json: json(),
    markdown: markdown(),
  },
};
