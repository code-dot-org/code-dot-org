// The Actor Editor (specs/ACTOR_EDITOR_PLAN.md, step 4).

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {levelScreen} from '../../../__tests__/support/levelScreen';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';

// The starter's project and its Player.
const STARTER = WORLD_SCENARIOS.simple.source;
const PLAYER_ID = Object.values(STARTER.files).find(
  file => file.name === 'player.actor',
)!.id;
const PLAYER = STARTER.files[PLAYER_ID].contents;
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
  memberHead?: {parts: unknown[]};
} = {};
vi.mock('../../../blockly/BlocklyFileEditor', () => ({
  BlocklyFileEditor: (props: {
    initialContents: string;
    onChange: (contents: string) => void;
    memberHead?: {parts: unknown[]};
  }) => {
    saved.onChange = props.onChange;
    saved.contents = props.initialContents;
    saved.memberHead = props.memberHead;
    return <div data-testid="blocks" />;
  },
}));
// A member's picture is a Blockly workspace, which jsdom cannot lay out; what
// it is called is what is asked about.
vi.mock('../MemberPicture', () => ({
  MemberPicture: ({label}: {label: string}) => (
    <span role="img" aria-label={label} />
  ),
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
    open(
      JSON.stringify({
        blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Player'}}]},
      }),
    );
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
    // The project, as a rename writes it, so what placements set it to goes
    // with it (`selfProperties.deletePropertyInProject`).
    const deleted = replaceSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(
      JSON.parse(deleted.source.files[PLAYER_ID].contents).properties,
    ).toBeUndefined();
    SOURCE = shipped;
  });

  it('keeps focus with a property through a rename and a delete', () => {
    const withProperties = (...names: string[]) =>
      JSON.stringify({
        ...JSON.parse(PLAYER),
        properties: names.map(name => ({
          name,
          type: 'number',
          access: 'writable',
        })),
      });
    const shipped = SOURCE;
    SOURCE = {
      ...SOURCE,
      files: {
        ...SOURCE.files,
        [PLAYER_ID]: {
          ...SOURCE.files[PLAYER_ID],
          contents: withProperties('lives'),
        },
      },
    };
    const view = open(withProperties('lives'));
    const reopen = (contents: string) =>
      view.rerender(
        <ActorFileEditor
          fileId={PLAYER_ID}
          initialContents={contents}
          language="actor"
          isReadOnly={false}
          onChange={onChange}
        />,
      );

    // In place: the field, then back on Rename; Cancel, then back on Delete.
    fireEvent.click(screen.getByRole('button', {name: 'Rename lives'}));
    expect(screen.getByLabelText('Rename lives')).toHaveFocus();
    fireEvent.keyDown(screen.getByLabelText('Rename lives'), {key: 'Escape'});
    expect(screen.getByRole('button', {name: 'Rename lives'})).toHaveFocus();
    fireEvent.click(screen.getByRole('button', {name: 'Delete lives'}));
    expect(screen.getByRole('button', {name: 'Cancel'})).toHaveFocus();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(screen.getByRole('button', {name: 'Delete lives'})).toHaveFocus();

    // Renamed, the row comes back under its new name, and focus with it.
    fireEvent.click(screen.getByRole('button', {name: 'Rename lives'}));
    fireEvent.change(screen.getByLabelText('Rename lives'), {
      target: {value: 'hearts'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Save name'}));
    reopen(withProperties('hearts'));
    expect(screen.getByRole('button', {name: 'Rename hearts'})).toHaveFocus();

    // Deleted, focus goes to New property.
    fireEvent.click(screen.getByRole('button', {name: 'Delete hearts'}));
    fireEvent.click(
      within(screen.getByRole('group', {name: 'Delete hearts'})).getByRole(
        'button',
        {name: 'Delete'},
      ),
    );
    reopen(withProperties());
    expect(screen.getByLabelText('New property')).toHaveFocus();
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

  it('takes its icons as one tab stop, the arrows moving within it', () => {
    open(as({for: 'interface'}));
    const icon = (name: string) => screen.getByRole('button', {name});
    expect(icon('text')).toHaveAttribute('tabindex', '0');
    expect(icon('speech')).toHaveAttribute('tabindex', '-1');

    icon('text').focus();
    fireEvent.keyDown(icon('text'), {key: 'ArrowRight'});
    expect(document.activeElement).toBe(icon('speech'));
    expect(icon('speech')).toHaveAttribute('tabindex', '0');
    expect(icon('text')).toHaveAttribute('tabindex', '-1');
  });

  it('says what it is for, and offers no way to change it', () => {
    // Decided when it is made (specs/ACTORS_AS_DATA_PLAN.md).
    open();
    expect(screen.getByText('Game actor')).toBeInTheDocument();
    expect(screen.queryByLabelText('For')).toBeNull();
  });

  it('says so of an interface actor too', () => {
    open(as({for: 'interface'}));
    expect(screen.getByText('Interface actor')).toBeInTheDocument();
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
    const record = within(open(as({isData: true})).container);
    // …so it opens on what it adds, and Look says why it is empty.
    expect(record.getByRole('tab', {name: 'Blocks'})).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.click(record.getByRole('tab', {name: 'Look'}));
    expect(
      record.getAllByText(/is a record: it is kept and found/),
    ).not.toHaveLength(0);
  });
});

describe('Look and Blocks (specs/ACTOR_BLOCKS_PLAN.md, step 2)', () => {
  it('opens on Look, and Blocks shows its events and blocks', () => {
    open();
    expect(screen.getByRole('tab', {name: 'Look'})).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Look');
    expect(screen.getByLabelText('Looks like')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', {name: 'Blocks'}));

    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Blocks');
    expect(screen.queryByLabelText('Looks like')).toBeNull();
    expect(screen.getByRole('region', {name: 'Events'})).toBeInTheDocument();
    expect(screen.getByRole('region', {name: 'Blocks'})).toBeInTheDocument();
  });
});

describe('an event or block of its own (specs/ACTOR_BLOCKS_PLAN.md, step 3)', () => {
  const blocks = () =>
    fireEvent.click(screen.getByRole('tab', {name: 'Blocks'}));

  it('is made from New event, and opened on its page', () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));

    expect(written().members).toEqual([
      {id: 'event-1', kind: 'event', parts: [{kind: 'label', text: 'happens'}]},
    ]);
    const heading = screen.getByRole('heading', {name: 'Event: happens'});
    expect(document.activeElement).toBe(heading);
    // An event has nothing to do, so no implementation is asked for.
    expect(screen.queryByTestId('blocks')).toBeNull();
  });

  it('is renamed by its words, which the data takes', () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));

    fireEvent.change(screen.getByRole('textbox', {name: 'Word, part 1'}), {
      target: {value: 'is hurt'},
    });

    expect(written().members[0].parts).toEqual([
      {kind: 'label', text: 'is hurt'},
    ]);
  });

  it('writes nothing while the design has a problem', () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));
    onChange.mockClear();

    fireEvent.change(screen.getByRole('textbox', {name: 'Word, part 1'}), {
      target: {value: ''},
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/needs a word/);
  });

  it('opens a new block on its design, above what it does', () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New block'}));

    const design = screen.getByRole('region', {name: 'Design'});
    expect(document.activeElement).toBe(
      within(design).getByRole('heading', {name: 'Design'}),
    );
    expect(screen.getByRole('button', {name: 'Edit design'})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      screen.getByRole('heading', {name: 'Block: do something'}),
    ).toBeInTheDocument();
    expect(saved.memberHead?.parts).toEqual([
      {kind: 'label', text: 'do something'},
    ]);
    // The implementation's workspace is the block, at its head, alone.
    const roots = JSON.parse(saved.contents!).blocks.blocks as Array<{
      type: string;
      id?: string;
    }>;
    expect(roots).toEqual([
      expect.objectContaining({type: 'world_member_head', id: 'member-head'}),
    ]);
  });

  it('shuts its design, focus going back to Edit design', () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New block'}));

    fireEvent.click(screen.getByRole('button', {name: 'Close design'}));

    const toggle = screen.getByRole('button', {name: 'Edit design'});
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(toggle);
    expect(screen.queryByRole('region', {name: 'Design'})).toBeNull();
  });

  it('goes back to the Blocks tab, with focus on its Edit', () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));

    fireEvent.click(screen.getByRole('button', {name: 'Actor'}));

    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Edit when Player happens'}),
    );
  });

  it('is deleted once its uses are said, focus going to New', async () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));
    fireEvent.click(screen.getByRole('button', {name: 'Actor'}));
    showDialog.mockClear();

    fireEvent.click(
      screen.getByRole('button', {name: 'Delete when Player happens'}),
    );

    await waitFor(() => expect(written().members).toBeUndefined());
    expect(showDialog.mock.calls[0][0]).toMatchObject({
      title: 'Delete event',
      message: 'Delete “when Player happens”? No code uses it.',
    });
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'New event'}),
    );
  });

  it('is deleted from its own page, back on the Blocks tab', async () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));
    showDialog.mockClear();

    fireEvent.click(screen.getByRole('button', {name: 'Delete event'}));

    await waitFor(() => expect(written().members).toBeUndefined());
    expect(showDialog.mock.calls[0][0]).toMatchObject({title: 'Delete event'});
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', {name: 'New event'}),
      ),
    );
  });

  it('stays on its page when the delete is cancelled', async () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));
    showDialog.mockResolvedValueOnce({type: 'cancel', args: ''});

    fireEvent.click(screen.getByRole('button', {name: 'Delete event'}));

    await waitFor(() => expect(showDialog).toHaveBeenCalled());
    expect(
      screen.getByRole('button', {name: 'Delete event'}),
    ).toBeInTheDocument();
  });

  it('takes its uses to its new words when its page is left', () => {
    open();
    blocks();
    fireEvent.click(screen.getByRole('button', {name: 'New event'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Word, part 1'}), {
      target: {value: 'is hurt'},
    });
    // A screen that heard the event by its first words.
    const screenId = 'heard';
    const before = SOURCE;
    SOURCE = {
      ...SOURCE,
      files: {
        ...SOURCE.files,
        [PLAYER_ID]: {
          ...SOURCE.files[PLAYER_ID],
          contents: JSON.stringify(written()),
        },
        [screenId]: {
          id: screenId,
          name: 'heard.screen',
          folderId: '0',
          language: 'screen',
          contents: levelScreen({
            blocks: {
              languageVersion: 0,
              blocks: [{type: 'world_on_ActorsPlayer_HappensEvent'}],
            },
          }),
        },
      },
    };
    replaceSources.mockClear();

    try {
      fireEvent.click(screen.getByRole('button', {name: 'Actor'}));
      const renamed = replaceSources.mock.calls[0][0].source.files[screenId];
      expect(JSON.parse(renamed.contents).blocks.blocks.blocks[0].type).toBe(
        'world_on_ActorsPlayer_IsHurtEvent',
      );
    } finally {
      SOURCE = before;
    }
  });
});
