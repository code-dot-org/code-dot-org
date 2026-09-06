// The file menus: one button per folder, and what each one offers.
//
// The acts are the file browser's acts — same `useFileOperations`, same
// prompts, same delete veto — so what is worth testing here is the READING:
// which folder a file is filed under, what a folder with nothing in it says,
// and that `New` names the extension so a learner does not have to.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {referenceToStock} from '../../rules/ruleReference';

const newFile = vi.fn();
const newExternalFile = vi.fn();
const activateFile = vi.fn();
const deleteFile = vi.fn();
const promptForName = vi.fn(async () => 'Chaser');
const upload = vi.fn(async () => undefined);
const confirm = vi.fn(async () => true);
const alert = vi.fn(async () => {});

/** A project with two folders: one holding a rule, one holding nothing. */
const SOURCE: MultiFileSource = {
  folders: {
    f1: {id: 'f1', name: 'rules', parentId: '0', open: true},
    f2: {id: 'f2', name: 'actors', parentId: '0', open: true},
    f3: {id: 'f3', name: 'sprites', parentId: '0', open: true},
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
    d: {
      id: 'd',
      // …and one the learner has not edited, which is stored as a REFERENCE
      // to the library's rule rather than a copy of it (rules/ruleReference).
      // Its name is in the rule, not in the file.
      name: 'solid.rule',
      language: 'rule',
      contents: referenceToStock('solid'),
      folderId: 'f1',
    },
  },
  openFiles: ['a'],
};

const createNewFile = vi.fn((args: {source: MultiFileSource}) => args.source);
const createExternalFile = vi.fn(
  (args: {source: MultiFileSource}) => args.source,
);

vi.mock('@code-dot-org/codebridge', () => ({
  // `renameThing` pulls in the rewrite walk, which reaches the same barrel.
  DEFAULT_FOLDER_ID: '0',
  // Honest enough for `folderIn`, which makes a folder and then looks for it.
  createNewFolder: (source: MultiFileSource, name: string) => ({
    ...source,
    folders: {
      ...source.folders,
      [name]: {id: name, name, parentId: '0', open: true},
    },
  }),
  createNewFile: (args: {source: MultiFileSource}) => createNewFile(args),
  createExternalFile: (args: {source: MultiFileSource}) =>
    createExternalFile(args),
  getNextFileId: () => 'new',
  getFileExtension: (name: string) => name.split('.').pop(),
  shouldShowFile: () => true,
  useFileOperations: () => ({
    source: SOURCE,
    newFile,
    newExternalFile,
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
  useFileUpload: () => ({enabled: true, accept: 'image/png', upload}),
  languageForFileName: () => 'actor',
}));

const updateSources = vi.fn();
const replaceSources = vi.fn();

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources,
    replaceSources,
  }),
}));

vi.mock('@code-dot-org/lab/redux', () => ({
  labActions: {isReadOnlyWorkspace: () => false},
  useAppSelector: (select: (state: unknown) => unknown) => select({}),
}));

const {FileMenus} = await import('../FileMenus');

// Cleared between cases, because `toHaveBeenCalled` on a mock that ALREADY was
// is a wait that ends immediately — and then `calls.at(-1)` reads the last
// test's call rather than this one's. Which is exactly what happened the moment
// the menus started closing before their dialog opens.
beforeEach(() => {
  vi.clearAllMocks();
  promptForName.mockResolvedValue('Chaser');
});

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

  it('titles an unedited rule by what the LIBRARY’S rule declares', () => {
    // These rows are the one place in the lab that reads a file's contents
    // without going through `projectFiles`, which is where a reference is
    // resolved everywhere else. Unresolved, every rule nobody had edited fell
    // back to its stem and the menu read `Solid` where the rest of the lab
    // reads `Solid Bodies`.
    openMenu('Rules');

    expect(screen.getByText('Solid Bodies')).toBeTruthy();
    expect(screen.queryByText('Solid')).toBeNull();
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

  it('clones a thing under a new name, inside and out', async () => {
    // A copy that still called itself "Has Gravity" would be two rules a
    // learner cannot tell apart, and a word every dropdown offers twice.
    promptForName.mockResolvedValueOnce('Has Heavy Gravity');
    openMenu('Rules');
    fireEvent.click(
      screen.getByRole('button', {name: 'Options for Has Gravity'}),
    );
    fireEvent.click(screen.getByText('Clone'));

    await vi.waitFor(() => expect(newFile).toHaveBeenCalled());
    const written = newFile.mock.calls.at(-1)![0] as {
      fileName: string;
      contents: string;
      folderId: string;
    };
    expect(written.fileName).toBe('hasHeavyGravity.rule');
    // …and beside the one it came from, since a clone is another of the same
    // kind of thing.
    expect(written.folderId).toBe('f1');
    expect(JSON.parse(written.contents).blocks.blocks[0].fields.NAME).toBe(
      'Has Heavy Gravity',
    );
  });

  it('renames the THING, and moves its file to match', async () => {
    // The row says "Has Gravity"; renaming it renames the rule, moves
    // `gravity.rule` to `hasHeavyGravity.rule`, and carries every reference —
    // which is a write over the whole project rather than one file.
    promptForName.mockResolvedValueOnce('Has Heavy Gravity');
    openMenu('Rules');
    fireEvent.click(
      screen.getByRole('button', {name: 'Options for Has Gravity'}),
    );
    fireEvent.click(screen.getByText('Rename'));

    await vi.waitFor(() => expect(replaceSources).toHaveBeenCalled());
    const written = replaceSources.mock.calls.at(-1)![0] as {
      source: {files: Record<string, {name: string; contents: string}>};
    };
    expect(written.source.files.a.name).toBe('hasHeavyGravity.rule');
    expect(
      JSON.parse(written.source.files.a.contents).blocks.blocks[0].fields.NAME,
    ).toBe('Has Heavy Gravity');
  });

  it('REPLACES the sources, so an open workspace re-seeds', async () => {
    // A rename rewrites files rather than adding one — the renamed file's own
    // contents, and every reference to it in every other file — and one of
    // those may be the workspace on screen. An editor is told a document was
    // replaced by the epoch and by nothing else (SourcesContext), so an
    // ordinary `updateSources` here leaves it showing the old blocks, and its
    // next save writes them back over the rename.
    //
    // What that looked like, in a browser: a file called `bouncer.actor`
    // holding an actor still called "Ball". The file had moved and the
    // references had followed it; the name inside had not.
    promptForName.mockResolvedValueOnce('Has Heavy Gravity');
    openMenu('Rules');
    fireEvent.click(
      screen.getByRole('button', {name: 'Options for Has Gravity'}),
    );
    fireEvent.click(screen.getByText('Rename'));

    await vi.waitFor(() => expect(replaceSources).toHaveBeenCalled());
    expect(updateSources).not.toHaveBeenCalled();
  });

  it('offers renaming the thing, not the file', () => {
    // Renaming the FILE changes nothing these rows show and leaves the name
    // the learner meant untouched. The tree still renames a file.
    openMenu('Rules');
    fireEvent.click(
      screen.getByRole('button', {name: 'Options for Has Gravity'}),
    );

    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByText('Clone')).toBeTruthy();
    expect(screen.getByText('Rename')).toBeTruthy();
  });

  it('says what is not there yet, rather than showing a blank menu', () => {
    openMenu('Actors');

    expect(screen.getByText('(no actors yet)')).toBeTruthy();
  });

  it('offers both ways in for a folder the project has not got', () => {
    // The project has no `effects/`. Both work anyway: a shelf makes the folder
    // it writes into, and `New` makes it in the same write as the file. It used
    // to offer the shelf and not the making, for a reason nobody could see.
    openMenu('Effects');

    expect(screen.getByText('Import…')).toBeTruthy();
    expect(screen.getByText('New effect')).toBeTruthy();
  });

  it('makes the folder as well, when the project has not got one', async () => {
    promptForName.mockResolvedValueOnce('Ripple');
    openMenu('Effects');

    fireEvent.click(screen.getByText('New effect'));

    await vi.waitFor(() => expect(createNewFile).toHaveBeenCalled());
    const {source, folderId} = createNewFile.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
      folderId: string;
    };
    // The folder is in the source the file is written into, and the file goes
    // in it — one write, so neither can land without the other.
    expect(source.folders[folderId].name).toBe('effects');
  });

  it('makes the file name out of the thing’s name', async () => {
    // One name, said once: the learner types "Health Bar" and gets
    // `healthBar.actor` — the shape every shipped file's stem has — without
    // saying the extension or thinking about spaces.
    promptForName.mockResolvedValueOnce('Health Bar');
    openMenu('Actors');

    fireEvent.click(screen.getByText('New actor'));
    await vi.waitFor(() =>
      expect(createNewFile).toHaveBeenCalledWith(
        expect.objectContaining({fileName: 'healthBar.actor', folderId: 'f2'}),
      ),
    );
  });

  it('puts that name INSIDE the new file, where the menus read one', async () => {
    // The other half, and the reason the first half is not enough: these rows
    // say what a file declares, so a file that declared nothing would be the
    // one row in the lab showing a file name.
    openMenu('Actors');

    fireEvent.click(screen.getByText('New actor'));
    await vi.waitFor(() => expect(createNewFile).toHaveBeenCalled());
    const {contents} = createNewFile.mock.calls.at(-1)![0] as unknown as {
      contents: string;
    };
    expect(JSON.parse(contents).blocks.blocks[0]).toMatchObject({
      type: 'world_actor',
      fields: {NAME: 'Chaser'},
    });
  });

  it('lets a picture be named, which the file-name rule refuses', async () => {
    // `validateFileName`'s first rule is that the extension must be one the lab
    // lets a learner author, and `.png` is not — you upload or import one. So
    // asking it about `chaser.png` refused every name for a file the menu was
    // about to make, with a message about endings the learner never typed.
    const {nameProblem} = await import('../FileMenus');

    expect(nameProblem(SOURCE, 'f3', 'Chaser', 'png')).toBeUndefined();
    expect(nameProblem(SOURCE, 'f3', '  ', 'png')).toMatch(/Enter a name/);
  });

  it('makes a sprite as bytes, since a picture is not text', async () => {
    // A blank tile to draw on: an empty PNG is not a starting point for a game
    // and is exactly one for a drawing. It goes through the other write, the
    // one that puts a file on a URL.
    openMenu('Sprites');

    fireEvent.click(screen.getByText('New sprite'));
    await vi.waitFor(() =>
      expect(createExternalFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'chaser.png',
          mimeType: 'image/png',
        }),
      ),
    );
  });

  it('takes a file of your own into the folder that gives it meaning', () => {
    // The tree's upload put every file at the ROOT, which for a picture is the
    // one thing that decides what it is: a PNG in `backgrounds/` is a backdrop
    // and the same bytes in `sprites/` are a sprite (BACKGROUNDS.md §5).
    openMenu('Sprites');

    expect(screen.getByText('Upload…')).toBeTruthy();
  });

  it('does not offer an upload where one would mean nothing', () => {
    // A world is authored, not brought in — there is no file on anybody's
    // machine that is one.
    openMenu('Worlds');

    expect(screen.queryByText('Upload…')).toBeNull();
  });

  it('still makes nothing where making one from nothing means nothing', () => {
    // A sound is bytes, and an empty one is silence nobody can draw. The only
    // way in is the shelf (or an upload from the tree).
    openMenu('Sounds');

    expect(screen.queryByText(/^New/)).toBeNull();
    expect(screen.getByText('Import…')).toBeTruthy();
  });
});
