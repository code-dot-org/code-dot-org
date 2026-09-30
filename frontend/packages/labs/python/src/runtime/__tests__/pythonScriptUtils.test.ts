import {describe, expect, it} from 'vitest';

import {getDeleteCachedUserModulesCode} from '../pythonScriptUtils';

describe('getDeleteCachedUserModulesCode', () => {
  it('evicts every project file under its dotted module name', () => {
    const code = getDeleteCachedUserModulesCode({
      files: {
        '1': {
          id: '1',
          name: 'main.py',
          language: 'python',
          contents: '',
          folderId: '0',
        },
        '2': {
          id: '2',
          name: 'util.py',
          language: 'python',
          contents: '',
          folderId: '1',
        },
      },
      folders: {'1': {id: '1', name: 'pkg', parentId: '0'}},
    });
    expect(code).toContain('for name in ["main","pkg.util"]:');
    expect(code).toContain('sys.modules.pop(name, None)');
  });
});
