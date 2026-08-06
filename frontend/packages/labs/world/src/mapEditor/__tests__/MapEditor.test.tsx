// Resizing a map, from the editor's own controls.
//
// The model is pinned in mapModel.test; what this adds is the half a person
// touches — two number fields — and the two things about them that are easy to
// get wrong and invisible when they are: a field being cleared to type into is
// not a size, and shrinking a map is not a licence to delete what is now
// outside it.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {VIEWPORT_TILES} from '../../runtime/viewport';
import type {MapDoc} from '../mapModel';

/** The heavy half: a canvas, replaced by the document it was handed. */
vi.mock('../MapStage', () => ({
  MapStage: (props: {doc: MapDoc}) => (
    <div
      data-testid="stage"
      data-size={`${props.doc.size.width}x${props.doc.size.height}`}
      data-actors={props.doc.actors.length}
    />
  ),
}));

const SOURCE: MultiFileSource = {
  files: {},
  folders: {},
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
