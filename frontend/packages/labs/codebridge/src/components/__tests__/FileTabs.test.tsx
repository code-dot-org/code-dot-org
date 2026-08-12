import {fireEvent, render, screen} from '@testing-library/react';
import {expect, it} from 'vitest';

import type {LevelProperties, MultiFileSource} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {SourcesProvider} from '@code-dot-org/lab/contexts';

import {getEmptyProject} from '../../utils/multiFileSource';
import FileTabs from '../FileTabs';

// Tab activation/close change only SourcesContext state (not the persisted
// project), so no project manager or owned channel is needed here — the
// re-render from `updateSources` is what we assert.

const twoFiles: MultiFileSource = {
  folders: {},
  files: {
    '1': {
      id: '1',
      name: 'a.py',
      language: 'python',
      contents: 'a',
      folderId: '0',
      active: true,
    },
    '2': {
      id: '2',
      name: 'b.py',
      language: 'python',
      contents: 'b',
      folderId: '0',
    },
  },
  openFiles: ['1', '2'],
};

const renderTabs = (pinnedFileId?: string) =>
  render(
    <RootStateProvider>
      <SourcesProvider<LevelProperties, MultiFileSource>
        levelProperties={{} as LevelProperties}
        initialSources={{source: twoFiles}}
        defaultSources={{source: getEmptyProject()}}
      >
        <FileTabs pinnedFileId={pinnedFileId} />
      </SourcesProvider>
    </RootStateProvider>,
  );

const selected = (name: string) =>
  screen.getByRole('tab', {name}).getAttribute('aria-selected');

it('renders a tab per open file and marks the active one', () => {
  renderTabs();
  expect(selected('a.py')).toBe('true');
  expect(selected('b.py')).toBe('false');
});

it('activates a file when its tab is clicked', () => {
  renderTabs();
  fireEvent.click(screen.getByRole('tab', {name: 'b.py'}));
  expect(selected('b.py')).toBe('true');
  expect(selected('a.py')).toBe('false');
});

it('closes a file when its close button is clicked', () => {
  renderTabs();
  fireEvent.click(screen.getByLabelText('Close a.py'));
  expect(screen.queryByRole('tab', {name: 'a.py'})).toBe(null);
  expect(screen.queryByRole('tab', {name: 'b.py'})).not.toBe(null);
});

it('gives a pinned file no way to close it', () => {
  // For a workspace with no file browser: closing the last tab there is a
  // one-way door, since there is no list to reopen anything from. The host
  // says which file that is, and the tab strip simply does not offer to close
  // it — no button, and the keyboard shortcut does nothing.
  renderTabs('1');
  expect(screen.queryByLabelText('Close a.py')).toBe(null);

  fireEvent.keyDown(screen.getByRole('tab', {name: 'a.py'}), {
    key: 'Backspace',
  });
  expect(screen.queryByRole('tab', {name: 'a.py'})).not.toBe(null);
});

it('pins one file, not the strip', () => {
  // The other half, and the reason this is a file id rather than a flag: a
  // rule opened from the block that names it can be reached again the same
  // way, so closing it is an ordinary thing to do.
  renderTabs('1');
  fireEvent.click(screen.getByLabelText('Close b.py'));
  expect(screen.queryByRole('tab', {name: 'b.py'})).toBe(null);
  expect(screen.queryByRole('tab', {name: 'a.py'})).not.toBe(null);
});
