import {json} from '@codemirror/lang-json';
import {python} from '@codemirror/lang-python';

import type {CodebridgeConfig} from '@code-dot-org/codebridge';

// File types Python Lab lets the user create/edit.
const EDITABLE_FILE_TYPES = ['py', 'csv', 'txt', 'json'];

/**
 * The Codebridge configuration for Python Lab. `languageMapping` tags new files
 * by extension; `languageExtensions` supplies the CodeMirror syntax support for
 * the editor, keyed by the same language identifier. (The language packages are
 * Python-specific, which is why they live here rather than in the generic shell.)
 */
export const pythonConfig: CodebridgeConfig = {
  editableFileTypes: EDITABLE_FILE_TYPES,
  supportedFileTypes: EDITABLE_FILE_TYPES,
  languageMapping: {
    py: 'python',
    json: 'json',
  },
  languageExtensions: {
    python: python(),
    json: json(),
  },
};
