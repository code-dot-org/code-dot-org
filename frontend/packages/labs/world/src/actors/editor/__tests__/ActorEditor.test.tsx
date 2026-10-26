// The Actor Editor (specs/ACTOR_EDITOR_PLAN.md, step 4).

import {fireEvent, render, screen, within} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {asActorData, viewOf} from '../../actorData';

// The starter's project, with its Player in the data shape.
const STARTER = WORLD_SCENARIOS.simple.source;
const PLAYER_ID = Object.values(STARTER.files).find(
  file => file.name === 'player.actor',
)!.id;
const PLAYER = asActorData(STARTER.files[PLAYER_ID].contents);
let SOURCE: MultiFileSource = {
  ...STARTER,
  files: {
    ...STARTER.files,
    [PLAYER_ID]: {...STARTER.files[PLAYER_ID], contents: PLAYER},
  },
};

const replaceSources = vi.fn();
/** The level's properties, which a test may set. */
let levelProperties: unknown = undefined;

/** The prompt and confirm dialogs: answered with what a test says. */
const showDialog = vi.fn<
  (dialog: unknown) => Promise<{type: string; args: unknown}>
>(async () => ({type: 'confirm', args: ''}));
vi.mock('@code-dot-org/lab/contexts', () => ({
  // Read when called: a test may hand the project a changed file.
  useSources: () => ({currentSources: {source: SOURCE}, replaceSources}),
  useDialogControl: () => ({showDialog}),
  useMaybeLevelProperties: () => levelProperties,
}));
vi.mock('../../../runtime/WorldRuntimeContext', () => ({
  useWorldRuntime: () => ({getActorInfo: vi.fn(), hasCompiled: false}),
}));
// The code is the file editor over the actor's view; what it is handed and
// what it saves are what is asked about here.
const saved: {
  onChange?: (contents: string) => void;
  contents?: string;
  actorCode?: boolean;
} = {};
vi.mock('../../../blockly/BlocklyFileEditor', () => ({
  BlocklyFileEditor: (props: {
    initialContents: string;
    onChange: (contents: string) => void;
    actorCode?: boolean;
  }) => {
    saved.onChange = props.onChange;
    saved.contents = props.initialContents;
    saved.actorCode = props.actorCode;
    return <div data-testid="blocks" />;
  },
}));
const requestActorEnhance = vi.fn();
vi.mock('../../enhance/actorEnhance', () => ({
  requestActorEnhance: (target: unknown) => requestActorEnhance(target),
}));

const {ActorFileEditor} = await import('../ActorEditor');
const {setFileActHandler} = await import('../../../files/fileActs');
const {setAppearanceImportHandler} = await import(
  '../../../appearance/appearanceImport'
);
const {stockAnimation} = await import('../../../appearance/stock');

const onChange = vi.fn();
beforeEach(() => onChange.mockClear());

const open = (contents = PLAYER) =>
  render(
    <ActorFileEditor
      fileId={PLAYER_ID}
      initialContents={contents}
      language="actor"
      isReadOnly={false}
      onChange={onChange}
    />,
  );

const written = () => JSON.parse(onChange.mock.calls.at(-1)![0] as string);

describe('the Actor Editor', () => {
  it('opens a data-shaped actor', () => {
    open();
    expect(screen.getByTestId('actor-editor')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Player'})).toBeInTheDocument();
    expect(screen.queryByTestId('blocks')).toBeNull();
  });

  it('never opens an actor as a define actor', () => {
    // An actor is data and events (specs/ACTORS_AS_DATA_PLAN.md, step 5): a
    // file that is not data is not one it can read, and says so.
    open(viewOf(PLAYER));
    expect(screen.queryByTestId('blocks')).toBeNull();
    expect(screen.getByText(/cannot be read/)).toBeInTheDocument();
  });

  it('says what it looks like, and changes it', () => {
    open();
    // The Player's Main is the library's bob, its own animation
    // (specs/ANIMATION_PLAN.md).
    const look = screen.getByLabelText('Looks like') as HTMLSelectElement;
    expect(look.value).toBe('animated:');
    expect(look.selectedOptions[0].textContent).toBe('(its own animation)');
    fireEvent.change(look, {target: {value: ''}});
    expect(written().look).toBeUndefined();
    expect(written().animations).toBeUndefined();
  });

  it('takes an animation from the library as its Main', async () => {
    setAppearanceImportHandler(async () => 'coinSpin');
    open();
    fireEvent.change(screen.getByLabelText('Looks like'), {
      target: {value: 'library:'},
    });
    // The starter holds the strip already, so the Main is taken at once.
    await vi.waitFor(() =>
      expect(written().animations.Main).toEqual(
        stockAnimation('coinSpin')!.timeline,
      ),
    );
    setAppearanceImportHandler(null);
  });

  // Its animations, under its picture (specs/ANIMATION_PLAN.md, step 5).
  it('lists its animations, Main first, and makes, renames and deletes them', async () => {
    const view = open();
    const row = screen.getByRole('region', {name: 'Animations'});
    // The Player's Main is the library's bob.
    expect(within(row).getByRole('button', {name: /^Main/})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(row).getByLabelText('Loop')).toBeChecked();
    // Main is not renamed or deleted here.
    expect(within(row).queryByRole('button', {name: 'Rename'})).toBeNull();

    showDialog.mockResolvedValueOnce({type: 'confirm', args: 'Wave'});
    fireEvent.click(
      within(row).getByRole('button', {name: 'Add New Animation'}),
    );
    await vi.waitFor(() =>
      expect(written().animations.Wave).toEqual({tracks: {}}),
    );
    // A name it has already is refused, in the prompt's own words.
    const asked = showDialog.mock.calls.at(-1)![0] as {
      validateInput: (value: string) => string | undefined;
    };
    expect(asked.validateInput('Main')).toMatch(/already has/);

    // …and the new one is chosen, so it can be renamed and deleted.
    const withWave = onChange.mock.calls.at(-1)![0] as string;
    view.rerender(
      <ActorFileEditor
        fileId={PLAYER_ID}
        initialContents={withWave}
        language="actor"
        isReadOnly={false}
        onChange={onChange}
      />,
    );
    const again = screen.getByRole('region', {name: 'Animations'});
    expect(within(again).getByRole('button', {name: 'Wave'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    showDialog.mockResolvedValueOnce({type: 'confirm', args: 'Waves'});
    fireEvent.click(within(again).getByRole('button', {name: 'Rename'}));
    await vi.waitFor(() =>
      expect(Object.keys(written().animations)).toEqual(['Main', 'Waves']),
    );
    showDialog.mockResolvedValueOnce({type: 'confirm', args: ''});
    fireEvent.click(within(again).getByRole('button', {name: 'Delete'}));
    await vi.waitFor(() =>
      expect(Object.keys(written().animations)).toEqual(['Main']),
    );
  });

  it('turns a loop off', () => {
    open();
    const row = screen.getByRole('region', {name: 'Animations'});
    fireEvent.click(within(row).getByLabelText('Loop'));
    expect(written().animations.Main.loop).toBeUndefined();
  });

  it('opens what it looks like, as a step on the trail', () => {
    const acts = vi.fn(async () => undefined);
    setFileActHandler(acts);
    open();
    // The picture its Main shows first.
    fireEvent.click(screen.getByRole('button', {name: 'Edit picture'}));
    const picture = Object.values(SOURCE.files).find(
      file => file.name === 'player.png',
    )!;
    expect(acts).toHaveBeenCalledWith({act: 'open', fileId: picture.id});
    setFileActHandler(null);
  });

  it('looks like a new picture once it is made, and opens it', async () => {
    const acts = vi.fn(async (act: {act: string}) =>
      act.act === 'make' ? 'crab' : undefined,
    );
    setFileActHandler(acts);
    const shipped = SOURCE;
    const view = open();
    fireEvent.click(screen.getByRole('button', {name: 'Pictures'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'New picture…'}));
    expect(acts).toHaveBeenCalledWith({
      act: 'make',
      folder: 'sprites',
      open: false,
    });
    // The project has the new picture: the actor takes it…
    const sprites = Object.values(SOURCE.files).find(file =>
      file.name.endsWith('.png'),
    )!.folderId;
    SOURCE = {
      ...SOURCE,
      files: {
        ...SOURCE.files,
        crab: {
          id: 'crab',
          name: 'crab.png',
          language: 'png',
          contents: '',
          folderId: sprites,
        },
      },
    };
    await vi.waitFor(() => {
      view.rerender(
        <ActorFileEditor
          fileId={PLAYER_ID}
          initialContents={PLAYER}
          language="actor"
          isReadOnly={false}
          onChange={onChange}
        />,
      );
      expect(written().animations.Main.tracks.sprite).toEqual([
        {at: 0, value: 'crab.png'},
      ]);
    });
    // …and the picture opens, once the file menus have that save.
    expect(acts).toHaveBeenCalledWith({act: 'open', fileId: 'crab'});
    SOURCE = shipped;
    setFileActHandler(null);
  });

  it('opens an effect it has, and adds a new one, opened to be made', async () => {
    const acts = vi.fn(async (act: {act: string}) =>
      act.act === 'make' ? 'glow.effect' : undefined,
    );
    setFileActHandler(acts);
    const shipped = SOURCE;
    const ripple = Object.values(SOURCE.files).find(
      file => file.name === 'ripple.effect',
    )!;
    const view = open();
    fireEvent.click(screen.getByRole('button', {name: 'Effects'}));
    fireEvent.click(screen.getByRole('button', {name: 'Add Effect'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'New effect…'}));
    expect(acts).toHaveBeenCalledWith({
      act: 'make',
      folder: 'effects',
      open: false,
      answer: 'name',
    });
    // The project has the new effect: the actor takes it, and it opens.
    SOURCE = {
      ...SOURCE,
      files: {
        ...SOURCE.files,
        glow: {...ripple, id: 'glow', name: 'glow.effect'},
      },
    };
    const again = (contents: string) =>
      view.rerender(
        <ActorFileEditor
          fileId={PLAYER_ID}
          initialContents={contents}
          language="actor"
          isReadOnly={false}
          onChange={onChange}
        />,
      );
    await vi.waitFor(() => {
      again(PLAYER);
      expect(
        written().effects.map((one: {effect: string}) => one.effect),
      ).toEqual(['effects/glow']);
    });
    expect(acts).toHaveBeenCalledWith({
      act: 'open',
      path: 'effects/glow.effect',
    });

    // On its row: Edit opens it, and its menu renames and deletes it.
    again(onChange.mock.calls.at(-1)![0] as string);
    // The effect's own section, beside the animations'.
    const name = screen
      .getAllByRole('region')
      .map(region => region.getAttribute('aria-label')!)
      .find(label => label !== 'Animations')!;
    fireEvent.click(screen.getByRole('button', {name: `Edit ${name}`}));
    expect(acts).toHaveBeenCalledWith({
      act: 'open',
      path: 'effects/glow.effect',
    });
    fireEvent.click(screen.getByRole('button', {name: `More for ${name}`}));
    fireEvent.click(
      screen.getByRole('menuitem', {name: `Delete ${name} from the project…`}),
    );
    expect(acts).toHaveBeenCalledWith({
      act: 'delete',
      path: 'effects/glow.effect',
    });
    SOURCE = shipped;
    setFileActHandler(null);
  });

  it('adds a property of its own, and sets where it starts', () => {
    open();
    fireEvent.change(screen.getByLabelText('New property'), {
      target: {value: 'lives'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Add property'}));
    expect(written().properties).toEqual([
      {name: 'lives', type: 'number', access: 'writable', value: '0'},
    ]);

    const lives = screen.getByLabelText('Lives');
    fireEvent.change(lives, {target: {value: '3'}});
    fireEvent.blur(lives);
    expect(written().properties[0].value).toBe('3');
  });

  it('renames a property of its own across the project, and deletes one after saying so', () => {
    // A Player with lives of its own.
    const withLives = JSON.stringify({
      ...JSON.parse(PLAYER),
      properties: [{name: 'lives', type: 'number', access: 'writable'}],
    });
    const shipped = SOURCE;
    SOURCE = {
      ...SOURCE,
      files: {
        ...SOURCE.files,
        [PLAYER_ID]: {...SOURCE.files[PLAYER_ID], contents: withLives},
      },
    };
    open(withLives);

    fireEvent.click(screen.getByRole('button', {name: 'Rename lives'}));
    fireEvent.change(screen.getByLabelText('Rename lives'), {
      target: {value: 'hearts'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Save name'}));
    const replaced = replaceSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(
      JSON.parse(replaced.source.files[PLAYER_ID].contents).properties[0].name,
    ).toBe('hearts');

    fireEvent.click(screen.getByRole('button', {name: 'Delete lives'}));
    expect(screen.getByRole('group', {name: 'Delete lives'})).toHaveTextContent(
      'No code uses it.',
    );
    fireEvent.click(
      within(screen.getByRole('group', {name: 'Delete lives'})).getByRole(
        'button',
        {name: 'Delete'},
      ),
    );
    expect(written().properties).toBeUndefined();
    SOURCE = shipped;
  });

  it('shows each trait with what can be set on it, and takes one away', () => {
    open();
    const jumps = screen.getByRole('region', {name: 'Jumps'});
    const field = within(jumps).getAllByRole('spinbutton')[0];
    fireEvent.change(field, {target: {value: '777'}});
    fireEvent.blur(field);
    expect(written().values).toEqual([
      expect.objectContaining({type: 'number', value: 777}),
    ]);

    fireEvent.click(within(jumps).getByRole('button', {name: 'Remove Jumps'}));
    expect(written().traits).not.toContain('Jumping#JumpsTrait');
  });

  it('opens the rule a trait is written in', () => {
    const acts = vi.fn(async () => undefined);
    setFileActHandler(acts);
    open();
    const jumps = screen.getByRole('region', {name: 'Jumps'});
    fireEvent.click(
      within(jumps).getByRole('button', {name: /^Open the .* rule$/}),
    );
    expect(acts).toHaveBeenCalledWith(
      expect.objectContaining({act: 'open', path: 'rules/jump.rule'}),
    );
    setFileActHandler(null);
  });

  it('offers no Rule button where the level hides rule sources', () => {
    levelProperties = {levelData: {showRuleSource: false}};
    open();
    expect(
      screen.queryByRole('button', {name: /^Open the .* rule$/}),
    ).toBeNull();
    levelProperties = undefined;
  });

  it('offers the traits it does not take, and the enhancements', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Enhance Actor'}));
    const menu = screen.getByRole('menu');
    expect(within(menu).queryByRole('menuitem', {name: /^Jumps/})).toBeNull();
    fireEvent.click(
      within(menu).getByRole('menuitem', {name: 'Enhancements…'}),
    );
    expect(requestActorEnhance).toHaveBeenCalledWith(
      expect.objectContaining({kind: 'actor', path: 'actors/player'}),
    );
  });

  it('opens its code, without define actor, and keeps the data as it was', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Code'}));
    expect(screen.getByTestId('blocks')).toBeInTheDocument();
    // What it is stays in the panel; the code is its handlers and code rows.
    const code = JSON.parse(saved.contents!);
    const types = code.blocks.blocks.map((block: {type: string}) => block.type);
    expect(types).not.toContain('world_actor');
    expect(types.length).toBeGreaterThan(0);

    // A handler taken away, saved from the blocks.
    saved.onChange!(
      JSON.stringify({...code, blocks: {...code.blocks, blocks: []}}),
    );
    expect(written()).toMatchObject({
      type: 'actor',
      name: 'Player',
      traits: JSON.parse(PLAYER).traits,
      blocks: {blocks: {blocks: []}},
    });
  });

  it('tells the file editor the workspace is an actor’s code', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Code'}));
    expect(saved.actorCode).toBe(true);
  });
});

describe('what it is for (specs/ACTORS_AS_DATA_PLAN.md, step 3)', () => {
  /** The Player, said to be for something else. */
  const as = (change: Record<string, unknown>) =>
    JSON.stringify({...JSON.parse(PLAYER), ...change});

  it('offers a game actor its pictures and no icon', () => {
    open();
    expect(screen.getByLabelText('Looks like')).toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Icon'})).toBeNull();
  });

  it('offers an interface actor its icon and no pictures', () => {
    open(as({for: 'interface'}));
    expect(screen.queryByLabelText('Looks like')).toBeNull();
    expect(screen.queryByRole('button', {name: /Pictures/})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'button'}));
    expect(written().icon).toBe('button');
    expect(screen.getByRole('button', {name: 'button'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('asks before an actor with pictures is made an interface’s', () => {
    open();
    showDialog.mockResolvedValueOnce({type: 'cancel', args: ''});
    fireEvent.change(screen.getByLabelText('For'), {
      target: {value: 'interface'},
    });
    return vi.waitFor(() => {
      expect(showDialog).toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('makes it an interface’s when told to, drawn and without pictures', async () => {
    open();
    showDialog.mockResolvedValueOnce({type: 'confirm', args: ''});
    fireEvent.change(screen.getByLabelText('For'), {
      target: {value: 'interface'},
    });
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const data = written();
    expect(data.for).toBe('interface');
    // The Player's Main pulses as well as showing its picture: the pulse
    // stays, the picture goes.
    expect(Object.keys(data.animations.Main.tracks)).toEqual(['drawnScale']);
    expect(
      data.blocks.blocks.blocks.some(
        (root: {type: string}) => root.type === 'world_define_drawing',
      ),
    ).toBe(true);
  });

  it('acts like another of the project’s actors', () => {
    open();
    const field = screen.getByLabelText('Acts like');
    const paths = [...field.querySelectorAll('option')].map(one => one.value);
    // Not itself.
    expect(paths).not.toContain('actors/player');
    const other = paths.find(path => path !== '')!;
    fireEvent.change(field, {target: {value: other}});
    expect(written().actsLike).toBe(other);
  });

  it('is a record, which has no look at all', () => {
    open();
    fireEvent.click(screen.getByRole('checkbox', {name: 'Is a record'}));
    expect(written().isData).toBe(true);
    onChange.mockClear();
    open(as({isData: true}));
    expect(
      screen.getAllByText(/is a record: it is kept and found/),
    ).not.toHaveLength(0);
  });
});
