// Resizing a map, from the editor's own controls.
//
// The model is pinned in mapModel.test; what this adds is the half a person
// touches — two number fields — and the two things about them that are easy to
// get wrong and invisible when they are: a field being cleared to type into is
// not a size, and shrinking a map is not a license to delete what is now
// outside it.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {VIEWPORT_TILES} from '../../runtime/viewport';
import type {MapDoc} from '../mapModel';

/**
 * The heavy half: a canvas, replaced by the document it was handed — and
 * the two ways into a workspace, as buttons.
 */
vi.mock('../MapStage', () => ({
  MapStage: (props: {
    doc: MapDoc;
    onEditScript?: (id: string | undefined) => void;
    withheld?: ReadonlySet<string>;
    kinds?: Record<string, {name: string}>;
    onEnhanceKind?: (type: string) => void;
    onOpenKind?: (type: string) => void;
    world?: {
      header: {name: string};
      onRename: (name: string) => void;
      onSetDefault: (property: string, value: string) => void;
    };
  }) => (
    <div
      data-testid="stage"
      data-size={`${props.doc.size.width}x${props.doc.size.height}`}
      data-actors={props.doc.actors.length}
      data-first-at={JSON.stringify(
        props.doc.actors[0]?.properties?.positional?.position ?? null,
      )}
      data-withheld={[...(props.withheld ?? [])].sort().join(' ')}
      data-kinds={Object.entries(props.kinds ?? {})
        .map(([type, kind]) => `${type}=${kind.name}`)
        .join(' ')}
    >
      <button
        type="button"
        onClick={() => props.onEnhanceKind?.('actors/coin')}
      >
        Enhance kind
      </button>
      <button type="button" onClick={() => props.onOpenKind?.('actors/coin')}>
        Open kind
      </button>
      <button type="button" onClick={() => props.onEditScript?.('a')}>
        Script
      </button>
      <button type="button" onClick={() => props.onEditScript?.(undefined)}>
        Map script
      </button>
      {props.world && (
        <>
          <span data-testid="world-name">{props.world.header.name}</span>
          <button type="button" onClick={() => props.world!.onRename('Z')}>
            Rename world
          </button>
          <button
            type="button"
            onClick={() => props.world!.onSetDefault('score', '30')}
          >
            Set score
          </button>
        </>
      )}
    </div>
  ),
}));

/**
 * The other heavy half: a Blockly workspace, replaced by its title, a way
 * back, and one edit it can report.
 */
/** What the shelf holds; absent, there is no progression at all. */
let shelf:
  | {
      holds: (unlock: {kind: string; id?: string}) => boolean;
      grantedBy: () => undefined;
    }
  | undefined;
vi.mock('../../progression/progressionContext', () => ({
  useMaybeProgression: () => shelf,
}));

vi.mock('../PlacementScriptEditor', () => ({
  PlacementScriptEditor: (props: {
    title: string;
    kind: string;
    mapModule: string;
    placements: readonly string[];
    contents: unknown;
    onChange: (next: unknown) => void;
    onBack: () => void;
  }) => (
    <div
      data-testid="script"
      data-kind={props.kind}
      data-module={props.mapModule}
      data-placements={props.placements.join(',')}
      data-contents={JSON.stringify(props.contents ?? null)}
    >
      <span>{props.title}</span>
      <button type="button" onClick={props.onBack}>
        Map
      </button>
      <button
        type="button"
        onClick={() =>
          props.onChange({blocks: {blocks: [{type: 'world_resume_game'}]}})
        }
      >
        Edit
      </button>
    </div>
  ),
}));

const SOURCE: MultiFileSource = {
  files: {
    '1': {
      id: '1',
      name: 'menu.map',
      language: 'map',
      folderId: '9',
      contents: '',
    },
    '4': {
      id: '4',
      name: 'main.screen',
      language: 'screen',
      folderId: '6',
      contents: '',
    },
    '5': {
      id: '5',
      name: 'pause.screen',
      language: 'screen',
      folderId: '6',
      contents: '',
    },
    '2': {
      id: '2',
      name: 'coin.actor',
      language: 'actor',
      folderId: '8',
      contents: JSON.stringify({
        blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Coin'}}]},
      }),
    },
  },
  folders: {
    '9': {id: '9', name: 'maps', parentId: '0'},
    '8': {id: '8', name: 'actors', parentId: '0'},
    '6': {id: '6', name: 'screens', parentId: '0'},
  },
  openFiles: [],
};

const updateSources = vi.fn();
/** What the level says; no level is a game, the default (`appBuilder`). */
let levelData: {worldView?: 'map' | 'world'} | undefined;
vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources,
    sourcesEpoch: 0,
  }),
  useMaybeLevelProperties: () => (levelData ? {levelData} : undefined),
}));

/** The Actor Creator's seam, answered with whatever a test says was made. */
let created: string | undefined;
const requestActorCreate = vi.fn(async () => created);
vi.mock('../../actors/create/actorCreate', () => ({
  requestActorCreate: () => requestActorCreate(),
}));

/** The lab's Enhance seam, answered by nobody here: what was asked is the test. */
const requestActorEnhance = vi.fn();
vi.mock('../../actors/enhance/actorEnhance', () => ({
  requestActorEnhance: (target: unknown) => requestActorEnhance(target),
}));

vi.mock('../../runtime/WorldRuntimeContext', () => ({
  useWorldRuntime: () => ({getActorInfo: vi.fn(), hasCompiled: false}),
}));

const {MapEditor} = await import('../MapEditor');
const {screenDocumentFor, screenFileDocument} = await import('../mapDocument');

/** A map with two actors in it, at the size every map used to be. */
const CONTENTS = JSON.stringify({
  type: 'map',
  size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
  tile: {width: 32, height: 32},
  actors: [
    {type: 'actors/coin', id: 'a', properties: {}},
    {type: 'actors/coin', id: 'b', properties: {}},
  ],
});

const open = () => {
  const onChange = vi.fn();
  render(
    <MapEditor
      fileId="1"
      initialContents={CONTENTS}
      language="map"
      isReadOnly={false}
      onChange={onChange}
    />,
  );
  return onChange;
};

/** The last document written back, parsed. */
const written = (onChange: ReturnType<typeof vi.fn>): MapDoc =>
  JSON.parse(onChange.mock.calls.at(-1)![0] as string) as MapDoc;

describe('MapEditor size controls', () => {
  it('shows another screen at the Main Screen’s size, with no size of its own', () => {
    // Arranged at 8 by 8, with a panel held in the middle: the game shows
    // every screen at the Main Screen's size (`World.loadScreen`), so that is
    // where it is drawn, and where its anchors put things.
    render(
      <MapEditor
        fileId="5"
        initialContents={JSON.stringify({
          type: 'map',
          size: {width: 8, height: 8},
          tile: {width: 32, height: 32},
          actors: [
            {
              type: 'actors/panel',
              id: 'Pause',
              anchor: 'center',
              properties: {positional: {position: {x: 128, y: 128}}},
            },
          ],
        })}
        language="screen"
        document={screenDocumentFor('screens/pause.screen')}
        isReadOnly={false}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText('Width')).toBeNull();
    const stage = screen.getByTestId('stage');
    expect(stage).toHaveAttribute(
      'data-size',
      `${VIEWPORT_TILES}x${VIEWPORT_TILES}`,
    );
    expect(stage).toHaveAttribute(
      'data-first-at',
      JSON.stringify({x: VIEWPORT_TILES * 16, y: VIEWPORT_TILES * 16}),
    );
  });

  it('opens at the size the map states', () => {
    open();

    expect(screen.getByLabelText('Width')).toHaveValue(VIEWPORT_TILES);
    expect(screen.getByLabelText('Height')).toHaveValue(VIEWPORT_TILES);
    expect(screen.getByTestId('stage')).toHaveAttribute(
      'data-size',
      `${VIEWPORT_TILES}x${VIEWPORT_TILES}`,
    );
  });

  it('resizes each axis on its own', () => {
    const onChange = open();

    fireEvent.change(screen.getByLabelText('Width'), {target: {value: '20'}});
    expect(written(onChange).size).toEqual({
      width: 20,
      height: VIEWPORT_TILES,
    });

    fireEvent.change(screen.getByLabelText('Height'), {target: {value: '4'}});
    expect(written(onChange).size).toEqual({width: 20, height: 4});
    expect(screen.getByTestId('stage')).toHaveAttribute('data-size', '20x4');
  });

  it('undoes the typing as one step, and redoes it', () => {
    // specs/SHELL_PLAN.md, step 5.
    const onChange = open();
    const undo = screen.getByRole('button', {name: 'Undo'});
    const redo = screen.getByRole('button', {name: 'Redo'});
    expect(undo).toBeDisabled();

    // Typing 1 then 2: two writes, one gesture.
    fireEvent.change(screen.getByLabelText('Width'), {target: {value: '1'}});
    fireEvent.change(screen.getByLabelText('Width'), {target: {value: '12'}});
    fireEvent.change(screen.getByLabelText('Height'), {target: {value: '4'}});
    expect(screen.getByTestId('stage')).toHaveAttribute('data-size', '12x4');

    fireEvent.click(undo);
    expect(screen.getByTestId('stage')).toHaveAttribute('data-size', '12x10');
    expect(screen.getByTestId('history-announcer')).toHaveTextContent(
      'Undid: changed the size',
    );
    fireEvent.click(undo);
    expect(written(onChange).size).toEqual({
      width: VIEWPORT_TILES,
      height: VIEWPORT_TILES,
    });
    expect(undo).toBeDisabled();

    fireEvent.click(redo);
    expect(screen.getByTestId('history-announcer')).toHaveTextContent(
      'Redid: changed the size',
    );
    fireEvent.click(redo);
    expect(written(onChange).size).toEqual({width: 12, height: 4});
    expect(redo).toBeDisabled();
  });

  it('keeps only the frame in the strip, not the map’s properties', () => {
    // "Theme" was here, beside the sizes. It is a property of the map rather
    // than the frame it is drawn inside, so it moved to the inspector with
    // nothing selected, where a reader looks for properties (`MapInspector`).
    open();
    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Height')).toBeInTheDocument();
    expect(screen.queryByLabelText('Theme')).toBeNull();
  });

  it('leaves the map alone while a field is empty', () => {
    // Clearing a field to type a new number is one keystroke. `Number('')` is
    // 0, so this once collapsed the map to a single tile mid-edit — and the
    // resize is what gets written to the file.
    const onChange = open();

    fireEvent.change(screen.getByLabelText('Width'), {target: {value: ''}});

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('stage')).toHaveAttribute(
      'data-size',
      `${VIEWPORT_TILES}x${VIEWPORT_TILES}`,
    );
  });

  it('keeps every placement when the map shrinks', () => {
    // Shrinking is how an author trims a map. Dropping the actors that fall
    // outside — silently, on a keystroke — would be the worse mistake: they are
    // visible past the border and can be dragged back or deleted deliberately.
    const onChange = open();

    fireEvent.change(screen.getByLabelText('Width'), {target: {value: '1'}});

    expect(written(onChange).actors).toHaveLength(2);
    expect(screen.getByTestId('stage')).toHaveAttribute('data-actors', '2');
  });

  it('will not take a size the canvas could not draw', () => {
    const onChange = open();

    fireEvent.change(screen.getByLabelText('Width'), {target: {value: '0'}});
    expect(written(onChange).size.width).toBe(1);

    fireEvent.change(screen.getByLabelText('Height'), {
      target: {value: '999999'},
    });
    expect(written(onChange).size.height).toBe(200);
  });
});

describe('a placement’s workspace, in the map’s place', () => {
  it('opens for the placement, titled by its name and kind', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Script'}));

    const script = screen.getByTestId('script');
    expect(script).toHaveAttribute('data-kind', 'placement');
    expect(script).toHaveAttribute('data-module', 'maps/menu');
    expect(script).toHaveAttribute('data-placements', 'a,b');
    expect(script).toHaveAttribute('data-contents', 'null');
    expect(screen.getByText('a (Coin)')).toBeInTheDocument();
    expect(screen.queryByTestId('stage')).toBeNull();
  });

  it('writes what the workspace holds onto the placement, and comes back', () => {
    const onChange = open();
    fireEvent.click(screen.getByRole('button', {name: 'Script'}));

    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));
    expect(written(onChange).actors[0].blocks).toEqual({
      blocks: {blocks: [{type: 'world_resume_game'}]},
    });
    expect(written(onChange).actors[1].blocks).toBeUndefined();

    fireEvent.click(screen.getByRole('button', {name: 'Map'}));
    expect(screen.getByTestId('stage')).toBeInTheDocument();
    expect(screen.queryByTestId('script')).toBeNull();
  });

  it('opens the map’s own workspace too, and writes onto the map', () => {
    const onChange = open();
    fireEvent.click(screen.getByRole('button', {name: 'Map script'}));

    const script = screen.getByTestId('script');
    expect(script).toHaveAttribute('data-kind', 'map');
    expect(script.querySelector('span')).toHaveTextContent('Map');

    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));
    expect(written(onChange).blocks).toEqual({
      blocks: {blocks: [{type: 'world_resume_game'}]},
    });
  });
});

describe('what a gated lab withholds', () => {
  const stage = () => screen.getByTestId('stage');

  it('is nothing when nothing gates the lab', () => {
    shelf = undefined;
    open();
    expect(stage()).toHaveAttribute('data-withheld', '');
  });

  it('is each affordance the shelf does not hold', () => {
    const held = new Set(['affordance:map-layers', 'affordance:map-enhance']);
    shelf = {
      holds: unlock => held.has(`${unlock.kind}:${unlock.id}`),
      grantedBy: () => undefined,
    };
    open();
    expect(stage()).toHaveAttribute(
      'data-withheld',
      'map-new-actor map-open-kind map-scripts',
    );
    shelf = undefined;
  });
});

describe('from the map to a kind', () => {
  it('tells the stage which kinds have a file, by the name each declares', () => {
    open();
    expect(screen.getByTestId('stage')).toHaveAttribute(
      'data-kinds',
      'actors/coin=Coin',
    );
  });

  it('asks the lab for the Enhance checklist on that kind’s file', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Enhance kind'}));
    expect(requestActorEnhance).toHaveBeenCalledWith({
      kind: 'actor',
      path: 'actors/coin',
      name: 'Coin',
    });
  });

  it('makes the kind’s file the active tab', () => {
    open();
    fireEvent.click(screen.getByRole('button', {name: 'Open kind'}));
    const written = updateSources.mock.calls.at(-1)![0] as {
      source: MultiFileSource;
    };
    expect(written.source.files['2'].active).toBe(true);
    expect(written.source.files['4'].active).not.toBe(true);
  });
});

describe('`Add New Actor` on the palette', () => {
  const tile = (name: string) => screen.getByRole('button', {name});
  beforeEach(() => requestActorCreate.mockClear());

  it('asks the lab for the Actor Creator, and takes the new kind in hand', async () => {
    shelf = undefined;
    created = 'actors/coin';
    open();
    expect(tile('Coin')).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(tile('Add New Actor'));
    expect(requestActorCreate).toHaveBeenCalled();
    // What was made is what is about to be placed.
    await vi.waitFor(() =>
      expect(tile('Coin')).toHaveAttribute('aria-pressed', 'true'),
    );
  });

  it('leaves the hand as it was when the learner backs out', async () => {
    created = undefined;
    open();
    fireEvent.click(tile('Add New Actor'));
    await Promise.resolve();
    expect(tile('Coin')).toHaveAttribute('aria-pressed', 'false');
  });

  it('is drawn disabled when the shelf withholds it', () => {
    shelf = {
      holds: unlock =>
        !(unlock.kind === 'affordance' && unlock.id === 'map-new-actor'),
      grantedBy: () => undefined,
    };
    open();
    // Where it was, focusable, inert, and saying why.
    const button = tile('Add New Actor');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(
      document.getElementById(button.getAttribute('aria-describedby')!),
    ).toHaveTextContent('Not unlocked yet');
    fireEvent.click(button);
    expect(requestActorCreate).not.toHaveBeenCalled();
    shelf = undefined;
  });
});

describe('Show me, while a script is open', () => {
  it('is refused a selection: a reveal never leaves a learner’s script', async () => {
    const {reveal} = await import('../../callouts/reveal');
    open();
    // With the map up, the (stand-in) stage answers nothing here.
    expect(reveal({kind: 'placement', named: 'Coin'})).toBeUndefined();

    fireEvent.click(screen.getByRole('button', {name: 'Script'}));
    expect(screen.getByTestId('script')).toBeInTheDocument();
    expect(reveal({kind: 'placement', named: 'Coin'})).toBe(false);

    fireEvent.click(screen.getByRole('button', {name: 'Map'}));
    expect(reveal({kind: 'placement', named: 'Coin'})).toBeUndefined();
  });

  it('marks the palette and its tiles as places', () => {
    open();
    expect(screen.getByRole('button', {name: 'Coin'})).toHaveAttribute(
      'data-callout',
      'map.palette:Coin',
    );
    expect(screen.getByRole('button', {name: 'Add New Actor'})).toHaveAttribute(
      'data-callout',
      'map.newActor',
    );
  });
});

describe('the Main Screen of a level whose work is in blocks', () => {
  const openScreen = () =>
    render(
      <MapEditor
        fileId="4"
        initialContents={CONTENTS}
        language="screen"
        isReadOnly={false}
        onChange={vi.fn()}
        document={screenFileDocument}
      />,
    );

  beforeEach(() => {
    levelData = undefined;
  });

  it('opens on the screen’s code, as a world opened on its World view', () => {
    levelData = {worldView: 'world'};
    openScreen();
    expect(screen.getByTestId('script')).toHaveAttribute('data-kind', 'screen');
  });

  it('opens on the screen itself otherwise', () => {
    openScreen();
    expect(screen.queryByTestId('script')).toBeNull();
  });
});
