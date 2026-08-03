// The map popup's own job, which is not the canvas.
//
// It scopes the canvas to one actor type, decides whether a click adds or
// selects, and hands the arrangement back — or does not, when the learner
// cancels. The canvas itself is `MapStage` and is tested where it lives; here it
// is a stand-in that reports the props it was given.

import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {MapPlacement} from '../../blockly/mapPlacements';

let stageProps: Record<string, unknown> = {};
vi.mock('../MapStage', () => ({
  MapStage: (props: Record<string, unknown>) => {
    stageProps = props;
    return <div data-testid="map-stage" />;
  },
}));

const {MapPlacementsDialog} = await import('../MapPlacementsDialog');

const COIN: MapPlacement[] = [
  {id: 'c1', properties: {positional: {position: {x: 64, y: 96}}}},
];

const open = (
  props: Partial<React.ComponentProps<typeof MapPlacementsDialog>> = {},
) =>
  render(
    <MapPlacementsDialog
      name="Coin"
      type="actors/coin"
      placements={COIN}
      context={[{type: 'actors/ground', id: 'g1'}]}
      thumbnails={{}}
      schemas={{}}
      onDone={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );

describe('MapPlacementsDialog', () => {
  it('opens the canvas on this block’s placements, typed', () => {
    open();

    const doc = stageProps.doc as {actors: Array<{type: string; id: string}>};
    expect(doc.actors).toEqual([{...COIN[0], type: 'actors/coin'}]);
    // The rest of the world is handed over separately: drawn, not editable.
    expect(stageProps.context).toEqual([{type: 'actors/ground', id: 'g1'}]);
  });

  it('opens in select mode, and adds only when asked', () => {
    // Opening an arrangement to move one thing is the commoner errand, so a
    // click selects until the learner says otherwise.
    open();
    expect(stageProps.placing).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Add Coin'}));
    expect(stageProps.placing).toBe('actors/coin');

    fireEvent.click(screen.getByRole('button', {name: 'Stop adding'}));
    expect(stageProps.placing).toBeNull();
  });

  it('hands back what the canvas made of it, without the type', () => {
    const onDone = vi.fn();
    open({onDone});

    // What the canvas would report after placing a second one.
    const onDocChange = stageProps.onDocChange as (doc: unknown) => void;
    // Through `act`, because the dialog holds the document in state: without it
    // the Done click below would still see the arrangement it opened with.
    act(() =>
      onDocChange({
        type: 'map',
        tile: {width: 32, height: 32},
        actors: [
          {...COIN[0], type: 'actors/coin'},
          {id: 'c2', type: 'actors/coin'},
        ],
      }),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    expect(onDone).toHaveBeenCalledWith([COIN[0], {id: 'c2'}]);
  });

  it('leaves it as it was on cancel', () => {
    const onDone = vi.fn();
    const onCancel = vi.fn();
    open({onDone, onCancel});

    const onDocChange = stageProps.onDocChange as (doc: unknown) => void;
    act(() =>
      onDocChange({type: 'map', tile: {width: 32, height: 32}, actors: []}),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

    expect(onCancel).toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});
