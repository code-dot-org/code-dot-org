import {act, render, screen} from '@testing-library/react';
import {expect, it, vi} from 'vitest';

import type {LevelProperties} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {Lab} from '@code-dot-org/lab/host';

import PythonLab from '../App';

// xterm.js needs a real browser; stub it so the Codebridge Console mounts in
// jsdom. This lets us mount the whole shell (file browser + editor + console).
vi.mock('@xterm/xterm', () => ({
  Terminal: class {
    options = {};
    open() {}
    write() {}
    writeln() {}
    clear() {}
    scrollToBottom() {}
    focus() {}
    loadAddon() {}
    onData() {}
    attachCustomKeyEventHandler() {}
    dispose() {}
  },
}));
vi.mock('@xterm/addon-fit', () => ({
  FitAddon: class {
    fit() {}
  },
}));

// Stub the instructions panel: it renders the base ResourcePanel, which calls
// the dashboard API (via useApiClient) and needs the host's ApiClientProvider.
// That's base's concern and is exercised in the dev demo; here we only assert
// the shell composes.
vi.mock('@code-dot-org/codebridge', async () => {
  const actual = await vi.importActual<
    typeof import('@code-dot-org/codebridge')
  >('@code-dot-org/codebridge');
  return {...actual, InfoPanel: () => <div>instructions</div>};
});

// The pyodide runner spins up a web worker; keep it out of jsdom.
vi.mock('../runtime/pythonRunner', () => ({
  runPython: vi.fn(),
  stopPython: vi.fn(),
  preloadPython: vi.fn(),
  sendPythonInput: vi.fn(),
}));

it('renders the Python Lab shell from the default project', async () => {
  render(
    <RootStateProvider>
      <Lab levelId="1" levelPropertiesMap={{'1': {} as LevelProperties}}>
        <PythonLab />
      </Lab>
    </RootStateProvider>,
  );

  // Flush the setCurrentLevelId effect so level properties resolve and the
  // sources (the default main.py project) render.
  await act(async () => {});

  // main.py appears in the file browser and the tab strip.
  expect((await screen.findAllByText('main.py')).length).toBeGreaterThan(0);
  // The CodeMirror editor mounted with the file contents.
  expect(document.querySelector('.cm-editor')).not.toBe(null);
  // The console panel rendered.
  expect(screen.getByText('Console')).toBeTruthy();
});
