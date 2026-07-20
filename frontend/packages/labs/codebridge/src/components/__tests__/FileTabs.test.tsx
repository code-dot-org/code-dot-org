import {fireEvent, render, screen} from '@testing-library/react';
import {expect, it} from 'vitest';

import type {LevelProperties, MultiFileSource} from '@code-dot-org/core/api';
import {RootStateProvider} from '@code-dot-org/lab';
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

const renderTabs = () =>
  render(
    <RootStateProvider>
      <SourcesProvider<LevelProperties, MultiFileSource>
        levelProperties={{} as LevelProperties}
        initialSources={{source: twoFiles}}
        defaultSources={{source: getEmptyProject()}}
      >
        <FileTabs />
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
