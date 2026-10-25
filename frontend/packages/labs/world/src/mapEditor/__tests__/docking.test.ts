// Docking on a Screen in the editor (specs/DOCKING_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {dockSize, dockZones, fitLayout, isDocked, zoneAt} from '../docking';
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
