import {act, render, screen} from '@testing-library/react';
import {expect, it, vi} from 'vitest';

import type {LevelProperties} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/lab';

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

it('renders the Python Lab shell from the default project', async () => {
  render(
    <RootStateProvider>
      <PythonLab
        isLoading={false}
        levelId="1"
        levelPropertiesMap={{'1': {} as LevelProperties}}
      />
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
