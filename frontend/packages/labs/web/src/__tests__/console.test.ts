import {describe, expect, it} from 'vitest';

import {describeLog, positionOf} from '../debug/Console';
import type {ConsoleEntry} from '../debug/DebugContext';

const entry = (overrides: Partial<ConsoleEntry> = {}): ConsoleEntry => ({
  level: 'log',
  message: 'hello',
  timestamp: '10:00:00 AM',
  count: 1,
  groupKey: 'log:hello',
  ...overrides,
});

describe('positionOf', () => {
  it('names a lone entry', () => {
    expect(positionOf(true, true)).toBe('The only log entry. ');
  });

  it('names the ends of the list', () => {
    expect(positionOf(true, false)).toBe('Oldest log entry. ');
    expect(positionOf(false, true)).toBe('Most recent log entry. ');
  });

  it('says nothing about entries in the middle', () => {
    expect(positionOf(false, false)).toBe('');
  });
});

describe('describeLog', () => {
  it('reads level, message, and time', () => {
    expect(describeLog(entry(), '')).toBe('log: hello, 10:00:00 AM');
  });

  it('mentions repeats only when a log repeated', () => {
    expect(describeLog(entry({count: 3}), '')).toBe(
      'log: hello, 10:00:00 AM, repeated 3 times',
    );
    expect(describeLog(entry({count: 1}), '')).not.toContain('repeated');
  });

  it('carries the level through', () => {
    expect(describeLog(entry({level: 'error', message: 'boom'}), '')).toBe(
      'error: boom, 10:00:00 AM',
    );
  });

  it('prefixes the position', () => {
    expect(describeLog(entry(), positionOf(false, true))).toBe(
      'Most recent log entry. log: hello, 10:00:00 AM',
    );
  });
});
