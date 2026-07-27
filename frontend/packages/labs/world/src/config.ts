import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';

import type {CodebridgeConfig} from '@code-dot-org/codebridge';

/**
 * World Lab's Codebridge configuration. A World project is the game defined by
 * its `scenes` / `worlds` / `actors` / `rules` — code, not a web page. There is
 * no editable `index.html`: the preview sandbox serves a fixed host shell and
 * imports the compiled bundle (SANDBOX.md, PLAN §6).
 *
 * The editable set is therefore code — JS/TS/JSON plus notes (MD/TXT). Images
 * (`png`) are supported (shown in the tree, handed to the game) but not edited.
 * New editors and file types (`.rule`, `.anim`, …) get wired in here as they
 * land: extend the lists and add the matching language mapping/extension.
 */
export const WORLD_EDITABLE_FILE_TYPES = ['js', 'ts', 'json', 'md', 'txt'];
const IMAGE_FILE_TYPES = ['png'];

export const worldConfig: Partial<CodebridgeConfig> = {
  editableFileTypes: WORLD_EDITABLE_FILE_TYPES,
  supportedFileTypes: [...WORLD_EDITABLE_FILE_TYPES, ...IMAGE_FILE_TYPES],
  languageMapping: {
    js: 'javascript',
    ts: 'javascript',
    json: 'json',
    md: 'markdown',
  },
  languageExtensions: {
    javascript: javascript(),
    json: json(),
    markdown: markdown(),
  },
};
