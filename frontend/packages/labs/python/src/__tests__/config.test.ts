import {describe, expect, it} from 'vitest';

import {pythonConfig} from '../config';

describe('pythonConfig', () => {
  it('maps the python and json extensions to language identifiers', () => {
    expect(pythonConfig.languageMapping.py).toBe('python');
    expect(pythonConfig.languageMapping.json).toBe('json');
  });

  it('allows editing python, json, csv, and txt files', () => {
    expect(pythonConfig.editableFileTypes).toEqual(
      expect.arrayContaining(['py', 'json', 'csv', 'txt']),
    );
  });

  it('provides CodeMirror language support for python and json', () => {
    expect(pythonConfig.languageExtensions?.python).toBeDefined();
    expect(pythonConfig.languageExtensions?.json).toBeDefined();
  });
});
