// The name and actions at the head of the map editor (specs/SHELL_PLAN.md,
// step 4).

import {fireEvent, render, screen, within} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi, type Mock} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

const requestFileAct: Mock<(act: unknown) => Promise<undefined>> = vi.fn(
  async () => undefined,
);
vi.mock('../../files/fileActs', () => ({
  requestFileAct: (act: unknown) => requestFileAct(act),
}));

const updateSources = vi.fn();
const SOURCE: MultiFileSource = {
  folders: {
    screens: {id: 'screens', name: 'screens', parentId: '0', open: true},
    maps: {id: 'maps', name: 'maps', parentId: '0', open: true},
  },
  files: {
    main: {
      id: 'main',
      name: 'main.screen',
      language: 'screen',
      folderId: 'screens',
      contents: JSON.stringify({type: 'map', name: 'Coins'}),
      active: true,
    },
    level: {
      id: 'level',
      name: 'level1.map',
      language: 'map',
      folderId: 'maps',
      contents: JSON.stringify({type: 'map', actors: []}),
    },
  },
  openFiles: ['main'],
};
vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({currentSources: {source: SOURCE}, updateSources}),
}));

const {PlaceHeading} = await import('../PlaceHeading');

beforeEach(() => vi.clearAllMocks());

describe('the head of the toolbar', () => {
  it('names the place, and opens the switcher on it', () => {
    render(<PlaceHeading fileId="main" isReadOnly={false} />);
    fireEvent.click(screen.getByRole('button', {name: 'Coins'}));

    const switcher = screen.getByRole('dialog');
    const screens = within(switcher).getByRole('region', {name: 'Screens'});
    const maps = within(switcher).getByRole('region', {name: 'Maps'});
    expect(
      within(screens).getByRole('button', {name: 'Coins'}),
    ).toHaveAttribute('aria-current', 'page');

    fireEvent.click(within(maps).getByRole('button', {name: 'Level1'}));
    const written = updateSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(written.source.files.level.active).toBe(true);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('asks the file menus for a new one', () => {
    render(<PlaceHeading fileId="main" isReadOnly={false} />);
    fireEvent.click(screen.getByRole('button', {name: 'Coins'}));
    fireEvent.click(screen.getByRole('button', {name: 'New map'}));
    expect(requestFileAct).toHaveBeenCalledWith({act: 'make', folder: 'maps'});
  });

  it('renames the Main Screen, and offers no way to delete it', () => {
    render(<PlaceHeading fileId="main" isReadOnly={false} />);
    fireEvent.click(screen.getByRole('button', {name: 'Screen actions'}));
    expect(screen.queryByRole('menuitem', {name: 'Delete'})).toBeNull();
    fireEvent.click(screen.getByRole('menuitem', {name: 'Rename'}));
    expect(requestFileAct).toHaveBeenCalledWith({
      act: 'rename',
      fileId: 'main',
    });
  });

  it('deletes a map', () => {
    render(<PlaceHeading fileId="level" isReadOnly={false} />);
    fireEvent.click(screen.getByRole('button', {name: 'Map actions'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Delete'}));
    expect(requestFileAct).toHaveBeenCalledWith({
      act: 'delete',
      fileId: 'level',
    });
  });

  it('clones a map, from its actions', () => {
    render(<PlaceHeading fileId="level" isReadOnly={false} />);
    fireEvent.click(screen.getByRole('button', {name: 'Map actions'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Clone'}));
    expect(requestFileAct).toHaveBeenCalledWith({
      act: 'clone',
      fileId: 'level',
    });
  });

  it('offers nothing to change in a project that is read only', () => {
    render(<PlaceHeading fileId="main" isReadOnly />);
    expect(screen.queryByRole('button', {name: 'Screen actions'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Coins'}));
    expect(screen.queryByRole('button', {name: 'New map'})).toBeNull();
  });
});
