// The file menus: one button per folder, and what each one offers.
//
// The acts are the file browser's acts — same `useFileOperations`, same
// prompts, same delete veto — so what is worth testing here is the READING:
// which folder a file is filed under, what a folder with nothing in it says,
// and that `New` names the extension so a learner does not have to.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

const newFile = vi.fn();
const activateFile = vi.fn();
const deleteFile = vi.fn();
const promptForName = vi.fn(async () => 'chaser');
const confirm = vi.fn(async () => true);
const alert = vi.fn(async () => {});

/** A project with two folders: one holding a rule, one holding nothing. */
const SOURCE: MultiFileSource = {
  folders: {
    f1: {id: 'f1', name: 'rules', parentId: '0', open: true},
    f2: {id: 'f2', name: 'actors', parentId: '0', open: true},
  },
  files: {
    a: {
      id: 'a',
      name: 'gravity.rule',
      language: 'rule',
      contents: '',
      folderId: 'f1',
      open: true,
      active: true,
    },
  },
  openFiles: ['a'],
};

vi.mock('@code-dot-org/codebridge', () => ({
  useFileOperations: () => ({
    source: SOURCE,
    newFile,
    activateFile,
    deleteFile,
    renameFile: vi.fn(),
  }),
  useCodebridgeConfig: () => ({
    languageMapping: {rule: 'rule', actor: 'actor'},
    blockFileDeletion: () => undefined,
  }),
  usePrompts: () => ({promptForName, confirm, alert}),
  languageForFileName: () => 'actor',
  validateFileName: () => undefined,
}));

vi.mock('@code-dot-org/lab/redux', () => ({
  labActions: {isReadOnlyWorkspace: () => false},
  useAppSelector: (select: (state: unknown) => unknown) => select({}),
}));

const {FileMenus} = await import('../FileMenus');

const openMenu = (name: string) => {
  render(<FileMenus />);
  fireEvent.click(screen.getByRole('button', {name}));
};

describe('the file menus', () => {
  it('gives every folder a button, whether the project has one or not', () => {
    render(<FileMenus />);

    // Nine, because a project's folders are its kinds — and the two this
    // project lacks are still offered, since a shelf makes the folder it
    // writes into.
    for (const label of [
      'Worlds',
      'Actors',
      'Rules',
      'Sprites',
      'Backgrounds',
      'Animations',
      'Sounds',
      'Effects',
      'Maps',
    ]) {
      expect(screen.getByRole('button', {name: label}), label).toBeTruthy();
    }
  });

  it('lists what is in the folder, and opens what is clicked', () => {
    openMenu('Rules');

    fireEvent.click(screen.getByText('gravity.rule'));

    expect(activateFile).toHaveBeenCalledWith('a');
  });

  it('says what is not there yet, rather than showing a blank menu', () => {
    openMenu('Actors');

    expect(screen.getByText('(no actors yet)')).toBeTruthy();
  });

  it('offers the shelf even for a folder the project has not got', () => {
    // `Import…` writes through a shelf, and a shelf makes its own folder — so
    // it is offered where `New` cannot be.
    openMenu('Sounds');

    expect(screen.getByText('Import…')).toBeTruthy();
    expect(screen.queryByText(/^New/)).toBeNull();
  });

  it('names the extension itself, since the folder already knows it', async () => {
    openMenu('Actors');

    fireEvent.click(screen.getByText('New actor'));
    await vi.waitFor(() =>
      expect(newFile).toHaveBeenCalledWith(
        expect.objectContaining({fileName: 'chaser.actor', folderId: 'f2'}),
      ),
    );
  });

  it('makes nothing where making one from nothing means nothing', () => {
    // A sprite is bytes. An empty one is not a starting point, so the only way
    // in is the shelf (or an upload from the tree).
    openMenu('Sprites');

    expect(screen.queryByText(/^New/)).toBeNull();
    expect(screen.getByText('Import…')).toBeTruthy();
  });
});
