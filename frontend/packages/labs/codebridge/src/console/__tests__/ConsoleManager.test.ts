import type {FitAddon} from '@xterm/addon-fit';
import type {Terminal} from '@xterm/xterm';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import ConsoleManager from '../ConsoleManager';

// xterm's Terminal needs a real browser; stub the methods ConsoleManager calls.
const makeTerminal = () =>
  ({
    write: vi.fn(),
    writeln: vi.fn(),
    clear: vi.fn(),
    scrollToBottom: vi.fn(),
    focus: vi.fn(),
  }) as unknown as Terminal;

let terminal: Terminal;
let manager: ConsoleManager;

beforeEach(() => {
  terminal = makeTerminal();
  manager = new ConsoleManager(terminal, {} as FitAddon);
});

describe('program output', () => {
  it('splits a message into complete lines', () => {
    manager.writeConsoleMessage('a\nb');
    expect(manager.getTerminalLines()).toEqual(['a', 'b']);
    expect(terminal.writeln).toHaveBeenCalledWith('a');
    expect(terminal.writeln).toHaveBeenCalledWith('b');
  });

  it('appends a following message onto a partial line', () => {
    manager.writePartialLine('x');
    manager.writeConsoleMessage('y');
    expect(manager.getTerminalLines()).toEqual(['xy']);
  });
});

describe('input buffer', () => {
  it('accumulates, backspaces, and flushes on save', () => {
    manager.appendToInputBuffer('a');
    manager.appendToInputBuffer('b');
    manager.backspaceInputBuffer();
    expect(manager.getInputBuffer()).toBe('a');

    manager.saveAndClearInputBuffer();
    expect(manager.getInputBuffer()).toBe('');
    expect(manager.getTerminalLines()).toEqual(['a']);
  });
});

describe('clear and listeners', () => {
  it('clears lines and notifies listeners on every change', () => {
    // The listener is handed the live lines array; snapshot it per call so a
    // later mutation does not rewrite what we recorded.
    const seen: string[][] = [];
    const listener = vi.fn((lines: string[]) => seen.push([...lines]));
    manager.addTerminalLinesListener(listener);

    manager.writeConsoleMessage('hello');
    expect(seen.at(-1)).toEqual(['hello']);

    manager.clearTerminalLines();
    expect(manager.getTerminalLines()).toEqual([]);
    expect(terminal.clear).toHaveBeenCalled();
    expect(seen.at(-1)).toEqual([]);

    const callCount = listener.mock.calls.length;
    manager.removeTerminalLinesListener(listener);
    manager.writeConsoleMessage('more');
    // Not notified after removal.
    expect(listener.mock.calls.length).toBe(callCount);
  });
});
