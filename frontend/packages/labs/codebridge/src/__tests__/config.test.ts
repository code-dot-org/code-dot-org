import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import type {CodebridgeConfig} from '../config';
import {
  DEFAULT_CODEBRIDGE_CONFIG,
  languageForFileName,
  validateFileName,
  validateFolderName,
} from '../config';

const config: CodebridgeConfig = {
  editableFileTypes: ['py'],
  supportedFileTypes: ['py', 'csv'],
  languageMapping: {py: 'python', json: 'json'},
};

const source: MultiFileSource = {
  folders: {'5': {id: '5', name: 'sub', parentId: '0'}},
  files: {
    '1': {
      id: '1',
      name: 'main.py',
      language: 'python',
      contents: '',
      folderId: '0',
    },
  },
};

describe('languageForFileName', () => {
  it('maps a known extension to its language', () => {
    expect(languageForFileName(config, 'a.py')).toBe('python');
  });
  it('falls back to the raw extension when unmapped', () => {
    expect(languageForFileName(config, 'a.md')).toBe('md');
  });
});

describe('validateFileName', () => {
  it('accepts a valid, unique, editable name', () => {
    expect(validateFileName(config, source, '0', 'other.py')).toBeUndefined();
  });
  it('rejects an empty name', () => {
    expect(validateFileName(config, source, '0', '  ')).toMatch(
      /enter a file name/i,
    );
  });
  it('rejects a disallowed extension', () => {
    expect(validateFileName(config, source, '0', 'notes.txt')).toMatch(
      /must end in/i,
    );
  });
  it('rejects a duplicate in the same folder', () => {
    expect(validateFileName(config, source, '0', 'main.py')).toMatch(
      /already exists/i,
    );
  });
  it('allows renaming a file to its own name (excludeId)', () => {
    expect(
      validateFileName(config, source, '0', 'main.py', '1'),
    ).toBeUndefined();
  });
  it('is unrestricted on extension when editableFileTypes is empty', () => {
    expect(
      validateFileName(DEFAULT_CODEBRIDGE_CONFIG, source, '0', 'anything.xyz'),
    ).toBeUndefined();
  });
});

describe('validateFolderName', () => {
  it('rejects a duplicate sibling folder', () => {
    expect(validateFolderName(source, '0', 'sub')).toMatch(/already exists/i);
  });
  it('accepts a unique folder name', () => {
    expect(validateFolderName(source, '0', 'lib')).toBeUndefined();
  });
});
