import {describe, expect, it} from 'vitest';

import {resolveWorkspaceOverrideXml} from '../workspaceMode';

describe('resolveWorkspaceOverrideXml', () => {
  it('prefers the Save draft over the served value for studentStart', () => {
    expect(
      resolveWorkspaceOverrideXml(
        'studentStart',
        {},
        {studentStart: 'draft-xml'},
        {studentStart: 'served-xml'},
      ),
    ).toBe('draft-xml');
  });

  it('falls back to the served value when studentStart has no draft', () => {
    expect(
      resolveWorkspaceOverrideXml(
        'studentStart',
        {},
        {},
        {studentStart: 'served-xml'},
      ),
    ).toBe('served-xml');
  });

  it('returns undefined for studentStart with neither draft nor served content', () => {
    expect(resolveWorkspaceOverrideXml('studentStart', {}, {}, {})).toBe(
      undefined,
    );
  });

  it('prefers an in-session mySolution attempt over an already-accepted draft', () => {
    expect(
      resolveWorkspaceOverrideXml(
        'mySolution',
        {mySolution: 'attempt-xml'},
        {mySolution: 'draft-xml'},
        {mySolution: 'served-xml'},
      ),
    ).toBe('attempt-xml');
  });

  it('falls back to the accepted draft when mySolution has no in-session attempt', () => {
    expect(
      resolveWorkspaceOverrideXml(
        'mySolution',
        {},
        {mySolution: 'draft-xml'},
        {mySolution: 'served-xml'},
      ),
    ).toBe('draft-xml');
  });

  it('falls back to the served solution when mySolution has neither attempt nor draft', () => {
    expect(
      resolveWorkspaceOverrideXml(
        'mySolution',
        {},
        {},
        {mySolution: 'served-xml'},
      ),
    ).toBe('served-xml');
  });

  it('keeps the two modes independent — a studentStart draft never leaks into mySolution', () => {
    expect(
      resolveWorkspaceOverrideXml(
        'mySolution',
        {},
        {studentStart: 'student-draft-xml'},
        {},
      ),
    ).toBe(undefined);
  });
});
