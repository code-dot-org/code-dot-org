// Resizing a map, from the editor's own controls.
//
// The model is pinned in mapModel.test; what this adds is the half a person
// touches — two number fields — and the two things about them that are easy to
// get wrong and invisible when they are: a field being cleared to type into is
// not a size, and shrinking a map is not a license to delete what is now
// outside it.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

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
    >
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
    '3': {
      id: '3',
      name: 'main.world',
      language: 'world',
      folderId: '7',
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
    '7': {id: '7', name: 'worlds', parentId: '0'},
  },
  openFiles: [],
};

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources: vi.fn(),
    sourcesEpoch: 0,
  }),
}));

vi.mock('../../runtime/WorldRuntimeContext', () => ({
  useWorldRuntime: () => ({getActorInfo: vi.fn(), hasCompiled: false}),
}));

const {MapEditor} = await import('../MapEditor');
const {worldFileDocument} = await import('../worldDocument');

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

describe('over a world’s file', () => {
  const WORLD = JSON.stringify({
    blocks: {blocks: [{type: 'world_world', fields: {NAME: 'W'}}]},
    map: {
      size: {width: 6, height: 5},
      tile: {width: 32, height: 32},
      actors: [{type: 'actors/coin', id: 'a', properties: {}}],
    },
  });

  const openWorld = () => {
    const onChange = vi.fn();
    const onOpenMapScript = vi.fn();
    render(
      <MapEditor
        fileId="3"
        initialContents={WORLD}
        language="world"
        isReadOnly={false}
        onChange={onChange}
        document={worldFileDocument}
        onOpenMapScript={onOpenMapScript}
      />,
    );
    return {onChange, onOpenMapScript};
  };

  it('shows the map beside the blocks', () => {
    openWorld();
    expect(screen.getByLabelText('Width')).toHaveValue(6);
    expect(screen.getByTestId('stage')).toHaveAttribute('data-actors', '1');
  });

  it('writes the map back with the blocks untouched', () => {
    const {onChange} = openWorld();
    fireEvent.change(screen.getByLabelText('Width'), {target: {value: '9'}});

    const file = JSON.parse(onChange.mock.calls.at(-1)![0] as string);
    expect(file.blocks.blocks[0].fields.NAME).toBe('W');
    expect(file.map.size).toEqual({width: 9, height: 5});
  });

  it('sends the map’s own script to the world instead', () => {
    const {onOpenMapScript} = openWorld();
    fireEvent.click(screen.getByRole('button', {name: 'Map script'}));
    expect(onOpenMapScript).toHaveBeenCalled();
    expect(screen.queryByTestId('script')).toBeNull();
  });

  it('shows the world with nothing selected, and writes its edits', () => {
    const {onChange} = openWorld();
    expect(screen.getByTestId('world-name')).toHaveTextContent('W');

    fireEvent.click(screen.getByRole('button', {name: 'Rename world'}));
    let file = JSON.parse(onChange.mock.calls.at(-1)![0] as string);
    expect(file.blocks.blocks[0].fields.NAME).toBe('Z');
    expect(file.map.actors).toHaveLength(1);
    expect(screen.getByTestId('world-name')).toHaveTextContent('Z');

    // A map edit after it keeps the rename.
    fireEvent.change(screen.getByLabelText('Width'), {target: {value: '7'}});
    file = JSON.parse(onChange.mock.calls.at(-1)![0] as string);
    expect(file.blocks.blocks[0].fields.NAME).toBe('Z');
    expect(file.map.size.width).toBe(7);
  });

  it('is not shown for a map that is no world', () => {
    open();
    expect(screen.queryByTestId('world-name')).toBeNull();
  });

  it('owns a placement’s script in the world’s module', () => {
    openWorld();
    fireEvent.click(screen.getByRole('button', {name: 'Script'}));
    expect(screen.getByTestId('script')).toHaveAttribute(
      'data-module',
      'worlds/main',
    );
  });
});
