import {act, render, screen} from '@testing-library/react';
import {expect, it, vi} from 'vitest';

import type {LevelProperties} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {Lab} from '@code-dot-org/lab/host';

import WorldLab from '../App';

// World Lab does not use the Codebridge xterm console, but importing the shell's
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

// The default project opens on `main.world`, a Blockly file, so the visible
// Blockly editor mounts. Blockly needs a real browser (injects CSS/observers
// jsdom can't handle), like xterm above — stub it; this smoke test asserts the
// shell composes, not Blockly's rendering (covered by the blockly/ tests).
vi.mock('../blockly/BlocklyFileEditor', () => ({
  BlocklyFileEditor: () => <div>blockly editor</div>,
}));

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

it('renders the World Lab shell from the default project', async () => {
  render(
    <RootStateProvider>
      <Lab levelId="1" levelPropertiesMap={{'1': {} as LevelProperties}}>
        <WorldLab />
      </Lab>
    </RootStateProvider>,
  );

  // Flush the setCurrentLevelId effect so level properties resolve and the
  // default project renders.
  await act(async () => {});

  // The default project's open file and folders appear in the browser.
  expect((await screen.findAllByText('main.world')).length).toBeGreaterThan(0);
  expect(screen.getAllByText('worlds').length).toBeGreaterThan(0);
  expect(screen.getAllByText('actors').length).toBeGreaterThan(0);
  // The active file is the Blockly world, so its (stubbed) Blockly editor mounts.
  expect(screen.getByText('blockly editor')).toBeTruthy();
  // The preview view toggle rendered.
  expect(screen.getByText('Preview')).toBeTruthy();
  // No sandbox is configured under jsdom, so the preview says so.
  expect(screen.getByText(/no sandbox origin is configured/i)).toBeTruthy();
});
