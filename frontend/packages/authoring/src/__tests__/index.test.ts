import {describe, expect, it} from 'vitest';

import * as api from '../index';

describe('public API', () => {
  it('exports applyChange, buildCourse, and the DSL/XML/script parsers', () => {
    expect(typeof api.applyChange).toBe('function');
    expect(typeof api.buildCourse).toBe('function');
    expect(typeof api.parseDslLevel).toBe('function');
    expect(typeof api.parseLevelXml).toBe('function');
    expect(typeof api.parseScriptJson).toBe('function');
  });
});
