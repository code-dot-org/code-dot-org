import {act, render, screen} from '@testing-library/react';
import {expect, it, vi} from 'vitest';

import type {LevelProperties} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/core/redux';

import WebLab from '../App';

// Web Lab does not use the Codebridge xterm console, but importing the shell's
// barrel evaluates it; xterm needs a real browser, so stub it for jsdom.
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
vi.mock('@xterm/addon-image', () => ({ImageAddon: class {}}));

// Stub the info panel: it renders the base ResourcePanel, which calls the
// dashboard API (via useApiClient) and needs the host's ApiClientProvider.
// That's base's concern and is exercised in the dev demo; here we only assert
// the shell composes.
vi.mock('@code-dot-org/codebridge', async () => {
  const actual = await vi.importActual<
    typeof import('@code-dot-org/codebridge')
  >('@code-dot-org/codebridge');
  return {...actual, InfoPanel: () => <div>instructions</div>};
});

it('renders the Web Lab shell from the default project', async () => {
  render(
    <RootStateProvider>
      <WebLab
        isLoading={false}
        levelId="1"
        levelPropertiesMap={{'1': {} as LevelProperties}}
      />
    </RootStateProvider>,
  );

  // Flush the setCurrentLevelId effect so level properties resolve and the
  // default project renders.
  await act(async () => {});

  // The project's files appear in the browser / tab strip.
  expect((await screen.findAllByText('index.html')).length).toBeGreaterThan(0);
  expect(screen.getAllByText('styles.css').length).toBeGreaterThan(0);
  expect(screen.getAllByText('script.js').length).toBeGreaterThan(0);
  // The CodeMirror editor mounted with the active file.
  expect(document.querySelector('.cm-editor')).not.toBe(null);
  // The preview panel rendered.
  expect(screen.getByText('Preview')).toBeTruthy();
});
