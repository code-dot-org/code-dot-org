// The map stage, driven the way a person drives it.
//
// This file did not exist because it could not: jsdom gives a canvas no size
// and no drawing context, so the stage's camera never initialised and every
// gesture returned before doing anything. Two stubs change that. A
// `ResizeObserver` that reports a size the moment it is asked to observe
// gives the stage a pane, so the camera fits and a screen point means
// something; and a recording `getContext` gives it a context whose calls can
// be read back, so what the stage DRAWS can be asserted rather than what it
// computes on the way. Pointer events are `MouseEvent`s wearing pointer
// names, since jsdom has no `PointerEvent` and React routes by the name.
//
// Where a test says "at a's point" it has asked `stageGeometry` for the
// screen point of a world position through the camera `fitView` would give
// this pane — the same functions the stage uses, so a test and the stage
// cannot disagree about where anything is.

import {fireEvent, render} from '@testing-library/react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {ActorSchema} from '../../runtime/messages';
import type {MapDoc, Vec} from '../mapModel';
import {extentOf} from '../mapModel';
import {MapStage} from '../MapStage';
import {fitView, worldToScreen} from '../stageGeometry';

const PANE = {w: 800, h: 600};

/** The stage's own colors, for reading an outline's purpose back. */
const SELECT = '#4d9fff';
const REFERENCE = '#ffb454';

/** One recorded canvas call, with the stroke color in force at the time. */
interface Call {
  method: string;
  args: unknown[];
  strokeStyle: unknown;
  fillStyle: unknown;
}

let calls: Call[] = [];

/** A 2D context that remembers what was asked of it, and nothing else. */
const recordingContext = () => {
  const state: Record<string, unknown> = {};
  return new Proxy(
    {},
    {
      get: (_, prop: string) =>
        prop in state
          ? state[prop]
          : (...args: unknown[]) => {
              calls.push({
                method: prop,
                args,
                strokeStyle: state.strokeStyle,
                fillStyle: state.fillStyle,
              });
              return undefined;
            },
      set: (_, prop: string, value) => {
        state[prop] = value;
        return true;
      },
    },
  ) as unknown as CanvasRenderingContext2D;
};

const originals = {
  ResizeObserver: globalThis.ResizeObserver,
  getContext: HTMLCanvasElement.prototype.getContext,
  setPointerCapture: HTMLElement.prototype.setPointerCapture,
  releasePointerCapture: HTMLElement.prototype.releasePointerCapture,
};

beforeAll(() => {
  // A pane, the moment the stage asks how big it is.
  globalThis.ResizeObserver = class {
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(): void {
      this.callback(
        [
          {
            contentRect: {width: PANE.w, height: PANE.h},
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    }
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver;
  HTMLCanvasElement.prototype.getContext = (() =>
    recordingContext()) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
});

afterAll(() => {
  globalThis.ResizeObserver = originals.ResizeObserver;
  HTMLCanvasElement.prototype.getContext = originals.getContext;
  HTMLElement.prototype.setPointerCapture = originals.setPointerCapture;
  HTMLElement.prototype.releasePointerCapture = originals.releasePointerCapture;
});

beforeEach(() => {
  calls = [];
});

/**
 * The calls of the most recent frame.
 *
 * The stage redraws on every render, and a click is several renders — the
 * selection, then the inspector's fields seeding, then the gesture ending —
 * so the log holds several frames by the time a test reads it. A frame opens
 * by resetting the transform, which is the one call that means "from the
 * top", and only the last one is what is on screen.
 */
const lastFrame = (): Call[] => {
  const opens = calls
    .map((call, index) => ({call, index}))
    .filter(
      ({call}) =>
        call.method === 'setTransform' && call.args.join(',') === '1,0,0,1,0,0',
    );
  const start = opens.at(-1)?.index ?? 0;
  return calls.slice(start);
};

/** Ten tiles square, with a coin in cell (1,1) and another in cell (4,1). */
const doc = (): MapDoc => ({
  type: 'map',
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  actors: [
    {
      type: 'actors/coin',
      id: 'a',
      properties: {positional: {position: {x: 48, y: 48}}},
    },
    {
      type: 'actors/coin',
      id: 'b',
      properties: {positional: {position: {x: 144, y: 48}}},
    },
  ],
});

/** The camera the stage will have fitted, and a world point through it. */
const camera = (map: MapDoc) => fitView(PANE.w, PANE.h, extentOf(map));
const screenPoint = (map: MapDoc, pos: Vec) => worldToScreen(camera(map), pos);

/** A pointer event, as a mouse event of that name. */
const pointer = (
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  at: Vec,
  init: MouseEventInit = {},
) =>
  fireEvent(
    target,
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: at.x,
      clientY: at.y,
      button: 0,
      ...init,
    }),
  );

const mount = (
  map: MapDoc,
  more: Partial<Parameters<typeof MapStage>[0]> = {},
) => {
  const onDocChange = vi.fn();
  const view = render(
    <MapStage
      doc={map}
      onDocChange={onDocChange}
      placing={null}
      thumbnails={{}}
      schemas={{}}
      isReadOnly={false}
      {...more}
    />,
  );
  const canvas = view.container.querySelector('canvas')!;
  /** The inspector's id field, or null when nothing is selected. */
  const selectedId = () =>
    (
      view.container.querySelector(
        'input[name="actor-id"]',
      ) as HTMLInputElement | null
    )?.value ?? null;
  /** The last document written back. */
  const written = () => onDocChange.mock.calls.at(-1)?.[0] as MapDoc;
  return {canvas, onDocChange, selectedId, written, ...view};
};

describe('selecting', () => {
  it('selects the actor under a click and shows it in the inspector', () => {
    const map = doc();
    const {canvas, selectedId, onDocChange} = mount(map);
    expect(selectedId()).toBeNull();

    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));

    expect(selectedId()).toBe('a');
    // A bare select writes nothing: writing the map recompiles the game.
    expect(onDocChange).not.toHaveBeenCalled();
  });

  it('deselects on a click at nothing', () => {
    const map = doc();
    const {canvas, selectedId} = mount(map);
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    expect(selectedId()).toBe('a');

    pointer(canvas, 'pointerdown', screenPoint(map, {x: 240, y: 240}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 240, y: 240}));
    expect(selectedId()).toBeNull();
  });

  it('cycles the selection with the arrow keys, wrapping round', () => {
    const map = doc();
    const {canvas, selectedId} = mount(map);
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    expect(selectedId()).toBe('a');
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    expect(selectedId()).toBe('b');
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    expect(selectedId()).toBe('a');
    fireEvent.keyDown(canvas, {key: 'ArrowLeft'});
    expect(selectedId()).toBe('b');
  });
});

describe('moving', () => {
  it('drags an actor to the cell it is dropped in, and writes once', () => {
    const map = doc();
    const {canvas, onDocChange, written} = mount(map);
    const from = screenPoint(map, {x: 48, y: 48});
    // Two tiles to the right, in screen pixels through the camera.
    const to = screenPoint(map, {x: 48 + 64, y: 48});

    pointer(canvas, 'pointerdown', from);
    pointer(canvas, 'pointermove', {x: (from.x + to.x) / 2, y: from.y});
    pointer(canvas, 'pointermove', to);
    expect(onDocChange).not.toHaveBeenCalled(); // live, not yet committed
    pointer(canvas, 'pointerup', to);

    expect(onDocChange).toHaveBeenCalledTimes(1);
    const moved = written().actors.find(actor => actor.id === 'a')!;
    expect(moved.properties?.positional?.position).toEqual({x: 112, y: 48});
  });

  it('drops freely, to the pixel, with Alt held', () => {
    const map = doc();
    const {canvas, written} = mount(map);
    const from = screenPoint(map, {x: 48, y: 48});
    const to = screenPoint(map, {x: 53, y: 41});

    pointer(canvas, 'pointerdown', from);
    pointer(canvas, 'pointermove', to, {altKey: true});
    pointer(canvas, 'pointerup', to, {altKey: true});

    const moved = written().actors.find(actor => actor.id === 'a')!;
    expect(moved.properties?.positional?.position).toEqual({x: 53, y: 41});
  });

  it('nudges the selection a tile with Shift and an arrow', () => {
    // The keyboard's half of dragging: a canvas click is not reachable from a
    // keyboard, so an actor that could only be moved by one could only be
    // moved by some people.
    const map = doc();
    const {canvas, onDocChange, written} = mount(map);
    fireEvent.keyDown(canvas, {key: 'ArrowRight'}); // select a

    fireEvent.keyDown(canvas, {key: 'ArrowRight', shiftKey: true});
    expect(onDocChange).toHaveBeenCalledTimes(1);
    expect(
      written().actors.find(actor => actor.id === 'a')!.properties?.positional
        ?.position,
    ).toEqual({x: 80, y: 48});

    fireEvent.keyDown(canvas, {key: 'ArrowUp', shiftKey: true});
    expect(
      written().actors.find(actor => actor.id === 'a')!.properties?.positional
        ?.position,
    ).toEqual({x: 80, y: 16});
  });

  it('nudges a pixel with Alt as well', () => {
    const map = doc();
    const {canvas, written} = mount(map);
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});

    fireEvent.keyDown(canvas, {key: 'ArrowDown', shiftKey: true, altKey: true});
    expect(
      written().actors.find(actor => actor.id === 'a')!.properties?.positional
        ?.position,
    ).toEqual({x: 48, y: 49});
  });

  it('still cycles on a bare arrow, so the two do not collide', () => {
    const map = doc();
    const {canvas, onDocChange, selectedId} = mount(map);
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    expect(selectedId()).toBe('b');
    expect(onDocChange).not.toHaveBeenCalled();
  });
});

describe('removing and placing', () => {
  it('deletes the selection on Delete', () => {
    const map = doc();
    const {canvas, written, selectedId} = mount(map);
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    expect(selectedId()).toBe('a');

    fireEvent.keyDown(canvas, {key: 'Delete'});

    expect(written().actors.map(actor => actor.id)).toEqual(['b']);
    expect(selectedId()).toBeNull();
  });

  it('places the chosen kind at the clicked cell’s center', () => {
    const map = doc();
    const {canvas, written} = mount(map, {placing: 'actors/coin'});
    // Somewhere inside cell (6, 7): the actor lands on its center.
    const at = screenPoint(map, {x: 6 * 32 + 5, y: 7 * 32 + 20});
    fireEvent.click(canvas, {clientX: at.x, clientY: at.y});

    const placed = written().actors;
    expect(placed).toHaveLength(3);
    expect(placed[2].type).toBe('actors/coin');
    expect(placed[2].id).toMatch(/^coin-/);
    expect(placed[2].properties?.positional?.position).toEqual({
      x: 6 * 32 + 16,
      y: 7 * 32 + 16,
    });
  });

  it('does nothing to a read-only map', () => {
    const map = doc();
    const {canvas, onDocChange, selectedId} = mount(map, {isReadOnly: true});
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    expect(selectedId()).toBeNull();
    fireEvent.keyDown(canvas, {key: 'Delete'});
    expect(onDocChange).not.toHaveBeenCalled();
  });
});

describe('what it draws', () => {
  /** A guard whose `targets` name two other placements. */
  const withTargets = (): {
    map: MapDoc;
    schemas: Record<string, ActorSchema>;
  } => {
    const map = doc();
    map.actors = [
      {
        type: 'actors/guard',
        id: 'g',
        properties: {
          positional: {position: {x: 48, y: 144}},
          patrol: {targets: ['a', 'b']},
        },
      },
      ...map.actors,
    ];
    const schemas: Record<string, ActorSchema> = {
      'actors/guard': [
        {
          trait: 'patrol',
          traitName: 'Patrols',
          props: [
            {
              ownerId: 'patrol',
              propId: 'targets',
              name: 'targets',
              type: 'actors',
              default: [],
            },
          ],
        },
      ],
    };
    return {map, schemas};
  };

  it('outlines the selection, and every actor a set of its names', () => {
    // THE OUTLINING, which had never once been rendered under a test. A
    // reference is otherwise invisible — a name in a panel, pointing at
    // something that may be scrolled off the canvas — so drawing it is the
    // whole reason a map can hold one.
    const {map, schemas} = withTargets();
    const {canvas} = mount(map, {schemas});
    calls = [];

    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 144}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 144}));

    const frame = lastFrame();
    const outlines = frame.filter(call => call.method === 'strokeRect');
    expect(outlines.filter(call => call.strokeStyle === SELECT)).toHaveLength(
      1,
    );
    expect(
      outlines.filter(call => call.strokeStyle === REFERENCE),
    ).toHaveLength(2);
    // …and a labeled line to each, saying which property names it.
    const labels = frame
      .filter(call => call.method === 'fillText')
      .map(call => call.args[0]);
    expect(labels).toEqual(['targets', 'targets']);
  });

  it('lists the set in the inspector, and lets go of one', () => {
    const {map, schemas} = withTargets();
    const {canvas, getByLabelText, written} = mount(map, {schemas});
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 144}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 144}));

    fireEvent.click(getByLabelText('Remove a'));

    expect(
      written().actors.find(actor => actor.id === 'g')!.properties?.patrol
        ?.targets,
    ).toEqual(['b']);
  });

  it('edits a list of words in the inspector: add, type, remove', () => {
    // A Dropdown's `choices` is the first list a placement wanted to hold
    // (specs/LISTS.md). One field per row, with a way to add and remove.
    const map = doc();
    map.actors = [
      {
        type: 'actors/menu',
        id: 'm',
        properties: {
          positional: {position: {x: 48, y: 144}},
          Dropdown: {choices: ['ONE']},
        },
      },
    ];
    const schemas: Record<string, ActorSchema> = {
      'actors/menu': [
        {
          trait: 'actors/menu',
          traitName: 'Dropdown',
          props: [
            {
              ownerId: 'Dropdown',
              propId: 'choices',
              name: 'choices',
              type: 'words',
              default: [],
            },
          ],
        },
      ],
    };
    const {canvas, getByLabelText, written} = mount(map, {schemas});
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 144}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 144}));

    const choices = () =>
      written().actors[0].properties?.Dropdown?.choices as unknown[];

    fireEvent.click(getByLabelText('Add to choices'));
    expect(choices()).toEqual(['ONE', '']);

    const second = getByLabelText('Choices 2') as HTMLInputElement;
    fireEvent.change(second, {target: {value: 'TWO'}});
    fireEvent.blur(second);
    expect(choices()).toEqual(['ONE', 'TWO']);

    fireEvent.click(getByLabelText('Remove choices 1'));
    expect(choices()).toEqual(['TWO']);
  });

  it('draws nothing of the sort with nothing selected', () => {
    const {map, schemas} = withTargets();
    mount(map, {schemas});
    expect(
      lastFrame().filter(
        call =>
          call.method === 'strokeRect' &&
          (call.strokeStyle === SELECT || call.strokeStyle === REFERENCE),
      ),
    ).toHaveLength(0);
  });
});

describe('a placement with a script', () => {
  /** The corner mark's color (`MapStage.SCRIPT`). */
  const SCRIPT = '#7c4dff';
  const scripted = (): MapDoc => {
    const map = doc();
    map.actors[0].blocks = {blocks: {blocks: [{type: 'world_resume_game'}]}};
    return map;
  };
  /** The discs filled in the script color in the last frame. */
  const marks = () =>
    lastFrame().filter(
      call => call.method === 'fill' && call.fillStyle === SCRIPT,
    );

  it('wears a mark at its corner, and one that says nothing does not', () => {
    mount(scripted());
    expect(marks()).toHaveLength(1);
    // The mark is an arc: the disc, before the fill.
    const frame = lastFrame();
    const at = frame.findIndex(
      call => call.method === 'fill' && call.fillStyle === SCRIPT,
    );
    expect(frame.slice(0, at).some(call => call.method === 'arc')).toBe(true);
  });

  it('takes the marks off when the toolbar says so, and back on', () => {
    const view = mount(scripted());
    const toggle = view.getByRole('button', {name: 'Icons'});
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(marks()).toHaveLength(0);

    fireEvent.click(toggle);
    expect(marks()).toHaveLength(1);
  });

  it('opens its workspace from the inspector, and the map’s from the toolbar', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas, ...view} = mount(map, {onEditScript});
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));

    fireEvent.click(view.getByRole('button', {name: 'Script'}));
    expect(onEditScript).toHaveBeenLastCalledWith('a');

    fireEvent.click(view.getByRole('button', {name: 'Map script'}));
    expect(onEditScript).toHaveBeenLastCalledWith(undefined);
  });

  it('offers no way in when nobody is listening', () => {
    const map = doc();
    const {canvas, ...view} = mount(map);
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));

    expect(view.queryByRole('button', {name: 'Script'})).toBeNull();
    expect(view.queryByRole('button', {name: 'Map script'})).toBeNull();
  });

  it('renames what the other placements call it, when its id changes', () => {
    const map = doc();
    map.actors[1].blocks = {
      blocks: {
        blocks: [
          {
            type: 'world_remove_actor',
            inputs: {
              ACTOR: {block: {type: 'world_placement', fields: {NAME: 'a'}}},
            },
          },
        ],
      },
    };
    const {canvas, written, ...view} = mount(map);
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    const field = view.container.querySelector(
      'input[name="actor-id"]',
    ) as HTMLInputElement;

    fireEvent.change(field, {target: {value: 'coin'}});
    fireEvent.blur(field);

    const next = written();
    expect(next.actors.map(actor => actor.id)).toEqual(['coin', 'b']);
    expect(JSON.stringify(next.actors[1].blocks)).toContain('"NAME":"coin"');
    expect(JSON.stringify(next.actors[1].blocks)).not.toContain('"NAME":"a"');
  });
});

describe('the world, with nothing selected', () => {
  const header = {
    name: 'Tapper',
    properties: [
      {name: 'score', type: 'number', value: '0'},
      {name: 'hard', type: 'boolean', value: 'false'},
    ],
  };

  it('is shown until a placement is, and edits go back by name', () => {
    const map = doc();
    const onRename = vi.fn();
    const onSetDefault = vi.fn();
    const {canvas, ...view} = mount(map, {
      world: {header, onRename, onSetDefault},
    });
    expect(view.getByTestId('world-inspector')).toBeInTheDocument();

    const name = view.container.querySelector(
      'input[name="world-name"]',
    ) as HTMLInputElement;
    expect(name.value).toBe('Tapper');
    fireEvent.change(name, {target: {value: 'Clicker'}});
    fireEvent.blur(name);
    expect(onRename).toHaveBeenCalledWith('Clicker');

    const score = view.container.querySelector(
      'input[name="world-score"]',
    ) as HTMLInputElement;
    fireEvent.change(score, {target: {value: '30'}});
    fireEvent.keyDown(score, {key: 'Enter'});
    fireEvent.blur(score);
    expect(onSetDefault).toHaveBeenCalledWith('score', '30');

    const hard = view.container.querySelector(
      'input[name="world-hard"]',
    ) as HTMLInputElement;
    fireEvent.click(hard);
    expect(onSetDefault).toHaveBeenCalledWith('hard', 'true');

    // A placement selected takes its place.
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    expect(view.queryByTestId('world-inspector')).toBeNull();
  });

  it('is absent for a map that is no world', () => {
    const view = mount(doc());
    expect(view.queryByTestId('world-inspector')).toBeNull();
  });
});

describe('a Viewport on the map', () => {
  /** A 100 by 80 window at (160,160) showing `maps/level1`, and its schema. */
  const withViewport = (): {
    map: MapDoc;
    schemas: Record<string, ActorSchema>;
  } => {
    const map = doc();
    map.actors = [
      {
        type: 'actors/viewport',
        id: 'Game',
        properties: {
          positional: {
            position: {x: 160, y: 160},
            intrinsicSize: {x: 100, y: 80},
          },
          showsMap: {map: 'maps/level1'},
        },
      },
      ...map.actors,
    ];
    const schemas: Record<string, ActorSchema> = {
      'actors/viewport': [
        {
          trait: 'showsMap',
          traitName: 'Shows a Map',
          props: [
            {
              ownerId: 'showsMap',
              propId: 'map',
              name: 'map',
              type: 'string',
              default: '',
            },
          ],
        },
      ],
    };
    return {map, schemas};
  };
  const level = (): MapDoc => ({
    type: 'map',
    size: {width: 20, height: 10},
    tile: {width: 32, height: 32},
    actors: [
      {
        type: 'actors/coin',
        id: 'inside',
        properties: {positional: {position: {x: 30, y: 20}}},
      },
    ],
  });

  it('offers the project’s maps for its map, and writes the path', () => {
    const {map, schemas} = withViewport();
    const {canvas, written, ...view} = mount(map, {
      schemas,
      mapChoices: [
        ['Level1', 'maps/level1'],
        ['Menu', 'maps/menu'],
      ],
      sizes: {'actors/viewport': {width: 100, height: 80}},
    });
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 160, y: 160}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 160, y: 160}));

    const select = view.container.querySelector(
      'select[name="prop-showsMap.map"]',
    ) as HTMLSelectElement;
    expect([...select.options].map(option => option.text)).toEqual([
      '(none)',
      'Level1',
      'Menu',
    ]);
    expect(select.value).toBe('maps/level1');

    fireEvent.change(select, {target: {value: 'maps/menu'}});
    expect(
      written().actors.find(actor => actor.id === 'Game')!.properties?.showsMap
        ?.map,
    ).toBe('maps/menu');
  });

  it('draws what it holds inside its box, dimmed and clipped', () => {
    const {map, schemas} = withViewport();
    mount(map, {
      schemas,
      heldMaps: {Game: level()},
      sizes: {'actors/viewport': {width: 100, height: 80}},
    });

    const frame = lastFrame();
    // A clip the size of the box, then the held coin drawn at less than full
    // alpha. The recording context keeps no globalAlpha, so the clip and the
    // draw inside it are what say the level was drawn there.
    const clip = frame.findIndex(call => call.method === 'clip');
    expect(clip).toBeGreaterThan(0);
    const rect = frame
      .slice(0, clip)
      .reverse()
      .find(call => call.method === 'rect');
    expect(rect?.args).toEqual([-50, -40, 100, 80]);
    // …and something is drawn after the clip and before it is restored.
    const restore = frame.findIndex(
      (call, index) => index > clip && call.method === 'restore',
    );
    expect(
      frame
        .slice(clip, restore)
        .some(
          call => call.method === 'fillRect' || call.method === 'drawImage',
        ),
    ).toBe(true);
  });
});

describe('the map’s layers', () => {
  /** `a` on the default, `b` on a Sky behind it. */
  const layered = (): MapDoc => {
    const map = doc();
    map.layers = [{id: 'layer1', name: 'Sky'}, {id: 'main'}];
    map.actors[1].layer = 'layer1';
    return map;
  };

  it('lists them front first, and adds one in front', () => {
    const {written, ...view} = mount(layered());
    const rows = () =>
      [
        ...view
          .getByRole('list', {name: 'Layers, front first'})
          .querySelectorAll('button'),
      ].map(button => button.textContent);
    expect(rows()).toEqual(['Main', 'Sky']);

    fireEvent.click(view.getByRole('button', {name: 'Add'}));

    expect(written().layers!.map(layer => layer.id)).toEqual([
      'layer1',
      'main',
      'layer2',
    ]);
  });

  it('opens a layer’s inspector from its row, and writes what is set', () => {
    const {written, ...view} = mount(layered(), {
      backgroundChoices: ['sky.png', 'hills.png'],
    });
    fireEvent.click(view.getByRole('button', {name: 'Sky'}));
    expect(view.getByTestId('layer-inspector')).toBeInTheDocument();

    const background = view.container.querySelector(
      'select[name="layer-background"]',
    ) as HTMLSelectElement;
    expect([...background.options].map(option => option.text)).toEqual([
      '(none)',
      'sky.png',
      'hills.png',
    ]);
    fireEvent.change(background, {target: {value: 'sky.png'}});
    expect(written().layers![0].background).toEqual({sprite: 'sky.png'});

    const movesX = view.container.querySelector(
      'input[name="layer-parallax-x"]',
    ) as HTMLInputElement;
    fireEvent.change(movesX, {target: {value: '0.2'}});
    fireEvent.blur(movesX);
    expect(written().layers![0].parallax).toEqual({x: 0.2, y: 1});

    fireEvent.click(view.getByRole('button', {name: 'Close'}));
    expect(view.queryByTestId('layer-inspector')).toBeNull();
  });

  it('removes the selected one, and never the default', () => {
    const {written, ...view} = mount(layered());
    expect(view.getByRole('button', {name: 'Remove'})).toBeDisabled();

    fireEvent.click(view.getByRole('button', {name: 'Sky'}));
    fireEvent.click(view.getByRole('button', {name: 'Remove'}));

    expect(written().layers!.map(layer => layer.id)).toEqual(['main']);
    expect(written().actors[1].layer).toBeUndefined();
  });

  it('moves the selected one forward', () => {
    const {written, ...view} = mount(layered());
    fireEvent.click(view.getByRole('button', {name: 'Sky'}));
    fireEvent.click(view.getByRole('button', {name: 'Move layer forward'}));
    expect(written().layers!.map(layer => layer.id)).toEqual([
      'main',
      'layer1',
    ]);
  });

  it('places a new actor on the selected layer', () => {
    const map = layered();
    const {canvas, written, ...view} = mount(map, {placing: 'actors/coin'});
    fireEvent.click(view.getByRole('button', {name: 'Sky'}));

    const at = screenPoint(map, {x: 6 * 32 + 5, y: 7 * 32 + 20});
    fireEvent.click(canvas, {clientX: at.x, clientY: at.y});

    expect(written().actors.at(-1)!.layer).toBe('layer1');
  });

  it('moves a placement to another layer from its inspector', () => {
    const map = layered();
    const {canvas, written, ...view} = mount(map);
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));

    const select = view.container.querySelector(
      'select[name="actor-layer"]',
    ) as HTMLSelectElement;
    expect(select.value).toBe('main');
    fireEvent.change(select, {target: {value: 'layer1'}});

    expect(written().actors.find(actor => actor.id === 'a')!.layer).toBe(
      'layer1',
    );
  });

  it('offers no layer for a placement on a map with only the default', () => {
    const map = doc();
    const {canvas, ...view} = mount(map);
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    expect(
      view.container.querySelector('select[name="actor-layer"]'),
    ).toBeNull();
  });

  it('draws a layer’s background before what is on it, back to front', () => {
    const map = layered();
    map.layers![0].background = {sprite: 'sky.png'};
    const sky = {width: 64, height: 64} as HTMLImageElement;
    mount(map, {backgroundImages: {'sky.png': sky}});

    const frame = lastFrame();
    const backdrop = frame.findIndex(
      call => call.method === 'drawImage' && call.args[0] === sky,
    );
    expect(backdrop).toBeGreaterThan(-1);
    // Stretched over the map's rectangle, which is 320 square here.
    expect(frame[backdrop].args.slice(1)).toEqual([0, 0, 320, 320]);
    // `b` is on the Sky and `a` on the default in front of it: two
    // placeholders — the stage's green stand-in for a kind with no picture —
    // both after the backdrop.
    const sprites = frame
      .map((call, index) => ({call, index}))
      .filter(
        ({call}) => call.method === 'fillRect' && call.fillStyle === '#33cc66',
      );
    expect(sprites).toHaveLength(2);
    expect(sprites.every(({index}) => index > backdrop)).toBe(true);
  });
});
