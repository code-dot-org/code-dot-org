// The file menus: one button per folder, and what each one offers.
//
// The acts are the file browser's acts — same `useFileOperations`, same
// prompts, same delete veto — so what is worth testing here is the READING:
// which folder a file is filed under, what a folder with nothing in it says,
// and that `New` names the extension so a learner does not have to.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi, type Mock} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {referenceToStock} from '../../rules/ruleReference';

const newFile = vi.fn();
const newExternalFile = vi.fn();
const activateFile = vi.fn();
const deleteFile = vi.fn();
const promptForName = vi.fn(async () => 'Chaser');
/** Typed so a test can read back the file and the folder it was handed. */
const upload: Mock<(file: File, folderId?: string) => Promise<undefined>> =
  vi.fn(async () => undefined);
const confirm = vi.fn(async () => true);
const alert = vi.fn(async () => {});

/** A project with two folders: one holding a rule, one holding nothing. */
const SOURCE: MultiFileSource = {
  folders: {
    f1: {id: 'f1', name: 'rules', parentId: '0', open: true},
    f2: {id: 'f2', name: 'actors', parentId: '0', open: true},
    f3: {id: 'f3', name: 'sprites', parentId: '0', open: true},
    f4: {id: 'f4', name: 'backgrounds', parentId: '0', open: true},
    // …and the world, which holds exactly one file and whose button opens it
    // rather than listing it (specs/MAP_EVENTS_PLAN.md).
    f5: {id: 'f5', name: 'worlds', parentId: '0', open: true},
  },
  files: {
    w: {
      id: 'w',
      name: 'main.world',
      language: 'world',
      contents: JSON.stringify({
        blocks: {blocks: [{type: 'world_world', fields: {NAME: 'My World'}}]},
      }),
      folderId: 'f5',
    },
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
    f: {
      id: 'f',
      // A Coin the project already holds — the same stem the library's Coin
      // imports as, which is what makes the template branch's two cases
      // reachable from here.
      name: 'coin.actor',
      language: 'actor',
      contents: JSON.stringify({
        blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Coin'}}]},
      }),
      folderId: 'f2',
    },
    e: {
      id: 'e',
      // A backdrop, which is bytes on a URL rather than text: what makes it a
      // backdrop is the folder and nothing else (`appearance/backgroundsFolder`).
      name: 'cave.png',
      language: 'png',
      // A picture's bytes are on the URL; the text half of a file is empty,
      // which is how every imported backdrop is written (`importStock`).
      contents: '',
      url: 'data:image/png;base64,cave',
      folderId: 'f4',
    },
  },
  openFiles: ['a'],
};

const createNewFile = vi.fn((args: {source: MultiFileSource}) => args.source);
/**
 * Honest enough to be asserted on: it ADDS the file.
 *
 * The real one activates what it makes, which is the behaviour the wizard has
 * to undo — so a mock that handed the source straight back could not show
 * whether the undoing worked, and an assertion about "the new picture" would
 * find whichever `.png` the fixture already had.
 */
/** The assets backend, which answers with the URL the project will carry. */
const uploadAsset: Mock<
  (params: {
    channelId: string;
    filename: string;
    data: Blob;
  }) => Promise<{url: string}>
> = vi.fn(async () => ({url: '/v3/assets/channel-1/stored.png'}));

vi.mock('@code-dot-org/core/api', async importActual => ({
  ...(await importActual<object>()),
  DashboardApiClient: {assets: {upload: uploadAsset}},
}));

const createExternalFile = vi.fn(
  (args: {
    source: MultiFileSource;
    fileName: string;
    language: string;
    folderId: string;
    url: string;
    mimeType?: string;
  }) => ({
    ...args.source,
    files: {
      ...args.source.files,
      made: {
        id: 'made',
        name: args.fileName,
        language: args.language,
        contents: '',
        folderId: args.folderId,
        url: args.url,
        mimeType: args.mimeType,
        open: true,
        active: true,
      },
    },
    openFiles: [...(args.source.openFiles ?? []), 'made'],
  }),
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
  // The pure one, which the palette's Delete writes with.
  deleteFile: (source: MultiFileSource, fileId: string) => ({
    ...source,
    files: Object.fromEntries(
      Object.entries(source.files).filter(([id]) => id !== fileId),
    ),
  }),
  // The pure one, which the menus use to put a tab back in front
  // (`actors/create/actorCreate`): one file active, the rest not.
  activateFile: (source: MultiFileSource, fileId: string) => ({
    ...source,
    files: Object.fromEntries(
      Object.entries(source.files).map(([id, file]) => [
        id,
        {...file, active: id === fileId},
      ]),
    ),
  }),
  createExternalFile: (args: Parameters<typeof createExternalFile>[0]) =>
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
  // No level: a game, the default (`appBuilder`).
  useMaybeLevelProperties: () => undefined,
}));

// The drawing door asks what can draw before it offers itself, and in jsdom
// nothing answers `/__images/status` — so without this there is no door to
// drive. The fixture is what a harness with no key would have chosen anyway
// (`appearance/generate/chooseImageGenerator`).
vi.mock('../../appearance/generate/chooseImageGenerator', async () => {
  const {fixtureImages} = await import(
    '../../appearance/generate/fixtureImages'
  );
  return {chooseImageGenerator: async () => ({generator: fixtureImages()})};
});

vi.mock('@code-dot-org/lab/redux', () => ({
  labActions: {isReadOnlyWorkspace: () => false},
  // A channel, because an uploaded asset is scoped to one and the drawing
  // door will not keep a picture without it.
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({lab: {channel: {id: 'channel-1'}}}),
}));

const {FileMenus} = await import('../FileMenus');
const {requestActorCreate} = await import('../../actors/create/actorCreate');
const {requestActorDelete} = await import('../../actors/actorDelete');
const {requestFileAct} = await import('../fileActs');

// Cleared between cases, because `toHaveBeenCalled` on a mock that ALREADY was
// is a wait that ends immediately — and then `calls.at(-1)` reads the last
// test's call rather than this one's.
beforeEach(() => {
  vi.clearAllMocks();
  promptForName.mockResolvedValue('Chaser');
});

describe('the file acts, as each door asks them', () => {
  // The folder buttons are gone (specs/SHELL_FINISH_PLAN.md, step 5); what
  // they did, the doors ask through `fileActs`, and the Actor Palette asks
  // for the Creator through `actorCreate`.
  it('clones a thing under a new name, inside and out', async () => {
    // A copy that still called itself "Has Gravity" would be two rules a
    // learner cannot tell apart, and a word every dropdown offers twice.
    promptForName.mockResolvedValueOnce('Has Heavy Gravity');
    render(<FileMenus />);
    await requestFileAct({act: 'clone', fileId: 'a'});

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
    // The file says "Has Gravity"; renaming it renames the rule, moves
    // `gravity.rule` to `hasHeavyGravity.rule`, and carries every reference —
    // which is a write over the whole project rather than one file.
    promptForName.mockResolvedValueOnce('Has Heavy Gravity');
    render(<FileMenus />);
    await requestFileAct({act: 'rename', fileId: 'a'});

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
    render(<FileMenus />);
    await requestFileAct({act: 'rename', fileId: 'a'});

    await vi.waitFor(() => expect(replaceSources).toHaveBeenCalled());
    expect(updateSources).not.toHaveBeenCalled();
  });

  it('makes the folder as well, when the project has not got one', async () => {
    // The project has no `effects/`.
    promptForName.mockResolvedValueOnce('Ripple');
    render(<FileMenus />);
    void requestFileAct({act: 'make', folder: 'effects'});

    await vi.waitFor(() => expect(createNewFile).toHaveBeenCalled());
    const {source, folderId} = createNewFile.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
      folderId: string;
    };
    // The folder is in the source the file is written into, and the file goes
    // in it — one write, so neither can land without the other.
    expect(source.folders[folderId].name).toBe('effects');
  });

  /** Open the Actor Creator, as the Actor Palette's Add New Actor does. */
  const startAnActor = async (called: string) => {
    render(<FileMenus />);
    void requestActorCreate();
    await screen.findByText('Create my own');
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: called}});
    // Past the picture and the abilities steps, neither of which this test is
    // about — the wizard's own tests cover them.
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));
  };

  it('makes the file name out of the thing’s name', async () => {
    // One name, said once: the learner types "Health Bar" and gets
    // `healthBar.actor` — the shape every shipped file's stem has — without
    // saying the extension or thinking about spaces. Asked by the wizard now
    // rather than by a prompt (`actors/create/ActorCreator`).
    await startAnActor('Health Bar');

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
    await startAnActor('Chaser');

    await vi.waitFor(() => expect(createNewFile).toHaveBeenCalled());
    const {contents} = createNewFile.mock.calls.at(-1)![0] as unknown as {
      contents: string;
    };
    // An actor made from nothing is data-shaped, its name a key of its own
    // (specs/ACTOR_EDITOR_PLAN.md).
    expect(JSON.parse(contents)).toMatchObject({type: 'actor', name: 'Chaser'});
  });

  it('copies a template the project already has, rather than renaming it', async () => {
    // `importStockActor` never overwrites, so asked for a Coin in a project
    // that has one it writes the dependencies and hands back THE LEARNER'S
    // file. Renaming that renamed their Coin and moved every reference with
    // it; the fix is to copy it, which is what the other door does anyway.
    render(<FileMenus />);
    void requestActorCreate();
    await screen.findByText('Start from a template');
    fireEvent.click(screen.getByText('Start from a template'));
    fireEvent.click(screen.getByRole('button', {name: 'Coin'}));
    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'Gold Piece'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await vi.waitFor(() => expect(createNewFile).toHaveBeenCalled());
    const {fileName, source} = createNewFile.mock.calls.at(-1)![0] as {
      fileName: string;
      source: MultiFileSource;
    };
    // A NEW file, and the one that was there left alone.
    expect(fileName).toBe('goldPiece.actor');
    expect(source.files.f.name).toBe('coin.actor');
    expect(source.files.f.contents).toContain('"NAME":"Coin"');
  });

  it('will not let the copy take a name that is taken', async () => {
    // The degenerate case of the same branch: a template the project has,
    // kept at the library's own name, would be a second `coin.actor`. The
    // caller's rule catches it before the wizard can ask.
    render(<FileMenus />);
    void requestActorCreate();
    await screen.findByText('Start from a template');
    fireEvent.click(screen.getByText('Start from a template'));
    fireEvent.click(screen.getByRole('button', {name: 'Coin'}));

    expect(
      screen.getByText('There is already one called coin.actor here.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
  });

  it('keeps a described picture as an upload, and opens nothing', async () => {
    // TWO CLAIMS, and each was a bug first. The bytes go to the assets
    // backend and the project keeps the URL — inlining them as a data URL,
    // the way an imported backdrop is written, put a megabyte and a half into
    // one `sessionStorage` blob and exhausted it. And the file is written
    // quietly: `createExternalFile` activates what it makes, which would open
    // an editor behind a dialog the learner has not finished with.
    render(<FileMenus />);
    void requestActorCreate();
    await screen.findByText('Create my own');
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Crabby'}});
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));

    // The drawing panel is a door under the pictures now, not a row in them.
    fireEvent.click(screen.getByText(/Or describe one to be drawn/));
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a purple crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    fireEvent.click(
      await screen.findByRole(
        'button',
        {name: 'Keep this one'},
        {timeout: 4000},
      ),
    );

    await vi.waitFor(() => expect(uploadAsset).toHaveBeenCalled());
    const sent = uploadAsset.mock.calls.at(-1)![0];
    expect(sent.channelId).toBe('channel-1');
    expect(sent.filename).toMatch(/\.png$/);

    await vi.waitFor(() => expect(updateSources).toHaveBeenCalled());
    const {source} = updateSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    const made = source.files.made;
    // The URL the backend answered with, and no bytes anywhere.
    expect(made.url).toBe('/v3/assets/channel-1/stored.png');
    expect(made.url).not.toMatch(/^data:/);
    // In the project, and on nobody's screen.
    expect(made.open).toBe(false);
    expect(made.active).toBe(false);
    expect(source.openFiles).toEqual(SOURCE.openFiles);
  });

  it('carries the picture into the actor, when pressing on is what kept it', async () => {
    // THE SECOND HALF OF ONE TICK. `Next` keeps the drawn picture and then
    // builds the actor that names it, and the build reads the project — so it
    // has to read the project the keep just wrote. Built on the render's copy
    // instead, the commit put the pre-keep project back, and the actor came
    // out with a `set sprite` row naming a file that was no longer there.
    render(<FileMenus />);
    void requestActorCreate();
    await screen.findByText('Create my own');
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Crabby'}});
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));

    fireEvent.click(screen.getByText(/Or describe one to be drawn/));
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'a purple crab'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Draw'}));
    await screen.findByRole('button', {name: 'Keep this one'}, {timeout: 4000});

    // …and NOT pressing it. This is the press a learner makes anyway.
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(await screen.findByRole('button', {name: 'Create'}));

    await vi.waitFor(() => expect(uploadAsset).toHaveBeenCalled());
    // BOTH writes, and the second is the one that matters: waiting for "a
    // write" passes on the keep's own, which of course has the picture in it.
    await vi.waitFor(() => expect(updateSources.mock.calls.length).toBe(2));
    const {source} = updateSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(source.files.made?.url).toBe('/v3/assets/channel-1/stored.png');
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
    render(<FileMenus />);
    void requestFileAct({act: 'make', folder: 'sprites'});
    await vi.waitFor(() =>
      expect(createExternalFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'chaser.png',
          mimeType: 'image/png',
        }),
      ),
    );
  });

  it('makes a backdrop as bytes, the way it makes a sprite', async () => {
    promptForName.mockResolvedValueOnce('Cavern');
    render(<FileMenus />);
    void requestFileAct({act: 'make', folder: 'backgrounds'});
    await vi.waitFor(() =>
      expect(createExternalFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'cavern.png',
          folderId: 'f4',
          mimeType: 'image/png',
        }),
      ),
    );
  });
});

describe('the Actor Creator, asked for from the map', () => {
  // The map editor's palette has `Add New Actor`
  // (specs/KINDS_FROM_THE_MAP_PLAN.md).
  it('draws nothing of its own, and answers', async () => {
    render(<FileMenus />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    const asked = requestActorCreate();
    await screen.findByText('Create my own');
    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Chaser'}});
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    // The asker is told which kind was made…
    expect(await asked).toBe('actors/chaser');
    // …and the tab that was in front stays in front, where the real
    // `createNewFile` would have put the new file there.
    const written = updateSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(written.source.files.a.active).toBe(true);
  });

  it('from the Interface tab, offers interface templates and asks no picture', async () => {
    // specs/PURPOSE_PLAN.md, step 2.
    render(<FileMenus />);
    const asked = requestActorCreate('interface');
    await screen.findByText('Start from a template');
    fireEvent.click(screen.getByText('Start from a template'));
    // A Button is an interface's; a Coin is a game's; a Label is both.
    expect(screen.getByRole('button', {name: 'Button'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Label'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Coin'})).toBeNull();
    // Two steps, the picture left out.
    expect(screen.getByText(/^Step 1 of 2/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Create my own'));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Badge'}});
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));
    expect(await asked).toBe('actors/badge');
    // Made from nothing for an interface: a box, and a drawing the size of it.
    const {contents} = createNewFile.mock.calls.at(-1)![0] as unknown as {
      contents: string;
    };
    expect(JSON.parse(contents)).toMatchObject({
      type: 'actor',
      for: 'interface',
      traits: ['Boxed#HasABoxTrait'],
    });
  });

  it('answers with nothing when the learner backs out', async () => {
    render(<FileMenus />);
    const asked = requestActorCreate();
    await screen.findByText('Create my own');
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(await asked).toBeUndefined();
  });
});

describe('an actor deleted from the palette', () => {
  // The Actor Palette's Delete is asked of these menus, which own the
  // prompts (`actors/actorDelete`, specs/SHELL_PLAN.md).
  it('asks first, then takes the actor out of the project', async () => {
    render(<FileMenus />);
    const asked = requestActorDelete('actors/coin');

    expect(await asked).toBe('actors/coin');
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete actor',
        message: expect.stringMatching(/^Delete coin\.actor\?/),
      }),
    );
    // Replaced, so the map open beside the palette reads its file again.
    const written = replaceSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(written.source.files.f).toBeUndefined();
    expect(written.source.files.a).toBeDefined();
  });

  it('keeps it when the learner says no', async () => {
    confirm.mockResolvedValueOnce(false);
    render(<FileMenus />);
    expect(await requestActorDelete('actors/coin')).toBeUndefined();
    expect(replaceSources).not.toHaveBeenCalled();
  });

  it('answers nothing for an actor the project does not hold', async () => {
    render(<FileMenus />);
    expect(await requestActorDelete('actors/ghost')).toBeUndefined();
    expect(confirm).not.toHaveBeenCalled();
  });
});

describe('a Screen or Map acted on from the toolbar', () => {
  // The toolbar over the map editor asks these menus, which own the
  // prompts (`files/fileActs`, specs/SHELL_PLAN.md).
  it('makes a new map, asking its name', async () => {
    render(<FileMenus />);
    promptForName.mockResolvedValueOnce('Level 2');
    await requestFileAct({act: 'make', folder: 'maps'});

    expect(promptForName).toHaveBeenCalledWith(
      expect.objectContaining({title: 'New map'}),
    );
    expect(createNewFile).toHaveBeenCalledWith(
      expect.objectContaining({fileName: 'level2.map'}),
    );
  });

  it('makes a new screen, though no folder button makes one', async () => {
    render(<FileMenus />);
    promptForName.mockResolvedValueOnce('Title');
    await requestFileAct({act: 'make', folder: 'screens'});

    expect(createNewFile).toHaveBeenCalledWith(
      expect.objectContaining({fileName: 'title.screen'}),
    );
  });

  it('renames one by what it is called, and deletes one after asking', async () => {
    render(<FileMenus />);
    promptForName.mockResolvedValueOnce('Level One');
    await requestFileAct({act: 'rename', fileId: 'b'});
    expect(promptForName).toHaveBeenCalledWith(
      expect.objectContaining({title: 'Rename level1.map'}),
    );
    expect(replaceSources).toHaveBeenCalled();

    await requestFileAct({act: 'delete', fileId: 'b'});
    expect(confirm).toHaveBeenCalled();
    expect(deleteFile).toHaveBeenCalledWith('b');
  });
  // Every kind, from the place it is used (specs/SHELL_FINISH_PLAN.md, step
  // 4): the folder buttons are not the only way to these.
  it('makes any kind, and answers the new file’s id', async () => {
    render(<FileMenus />);
    promptForName.mockResolvedValueOnce('Chaser');
    const made = await requestFileAct({act: 'make', folder: 'sprites'});
    expect(createExternalFile).toHaveBeenCalledWith(
      expect.objectContaining({fileName: 'chaser.png'}),
    );
    expect(made).toBe('made');

    promptForName.mockResolvedValueOnce('Cave');
    expect(
      await requestFileAct({
        act: 'make',
        folder: 'backgrounds',
        answer: 'name',
      }),
    ).toBe('cave.png');
  });

  it('answers nothing for a folder nothing makes in', async () => {
    render(<FileMenus />);
    expect(await requestFileAct({act: 'make', folder: 'sounds'})).toBe(
      undefined,
    );
    expect(promptForName).not.toHaveBeenCalled();
  });

  it('opens, clones and uploads', async () => {
    const picker = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {});
    render(<FileMenus />);
    await requestFileAct({act: 'open', fileId: 'b'});
    await vi.waitFor(() => expect(activateFile).toHaveBeenCalledWith('b'));
    // …and by its path, for a door that holds no project.
    activateFile.mockClear();
    await requestFileAct({act: 'open', path: 'rules/gravity.rule'});
    await vi.waitFor(() => expect(activateFile).toHaveBeenCalledWith('a'));

    promptForName.mockResolvedValueOnce('Gravity Two');
    await requestFileAct({act: 'clone', fileId: 'a'});
    expect(promptForName).toHaveBeenCalledWith(
      expect.objectContaining({title: 'Clone gravity.rule'}),
    );
    expect(newFile).toHaveBeenCalledWith(
      expect.objectContaining({fileName: 'gravityTwo.rule'}),
    );

    await requestFileAct({act: 'upload', folder: 'backgrounds'});
    expect(picker).toHaveBeenCalled();
    picker.mockRestore();
  });
});
