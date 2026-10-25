// Docking on a Screen in the editor (specs/DOCKING_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {
  dividerAt,
  dockChoices,
  dockedAt,
  dockSize,
  dockZones,
  dragDivider,
  fitLayout,
  isDocked,
  zoneAt,
} from '../docking';
import type {MapDoc} from '../mapModel';

/** A 320 by 320 screen: a Viewport docked to all of it, a Panel floating. */
const screen = (): MapDoc => ({
  type: 'map',
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  layout: {dock: 'game'},
  actors: [
    {
      type: 'actors/viewport',
      id: 'game',
      properties: {
        positional: {position: {x: 100, y: 100}},
        hasABox: {width: 30, height: 30},
      },
    },
    {
      type: 'actors/panel',
      id: 'hud',
      properties: {
        positional: {position: {x: 50, y: 50}},
        hasABox: {width: 200, height: 40},
      },
    },
  ],
});

const props = (doc: MapDoc, id: string) =>
  doc.actors.find(actor => actor.id === id)!.properties;

describe('a docked placement in the editor', () => {
  it('is kept in its region, middle and box', () => {
    const fitted = fitLayout(screen());
    expect(props(fitted, 'game')).toMatchObject({
      positional: {position: {x: 160, y: 160}},
      hasABox: {width: 320, height: 320},
    });
    // The floating one is left where it is.
    expect(props(fitted, 'hud')).toEqual(props(screen(), 'hud'));
    // …and a document already fitted is the same document.
    expect(fitLayout(fitted)).toBe(fitted);
    expect(isDocked(fitted, 'game')).toBe(true);
    expect(isDocked(fitted, 'hud')).toBe(false);
  });
});

describe('where a dragged placement can dock', () => {
  it('is the screen’s edges, and the sides of what is docked', () => {
    const zones = dockZones(screen(), 'hud');
    // Four edges, and four sides of the Viewport's region.
    expect(zones).toHaveLength(8);
    const edge = zoneAt(zones, {x: 160, y: 4})!;
    expect(edge.side).toBe('top');
    expect(edge.target).toBeUndefined();
    // Inside the Viewport's top quarter, past the screen's edge band.
    expect(zoneAt(zones, {x: 160, y: 40})).toMatchObject({
      target: 'game',
      side: 'top',
    });
    expect(zoneAt(zones, {x: 160, y: 160})).toBeUndefined();
  });

  it('is never beside itself', () => {
    const zones = dockZones(screen(), 'game');
    expect(zones.every(zone => zone.target !== 'game')).toBe(true);
  });

  it('fixes what is docked at its own box across the side', () => {
    const hud = screen().actors[1];
    expect(dockSize(hud, 'top')).toBe(40);
    expect(dockSize(hud, 'left')).toBe(200);
    expect(dockSize({type: 'actors/x', id: 'x'}, 'top')).toBe(48);
  });
});

describe('the line between two docked sides', () => {
  const barred = (): MapDoc => ({
    ...screen(),
    layout: {
      split: 'down',
      fixed: 'first',
      size: 40,
      first: {dock: 'hud'},
      second: {dock: 'game'},
    },
  });

  it('is found near where it is, and not far from it', () => {
    expect(dividerAt(barred(), {x: 100, y: 43}, 6)).toMatchObject({
      split: 'down',
      at: 40,
    });
    expect(dividerAt(barred(), {x: 100, y: 60}, 6)).toBeUndefined();
  });

  it('dragged, fixes its side where it is let go, within the region', () => {
    const line = dividerAt(barred(), {x: 100, y: 40}, 6)!;
    expect(dragDivider(barred(), line, {x: 100, y: 64}).layout).toMatchObject({
      size: 64,
    });
    expect(dragDivider(barred(), line, {x: 100, y: 900}).layout).toMatchObject({
      size: 320,
    });
  });

  it('measures a second fixed side from the far edge', () => {
    const doc: MapDoc = {
      ...screen(),
      layout: {
        split: 'down',
        fixed: 'second',
        size: 40,
        first: {dock: 'game'},
        second: {dock: 'hud'},
      },
    };
    const line = dividerAt(doc, {x: 100, y: 280}, 6)!;
    expect(dragDivider(doc, line, {x: 100, y: 260}).layout).toMatchObject({
      size: 60,
    });
  });
});

describe('docking from the inspector', () => {
  // specs/PURPOSE_PLAN.md, step 5: the zones a drag offers, as a list.
  it('offers the screen’s edges, and the sides of what is docked', () => {
    const choices = dockChoices(screen(), 'hud');
    expect(choices.map(choice => choice.label)).toEqual([
      'Along the top of the screen',
      'Along the bottom of the screen',
      'Down the left of the screen',
      'Down the right of the screen',
      'Above game',
      'Below game',
      'Left of game',
      'Right of game',
    ]);
  });

  it('offers nothing beside itself', () => {
    expect(
      dockChoices(screen(), 'game').filter(choice => choice.target),
    ).toEqual([]);
  });

  it('docks as a drop does, at its own box’s size across the side', () => {
    expect(dockedAt(screen(), 'hud', 'game', 'bottom').layout).toEqual({
      split: 'down',
      fixed: 'second',
      size: 40,
      first: {dock: 'game'},
      second: {dock: 'hud'},
    });
  });
});
