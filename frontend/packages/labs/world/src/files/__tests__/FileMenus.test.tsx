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
      // What the file DECLARES, which is what its row shows — the same root a
      // `use rule` dropdown reads (`blockly/projectModules`).
      contents: JSON.stringify({
        blocks: {blocks: [{type: 'world_rule', fields: {NAME: 'Has Gravity'}}]},
      }),
      folderId: 'f1',
      open: true,
      active: true,
    },
    b: {
      id: 'b',
      // …and one that declares nothing, so its own stem is the only name.
      name: 'level1.map',
      language: 'map',
      contents: JSON.stringify({type: 'map', actors: []}),
      folderId: 'f1',
    },
    c: {
      id: 'c',
      name: 'coinSpin.sheet',
      language: 'json',
      contents: '{}',
      folderId: 'f1',
    },
  },
  openFiles: ['a'],
};

vi.mock('@code-dot-org/codebridge', () => ({
  getFileExtension: (name: string) => name.split('.').pop(),
  shouldShowFile: () => true,
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
    // What the tree leaves out, which these menus leave out too: a `.sheet`
    // belongs to the `.png` of the same name (`worldConfig`).
    hiddenFileTypes: ['sheet'],
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

  it('lists what is in the folder by NAME, and opens what is clicked', () => {
    // "Has Gravity", not `gravity.rule`: the file name is where the rule lives
    // rather than what it is, and every other place a learner meets it says
    // the declared name.
    openMenu('Rules');

    expect(screen.queryByText('gravity.rule')).toBeNull();
    fireEvent.click(screen.getByText('Has Gravity'));

    expect(activateFile).toHaveBeenCalledWith('a');
  });

  it('titles a file that declares no name, from its own stem', () => {
    // A map is an arrangement and names nothing, so the file is the only name
    // it has — titled the way every dropdown titles one (`blockly/label`).
    openMenu('Rules');

    expect(screen.getByText('Level1')).toBeTruthy();
  });

  it('leaves out what the tree leaves out', () => {
    // A `.sheet` says how to cut the `.png` of the same name into cells. It is
    // written and deleted by the image editor, never opened, and the tree
    // hides it; a menu that listed it would be offering to open a file with no
    // editor and to delete half of a spritesheet.
    openMenu('Rules');

    expect(screen.queryByText(/sheet/i)).toBeNull();
  });

  it('does not offer to rename the file', () => {
    // Renaming the FILE changes nothing these rows show and leaves the name
    // the learner meant untouched. The tree still renames a file.
    openMenu('Rules');
    fireEvent.click(
      screen.getByRole('button', {name: 'Options for Has Gravity'}),
    );

    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.queryByText('Rename')).toBeNull();
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
