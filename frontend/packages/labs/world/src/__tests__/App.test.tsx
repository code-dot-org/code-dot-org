import {act, fireEvent, render, screen} from '@testing-library/react';
import {expect, it, vi} from 'vitest';

import {
  QueryClientProvider,
  type LevelProperties,
} from '@code-dot-org/core/api';
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
// A world opens in the world editor — its map first (specs/MAP_FIRST.md).
vi.mock('../mapEditor/WorldEditor', () => ({
  WorldEditor: () => <div>world editor</div>,
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

const renderLab = () =>
  render(
    <RootStateProvider>
      {/*
        The layout asks who is signed in (`useWorldTutor` -> `useCurrentUser`)
        to decide whether the AI Tutor tab belongs here. Every real host
        provides a query client.
      */}
      <QueryClientProvider>
        <Lab levelId="1" levelPropertiesMap={{'1': {} as LevelProperties}}>
          <WorldLab />
        </Lab>
      </QueryClientProvider>
    </RootStateProvider>,
  );

it('renders the World Lab shell from the default project', async () => {
  renderLab();
  // Flush the setCurrentLevelId effect so level properties resolve and the
  // default project renders.
  await act(async () => {});

  // The default project's open file has a tab, called what the world in it is
  // called — the word its blocks and the menus use (`worldConfig.fileLabel`).
  // The file name is the tab's tooltip.
  const tab = await screen.findByRole('tab', {name: 'Platform World'});
  expect(tab.title).toBe('main.world');
  // …and the way around the project is the folder menus, one button per
  // folder, in the tab bar (`files/FileMenus`).
  // Singular, and the one button that is not a menu: there is one world per
  // project, so it opens (specs/MAP_EVENTS_PLAN.md).
  expect(screen.getByRole('button', {name: 'World'})).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Actors'})).toBeTruthy();
  // …and there is no file tree, nor a way to bring one back: the menus are the
  // way around a World project, and a tree beside them could rename a FILE,
  // which for an actor strands every reference to it (`layout/WorldLayout`).
  expect(screen.queryByText('actors')).toBeNull();
  expect(screen.queryByRole('button', {name: /file manager/i})).toBeNull();
  // The active file is the Blockly world, so its (stubbed) Blockly editor mounts.
  expect(screen.getByText('world editor')).toBeTruthy();
  // The preview view toggle rendered.
  expect(screen.getByText('Preview')).toBeTruthy();
  // No sandbox is configured under jsdom, so the preview says so.
  expect(screen.getByText(/no sandbox origin is configured/i)).toBeTruthy();
});

it('opens the JavaScript panel when asked, and not before', async () => {
  // The panel is what a World project does not otherwise show: the file is
  // blocks, and the program it becomes is made on the way to the compiler
  // (`debug/CodePanel`). Off until asked for — a learner authoring in blocks
  // is not owed a pane they did not open.
  renderLab();
  await act(async () => {});

  expect(
    screen.queryByRole('region', {name: 'Generated JavaScript'}),
  ).toBeNull();
  fireEvent.click(screen.getByRole('button', {name: 'JavaScript'}));
  expect(
    screen.getByRole('region', {name: 'Generated JavaScript'}),
  ).toBeTruthy();
});
