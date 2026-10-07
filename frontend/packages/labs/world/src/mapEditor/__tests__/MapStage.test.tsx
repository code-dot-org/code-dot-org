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

import {act, fireEvent, render, screen} from '@testing-library/react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {reveal} from '../../callouts/reveal';
import type {ActorSchema} from '../../runtime/messages';
import type {MapDoc, Vec} from '../mapModel';
import {extentOf} from '../mapModel';
import {MapStage} from '../MapStage';
import {handlePoint, rotationPoint} from '../rotatedResize';
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

/** The stage's props with the defaults filled, for a `render` or a `rerender`. */
const stageProps = (
  map: MapDoc,
  more: Partial<Parameters<typeof MapStage>[0]> = {},
  onDocChange = vi.fn(),
): Parameters<typeof MapStage>[0] => ({
  doc: map,
  onDocChange,
  placing: null,
  thumbnails: {},
  schemas: {},
  isReadOnly: false,
  ...more,
});

const mount = (
  map: MapDoc,
  more: Partial<Parameters<typeof MapStage>[0]> = {},
) => {
  const onDocChange = vi.fn();
  const view = render(<MapStage {...stageProps(map, more, onDocChange)} />);
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
    // With a way into scripts: the toggle is about their marks, and a stage
    // that offers no scripts offers no toggle.
    const view = mount(scripted(), {onEditScript: vi.fn()});
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

    fireEvent.click(view.getByRole('button', {name: 'Code'}));
    expect(onEditScript).toHaveBeenLastCalledWith('a');

    fireEvent.click(view.getByRole('button', {name: 'Map code'}));
    expect(onEditScript).toHaveBeenLastCalledWith(undefined);
  });

  it('offers no way in when nobody is listening', () => {
    const map = doc();
    const {canvas, ...view} = mount(map);
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));

    expect(view.queryByRole('button', {name: 'Code'})).toBeNull();
    expect(view.queryByRole('button', {name: 'Map code'})).toBeNull();
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
    // The PROPERTY, not its name: what setting one means differs by where
    // it came from (`WorldInspector`, specs/WORLD_RULE_FIELDS_PLAN.md).
    expect(onSetDefault).toHaveBeenCalledWith(
      expect.objectContaining({name: 'score'}),
      '30',
    );

    const hard = view.container.querySelector(
      'input[name="world-hard"]',
    ) as HTMLInputElement;
    fireEvent.click(hard);
    expect(onSetDefault).toHaveBeenCalledWith(
      expect.objectContaining({name: 'hard'}),
      'true',
    );

    // A placement selected takes its place.
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    expect(view.queryByTestId('world-inspector')).toBeNull();
  });

  it('lists a rule’s world properties too, grouped under the rule', () => {
    // The world's own first, loose, then each rule's under its name, as a
    // placement's traits are (specs/WORLD_RULE_FIELDS_PLAN.md).
    const onSetDefault = vi.fn();
    const target = {
      name: 'target score',
      type: 'number',
      value: '30',
      setter: 'world_set_Scoring_TargetScoreProperty',
      rule: 'Scoring',
    };
    const view = mount(doc(), {
      world: {
        header: {...header, properties: [...header.properties, target]},
        onRename: vi.fn(),
        onSetDefault,
      },
    });

    // Named for the setter, since two rules may both have a `strength`.
    const field = view.container.querySelector(
      'input[name="world-world_set_Scoring_TargetScoreProperty"]',
    ) as HTMLInputElement;
    expect(field.value).toBe('30');
    // The group says whose it is; the field itself does not.
    const group = field.closest('details') as HTMLElement;
    expect(group.querySelector('summary')).toHaveTextContent('Scoring');
    expect(view.getByText('Target score')).toBeInTheDocument();
    expect(view.queryByText(/\(Scoring\)/)).toBeNull();
    // The world's own are outside any group.
    expect(
      view.container
        .querySelector('input[name="world-score"]')
        ?.closest('details'),
    ).toBeNull();

    fireEvent.change(field, {target: {value: '45'}});
    fireEvent.blur(field);
    expect(onSetDefault).toHaveBeenCalledWith(target, '45');
  });

  it('shows a vector as the block’s dial, with the grid behind a click', () => {
    // The dial the block face draws and the grid the block field opens
    // (`VectorInput`); a change on the grid is written at once.
    const onSetDefault = vi.fn();
    const direction = {
      name: 'direction of gravity',
      type: 'vector',
      value: '0,1',
      setter: 'world_set_Gravity_DirectionOfGravityProperty',
      rule: 'Gravity',
    };
    const view = mount(doc(), {
      world: {
        header: {...header, properties: [direction]},
        onRename: vi.fn(),
        onSetDefault,
      },
    });
    const dial = view.container.querySelector(
      'button[name="world-world_set_Gravity_DirectionOfGravityProperty"]',
    ) as HTMLButtonElement;
    expect(dial).toHaveAttribute(
      'aria-label',
      'Direction of gravity: x 0, y 1',
    );
    expect(dial.querySelector('svg text')).toHaveTextContent('1');
    expect(dial).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(dial);
    expect(dial).toHaveAttribute('aria-expanded', 'true');
    // The grid's own exact fields, in the popover.
    const x = screen.getByLabelText('x') as HTMLInputElement;
    expect(x.value).toBe('0');
    fireEvent.change(x, {target: {value: '3'}});
    expect(onSetDefault).toHaveBeenCalledWith(direction, '3,1');
  });

  it('keeps the grid open across the commits a drag makes', () => {
    // A commit rewrites the file, and the header the stage hands down
    // changes; the inspector must follow it without remounting, or the
    // popover and the rule group close under the pointer.
    const onSetDefault = vi.fn();
    const direction = {
      name: 'direction of gravity',
      type: 'vector',
      value: '0,1',
      setter: 'world_set_Gravity_DirectionOfGravityProperty',
      rule: 'Gravity',
    };
    const world = (value: string) => ({
      header: {...header, properties: [{...direction, value}]},
      onRename: vi.fn(),
      onSetDefault,
    });
    const map = doc();
    const view = mount(map, {world: world('0,1')});
    const dial = () =>
      view.container.querySelector(
        'button[name="world-world_set_Gravity_DirectionOfGravityProperty"]',
      ) as HTMLButtonElement;
    const group = dial().closest('details') as HTMLDetailsElement;
    group.open = true;
    fireEvent.click(dial());
    fireEvent.change(screen.getByLabelText('x'), {target: {value: '3'}});
    expect(onSetDefault).toHaveBeenCalledWith(direction, '3,1');

    // What the parent does next: hand down the header the file now says.
    view.rerender(<MapStage {...stageProps(map, {world: world('3,1')})} />);
    expect(dial().closest('details')).toBe(group);
    expect(group.open).toBe(true);
    expect(dial()).toHaveAttribute('aria-expanded', 'true');
    expect((screen.getByLabelText('x') as HTMLInputElement).value).toBe('3');

    // …and a change from outside, which the fields must show all the same.
    view.rerender(<MapStage {...stageProps(map, {world: world('-1,0')})} />);
    expect(dial()).toHaveAttribute(
      'aria-label',
      'Direction of gravity: x -1, y 0',
    );
  });

  it('shows an angle as the block’s dial, with the ring behind a click', () => {
    const onSetDefault = vi.fn();
    const heading = {name: 'heading', type: 'angle', value: '45'};
    const view = mount(doc(), {
      world: {
        header: {...header, properties: [heading]},
        onRename: vi.fn(),
        onSetDefault,
      },
    });
    const dial = view.container.querySelector(
      'button[name="world-heading"]',
    ) as HTMLButtonElement;
    expect(dial).toHaveAttribute('aria-label', 'Heading: 45 degrees');
    expect(dial.querySelector('svg text')).toHaveTextContent('45°');

    fireEvent.click(dial);
    const box = screen.getByRole('textbox', {
      name: 'angle in degrees',
    }) as HTMLInputElement;
    expect(box.value).toBe('45');
    fireEvent.change(box, {target: {value: '270'}});
    expect(onSetDefault).toHaveBeenCalledWith(heading, '270');
  });

  it('shows a point as two number fields, as a placement’s position is', () => {
    const onSetDefault = vi.fn();
    const spawn = {name: 'spawn', type: 'point', value: '3,4'};
    const view = mount(doc(), {
      world: {
        header: {...header, properties: [spawn]},
        onRename: vi.fn(),
        onSetDefault,
      },
    });
    const y = view.container.querySelector(
      'input[name="world-spawn-y"]',
    ) as HTMLInputElement;
    expect(y.value).toBe('4');
    expect(view.getByText('Spawn X')).toBeInTheDocument();
    fireEvent.change(y, {target: {value: '7'}});
    fireEvent.blur(y);
    expect(onSetDefault).toHaveBeenCalledWith(spawn, '3,7');
  });

  it('is absent for a map that is no world', () => {
    const view = mount(doc());
    expect(view.queryByTestId('world-inspector')).toBeNull();
  });
});

describe('the camera strip', () => {
  // What cameras the thing being edited has declared, read from its blocks
  // (specs/SPACE_CAMERAS_PLAN.md, step 9a). Only offered when a script can be
  // opened, since opening it is the one thing the strip does.
  const chase = {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'world_on_Space_CreatedEvent',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            DO: {
              block: {
                type: 'world_define_camera',
                id: 'cam1',
                fields: {NAME: 'Chase'},
                inputs: {OWNER: {block: {type: 'world_this_actor'}}},
              },
            },
          },
        },
      ],
    },
  };

  it('lists the world’s cameras on a main map with nothing selected', () => {
    const view = mount(doc(), {
      onEditScript: vi.fn(),
      world: {
        header: {name: 'W', properties: []},
        onRename: vi.fn(),
        onSetDefault: vi.fn(),
      },
      worldCameras: [
        {id: 'c1', name: 'Wide', traits: ['Camera Follow#Follows']},
      ],
    });
    // Behind its toolbar button until asked for.
    expect(view.queryByTestId('camera-panel')).toBeNull();
    const toggle = view.getByRole('button', {name: 'Cameras'});
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(view.getByTestId('camera-panel')).toBeInTheDocument();
    expect(view.getByText('Wide')).toBeInTheDocument();
    expect(view.getByText(/Follows/)).toBeInTheDocument();
  });

  it('lists a placement’s own, read from its script, when it is selected', () => {
    const map = doc();
    map.actors[0] = {...map.actors[0], blocks: chase as never};
    const onEditScript = vi.fn();
    const {canvas, ...view} = mount(map, {onEditScript});
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    fireEvent.click(view.getByRole('button', {name: 'Cameras'}));
    expect(view.getByText('Chase')).toBeInTheDocument();

    fireEvent.click(view.getByRole('button', {name: 'Open code'}));
    expect(onEditScript).toHaveBeenCalledWith('a');
  });

  it('offers no cameras in App Builder, and no layers either', () => {
    // Left out rather than withheld: no lesson grants either to an app.
    const view = mount(doc(), {
      appBuilder: true,
      onEditScript: vi.fn(),
      world: {
        header: {name: 'W', properties: []},
        onRename: vi.fn(),
        onSetDefault: vi.fn(),
      },
      worldCameras: [{id: 'c1', name: 'Wide', traits: []}],
    });
    expect(view.queryByRole('button', {name: 'Cameras'})).toBeNull();
    expect(view.queryByRole('button', {name: 'Layers'})).toBeNull();
    // A lesson pointing at the strip finds nothing to open.
    let answer: unknown;
    act(() => {
      answer = reveal({kind: 'mapPanel', panel: 'layers'});
    });
    expect(answer).toBe(false);
    expect(view.queryByTestId('layer-panel')).toBeNull();
  });

  it('shows nothing on a level map with nothing selected, which has none', () => {
    const view = mount(doc(), {onEditScript: vi.fn()});
    expect(view.queryByTestId('camera-panel')).toBeNull();
    // …and offers no button for a list that would be empty by definition.
    expect(view.queryByRole('button', {name: 'Cameras'})).toBeNull();
  });
});

describe('a level, with nothing selected', () => {
  it('says nothing about a camera, because a map does not decide that', () => {
    // The field was "Camera follows", a dropdown of this map's placements. It is
    // gone: a map is data and where the view looks is logic, so a Viewport
    // decides — the world being the main Viewport — and its camera elects
    // `Follows` as the world's always has (specs/SPACE_CAMERAS_PLAN.md).
    //
    // A level in a hundred-level game should not have to configure a camera,
    // which is the argument that took a map's own events off it too
    // (specs/MAP_EVENTS_PLAN.md).
    const view = mount(doc());
    expect(view.getByTestId('map-inspector')).toBeInTheDocument();
    expect(
      view.container.querySelector('select[name="map-camera-follows"]'),
    ).toBeNull();
    expect(view.queryByLabelText('Camera follows')).toBeNull();
  });

  it('marks the map as a screen, and unmarks it back to absent', () => {
    // A dialog covers what is under it and a HUD does not, which is a fact
    // about the MAP (specs/MODALITY_PLAN.md). Unticking writes `undefined`
    // rather than `false`, so a map that is not a screen reads exactly as every
    // map written before the flag existed.
    const {written, ...view} = mount(doc());
    const box = view.getByLabelText('Covers what is under it');
    expect(box).not.toBeChecked();

    fireEvent.click(box);
    expect(written().modal).toBe(true);

    fireEvent.click(view.getByLabelText('Covers what is under it'));
    expect(written().modal).toBeUndefined();
    // …and the claim that is about the FILE rather than the object: `undefined`
    // is a key in memory and nothing at all once serialized, which is why
    // unticking leaves no trace rather than writing `false` into every map.
    expect(JSON.stringify(written())).not.toContain('modal');
  });

  it('never offers that on a world’s main map, which has nothing under it', () => {
    // A main map lives inside the `.world` file, so `load map` cannot name it
    // and nothing can ever be loaded over it — the flag could only ever be a
    // field nothing reads. It is absent by being in the MAP inspector: a main
    // map shows the world's instead.
    const main = mount(doc(), {
      world: {
        header: {name: 'W', properties: []},
        onRename: vi.fn(),
        onSetDefault: vi.fn(),
      },
    });
    expect(main.getByTestId('world-inspector')).toBeInTheDocument();
    expect(main.queryByLabelText('Covers what is under it')).toBeNull();
  });

  it('offers the theme on a level and on a world’s main map alike', () => {
    // Unlike the flag above: a world HAS a theme, and its main map is where it
    // is said. The field is one component in both inspectors, because it is one
    // question (`mapEditor/ThemeField`).
    const options = [['Neon', 'styles/neon'] as const];
    const {written, ...view} = mount(doc(), {themeOptions: options});
    const theme = () =>
      view.container.querySelector(
        'select[name="map-theme"]',
      ) as HTMLSelectElement;
    expect([...theme().options].map(option => option.text)).toEqual([
      '(the world’s)',
      'Neon',
      '(import…)',
    ]);

    fireEvent.change(theme(), {target: {value: 'styles/neon'}});
    expect(written().theme).toBe('styles/neon');

    const main = mount(doc(), {
      themeOptions: options,
      world: {
        header: {name: 'W', properties: []},
        onRename: vi.fn(),
        onSetDefault: vi.fn(),
      },
    });
    expect(
      main.container.querySelector('select[name="map-theme"]'),
    ).not.toBeNull();
  });

  it('gives way to a placement, and to the world on a main map', () => {
    const map = doc();
    const {canvas, ...view} = mount(map);
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
    expect(view.queryByTestId('map-inspector')).toBeNull();

    const main = mount(doc(), {
      world: {
        header: {name: 'W', properties: []},
        onRename: vi.fn(),
        onSetDefault: vi.fn(),
      },
    });
    expect(main.queryByTestId('map-inspector')).toBeNull();
  });
});

describe('what a gated lab withholds', () => {
  const layered = (): MapDoc => ({
    ...doc(),
    layers: [{id: 'sky'}, {id: 'main'}],
  });
  const select = (canvas: HTMLCanvasElement, map: MapDoc) => {
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
  };

  it('offers no way into a script without `onEditScript`, nor the marks’ toggle', () => {
    const map = doc();
    const {canvas, ...view} = mount(map);
    select(canvas, map);
    expect(view.queryByRole('button', {name: 'Code'})).toBeNull();
    expect(view.queryByRole('button', {name: 'Icons'})).toBeNull();
  });

  /** Focusable, inert, and described by a note that is really there. */
  const expectWithheld = (
    view: {container: HTMLElement},
    button: HTMLElement,
  ) => {
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // NOT `disabled`: that would take it out of the tab order, and a
    // keyboard would have no way to reach it and hear why.
    expect(button).not.toBeDisabled();
    const described = button.getAttribute('aria-describedby')!;
    expect(view.container.querySelector(`#${described}`)).toHaveTextContent(
      'Not unlocked yet',
    );
  };

  it('draws a withheld Script where it was, focusable and saying why', () => {
    // A learner looking round can tell what is not theirs yet from what does
    // not exist (specs/KINDS_FROM_THE_MAP_PLAN.md).
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas, ...view} = mount(map, {
      onEditScript,
      mapScriptLabel: 'Map code',
      withheld: new Set(['map-scripts'] as const),
    });
    select(canvas, map);
    const script = view.getByRole('button', {name: 'Code'});
    const mapScript = view.getByRole('button', {name: 'Map code'});
    expectWithheld(view, script);
    expectWithheld(view, mapScript);
    // Two ways in, two notes: an id names one element.
    expect(script.getAttribute('aria-describedby')).not.toBe(
      mapScript.getAttribute('aria-describedby'),
    );
    fireEvent.click(script);
    fireEvent.click(mapScript);
    expect(onEditScript).not.toHaveBeenCalled();
    // The marks are drawn either way, so their toggle still works.
    expect(view.getByRole('button', {name: 'Icons'})).toBeInTheDocument();
  });

  it('offers a placement no Layer in App Builder', () => {
    const map = layered();
    const {canvas, ...view} = mount(map, {appBuilder: true});
    select(canvas, map);
    expect(
      view.container.querySelector('select[name="actor-layer"]'),
    ).toBeNull();
  });

  it('shows the layer strip and a placement’s Layer unless withheld', () => {
    const map = layered();
    const {canvas, ...view} = mount(map);
    // Behind its toolbar button until asked for; the placement's own Layer
    // field needs no strip open.
    expect(view.queryByTestId('layer-panel')).toBeNull();
    fireEvent.click(view.getByRole('button', {name: 'Layers'}));
    expect(view.getByTestId('layer-panel')).toBeInTheDocument();
    select(canvas, map);
    expect(
      view.container.querySelector('select[name="actor-layer"]'),
    ).not.toBeNull();
  });

  it('offers where a placement holds on, and writes the choice', () => {
    // The trigger the interface spec named: one map, two windows of
    // different shapes (specs/ANCHORS_PLAN.md). Holding on to nothing is
    // said by saying nothing, so the field goes rather than being written
    // empty.
    const map = layered();
    const {canvas, onDocChange, ...view} = mount(map);
    select(canvas, map);
    const anchor = () =>
      view.container.querySelector(
        'select[name="actor-anchor"]',
      ) as HTMLSelectElement;

    expect([...anchor().options].map(option => option.value)).toContain(
      'bottom right',
    );

    fireEvent.change(anchor(), {target: {value: 'bottom right'}});
    const written = onDocChange.mock.calls.at(-1)?.[0] as MapDoc;
    expect(written.actors[0].anchor).toBe('bottom right');

    fireEvent.change(anchor(), {target: {value: ''}});
    const cleared = onDocChange.mock.calls.at(-1)?.[0] as MapDoc;
    expect('anchor' in cleared.actors[0]).toBe(false);
  });

  it('keeps the strip’s place when layers are withheld, and leaves the map as it is', () => {
    const map = layered();
    const {canvas, onDocChange, ...view} = mount(map, {
      withheld: new Set(['map-layers'] as const),
    });
    fireEvent.click(view.getByRole('button', {name: 'Layers'}));
    expect(view.queryByTestId('layer-panel')).toBeNull();
    expect(view.getByTestId('layer-panel-locked')).toHaveTextContent(
      'LayersNot unlocked yet',
    );
    select(canvas, map);
    expect(
      view.container.querySelector('select[name="actor-layer"]'),
    ).toBeNull();
    expect(onDocChange).not.toHaveBeenCalled();
  });
});

describe('from a placement to its kind', () => {
  const kinds = {'actors/coin': {name: 'Coin'}};
  const select = (canvas: HTMLCanvasElement, map: MapDoc) => {
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
  };

  it('offers Enhance and Open, named for the kind, and says which kind', () => {
    const map = doc();
    const onEnhanceKind = vi.fn();
    const onOpenKind = vi.fn();
    const {canvas, ...view} = mount(map, {kinds, onEnhanceKind, onOpenKind});
    select(canvas, map);

    fireEvent.click(view.getByRole('button', {name: 'Enhance Coin…'}));
    expect(onEnhanceKind).toHaveBeenCalledWith(map.actors[0].type);
    fireEvent.click(view.getByRole('button', {name: 'Open Coin'}));
    expect(onOpenKind).toHaveBeenCalledWith(map.actors[0].type);
  });

  it('offers neither for a kind with no file of its own', () => {
    const map = doc();
    const {canvas, ...view} = mount(map, {
      kinds: {},
      onEnhanceKind: vi.fn(),
      onOpenKind: vi.fn(),
    });
    select(canvas, map);
    expect(view.queryByRole('button', {name: /^Enhance/})).toBeNull();
    expect(view.queryByRole('button', {name: /^Open/})).toBeNull();
  });

  it('keeps each where it was when withheld, inert, with a note of its own', () => {
    const map = doc();
    const onEnhanceKind = vi.fn();
    const onOpenKind = vi.fn();
    const {canvas, ...view} = mount(map, {
      kinds,
      onEnhanceKind,
      onOpenKind,
      withheld: new Set(['map-enhance', 'map-open-kind'] as const),
    });
    select(canvas, map);
    const enhance = view.getByRole('button', {name: 'Enhance Coin…'});
    const openKind = view.getByRole('button', {name: 'Open Coin'});
    for (const button of [enhance, openKind]) {
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toBeDisabled();
      fireEvent.click(button);
    }
    expect(onEnhanceKind).not.toHaveBeenCalled();
    expect(onOpenKind).not.toHaveBeenCalled();
    // Each button names its OWN note, so two lessons cannot be confused.
    const notes = [enhance, openKind].map(
      button => button.getAttribute('aria-describedby')!,
    );
    expect(new Set(notes).size).toBe(2);
    for (const id of notes) {
      expect(view.container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('really disables Enhance on a read-only map, which is not a lesson’s doing', () => {
    const map = doc();
    const {canvas, ...view} = mount(map, {
      kinds,
      onEnhanceKind: vi.fn(),
      onOpenKind: vi.fn(),
      isReadOnly: true,
    });
    // Read-only refuses the click that selects, so say which is selected.
    select(canvas, map);
    expect(view.queryByRole('button', {name: 'Enhance Coin…'})).toBeNull();
  });
});

describe('Show me, on the stage', () => {
  const kinds = {'actors/coin': {name: 'Coin'}};
  const handlers = {kinds, onEnhanceKind: vi.fn(), onOpenKind: vi.fn()};

  it('selects a placement of the kind it names, so its properties exist', () => {
    const {selectedId, ...view} = mount(doc(), handlers);
    expect(selectedId()).toBeNull();
    let answer: unknown;
    act(() => {
      answer = reveal({kind: 'placement', named: 'Coin'});
    });
    expect(answer).toBe(true);
    expect(selectedId()).toBe('a');
    // …and what it selected for is there, marked as the place it is.
    expect(view.getByRole('button', {name: 'Enhance Coin…'})).toHaveAttribute(
      'data-callout',
      'map.enhance',
    );
    expect(view.getByRole('button', {name: 'Open Coin'})).toHaveAttribute(
      'data-callout',
      'map.openKind',
    );
  });

  it('keeps a selection that already answers to the name', () => {
    const {canvas, selectedId} = mount(doc(), handlers);
    // The second Coin, by the keyboard: right, then right again.
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});
    const chosen = selectedId();
    act(() => {
      reveal({kind: 'placement', named: 'Coin'});
    });
    expect(selectedId()).toBe(chosen);
  });

  it('opens the layer strip for a lesson that points at it', () => {
    // `map.layers` in a lesson: the strip starts hidden behind its button,
    // and "show me" opens it rather than ringing nothing.
    const view = mount(doc());
    expect(view.queryByTestId('layer-panel')).toBeNull();
    let answer: unknown;
    act(() => {
      answer = reveal({kind: 'mapPanel', panel: 'layers'});
    });
    expect(answer).toBe(true);
    expect(view.getByTestId('layer-panel')).toHaveAttribute(
      'data-callout',
      'map.layers',
    );
    expect(view.getByRole('button', {name: 'Layers'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('says no when the map has nothing by that name', () => {
    mount(doc(), handlers);
    let answer: unknown;
    act(() => {
      answer = reveal({kind: 'placement', named: 'Dragon'});
    });
    expect(answer).toBe(false);
  });

  it('stops answering when it is gone', () => {
    const view = mount(doc(), handlers);
    view.unmount();
    expect(reveal({kind: 'placement'})).toBeUndefined();
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
  /** Mounted with the strip open, as a learner who wants it would have it. */
  const mountOpen = (...args: Parameters<typeof mount>) => {
    const mounted = mount(...args);
    fireEvent.click(mounted.getByRole('button', {name: 'Layers'}));
    return mounted;
  };

  /** `a` on the default, `b` on a Sky behind it. */
  const layered = (): MapDoc => {
    const map = doc();
    map.layers = [{id: 'layer1', name: 'Sky'}, {id: 'main'}];
    map.actors[1].layer = 'layer1';
    return map;
  };

  it('lists them front first, and adds one in front', () => {
    const {written, ...view} = mountOpen(layered());
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
    const {written, ...view} = mountOpen(layered(), {
      backgroundChoices: ['sky.png', 'hills.png'],
    });
    fireEvent.click(view.getByRole('button', {name: 'Sky'}));
    expect(view.getByTestId('layer-inspector')).toBeInTheDocument();

    const background = view.container.querySelector(
      'select[name="layer-background"]',
    ) as HTMLSelectElement;
    // What the project holds, between nothing and the way to more
    // (`LayerInspector`, specs/LOOK_PLAN.md).
    expect([...background.options].map(option => option.text)).toEqual([
      '(none)',
      'sky.png',
      'hills.png',
      '(import…)',
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
    const {written, ...view} = mountOpen(layered());
    expect(view.getByRole('button', {name: 'Remove'})).toBeDisabled();

    fireEvent.click(view.getByRole('button', {name: 'Sky'}));
    fireEvent.click(view.getByRole('button', {name: 'Remove'}));

    expect(written().layers!.map(layer => layer.id)).toEqual(['main']);
    expect(written().actors[1].layer).toBeUndefined();
  });

  it('moves the selected one forward', () => {
    const {written, ...view} = mountOpen(layered());
    fireEvent.click(view.getByRole('button', {name: 'Sky'}));
    fireEvent.click(view.getByRole('button', {name: 'Move layer forward'}));
    expect(written().layers!.map(layer => layer.id)).toEqual([
      'main',
      'layer1',
    ]);
  });

  it('places a new actor on the selected layer', () => {
    const map = layered();
    const {canvas, written, ...view} = mountOpen(map, {placing: 'actors/coin'});
    fireEvent.click(view.getByRole('button', {name: 'Sky'}));

    const at = screenPoint(map, {x: 6 * 32 + 5, y: 7 * 32 + 20});
    fireEvent.click(canvas, {clientX: at.x, clientY: at.y});

    expect(written().actors.at(-1)!.layer).toBe('layer1');
  });

  it('moves a placement to another layer from its inspector', () => {
    const map = layered();
    const {canvas, written, ...view} = mountOpen(map);
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
    const {canvas, ...view} = mountOpen(map);
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

describe('a placement’s angle', () => {
  /** A kind with a heading, as the sandbox would introspect one. */
  const HEADED_SCHEMA = {
    'actors/coin': [
      {
        name: 'Faces',
        props: [
          {
            ownerId: 'faces',
            propId: 'heading',
            name: 'heading',
            type: 'angle',
            default: 90,
          },
        ],
      },
    ],
  } as never;

  it('shows a vector as the dial too, and a point as two fields', () => {
    // A Viewport's scroll is a direction and a distance; a position is a
    // place, typed rather than pointed.
    const schemas = {
      'actors/coin': [
        {
          name: 'Viewport',
          props: [
            {
              ownerId: 'viewport',
              propId: 'scroll',
              name: 'scroll',
              type: 'vector',
              default: {x: 0, y: 0},
            },
            {
              ownerId: 'positional',
              propId: 'position',
              name: 'position',
              type: 'point',
              default: {x: 0, y: 0},
            },
          ],
        },
      ],
    } as never;
    const {canvas, written} = mount(doc(), {schemas});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'}); // select a
    expect(
      document.querySelector('input[name="prop-positional.position.x"]'),
    ).not.toBeNull();
    const dial = document.querySelector(
      'button[name="prop-viewport.scroll"]',
    ) as HTMLButtonElement;
    expect(dial).toHaveAttribute('aria-label', 'Scroll: x 0, y 0');

    fireEvent.click(dial);
    fireEvent.change(screen.getByLabelText('y'), {target: {value: '40'}});
    expect(
      written().actors.find(one => one.id === 'a')?.properties?.viewport,
    ).toEqual({scroll: {x: 0, y: 40}});
    expect(dial).toHaveAttribute('aria-label', 'Scroll: x 0, y 40');
  });

  it('is the block’s dial, and a turn of it is stored as a number', () => {
    // An angle came through the sandbox's schema as its own type and fell
    // to the plain text field, which stored what was typed as a string.
    const map = doc();
    const {canvas, written} = mount(map, {schemas: HEADED_SCHEMA});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'}); // select a
    const dial = document.querySelector(
      'button[name="prop-faces.heading"]',
    ) as HTMLButtonElement;
    expect(dial).toHaveAttribute('aria-label', 'Heading: 90 degrees');

    fireEvent.click(dial);
    const box = screen.getByRole('textbox', {
      name: 'angle in degrees',
    }) as HTMLInputElement;
    fireEvent.change(box, {target: {value: '180'}});
    expect(
      written().actors.find(one => one.id === 'a')?.properties?.faces,
    ).toEqual({heading: 180});
  });
});

// Resizing and turning, from the keyboard.
//
// THE KEYBOARD IS NOT A SHORTCUT FOR THE HANDLES, it is the other half of the
// same feature: the stage is a canvas, a canvas has no accessibility tree, and
// a drawn handle is reachable by a pointer and by nothing else. So these are
// the tests that say the feature is usable at all by somebody who cannot use
// one (specs/BOXES_PLAN.md).
describe('resizing and turning with the keyboard', () => {
  /** A kind with a box, as the sandbox would introspect one. */
  const BOXED_SCHEMA = {
    'actors/coin': [
      {
        name: 'Has a Box',
        props: [
          {
            ownerId: 'hasABox',
            propId: 'width',
            name: 'width',
            type: 'number',
            default: 64,
          },
          {
            ownerId: 'hasABox',
            propId: 'height',
            name: 'height',
            type: 'number',
            default: 32,
          },
        ],
      },
    ],
  } as never;

  const boxOf = (written: MapDoc, id: string) =>
    written.actors.find(one => one.id === id)?.properties?.hasABox;

  it('grows the selection with Alt and an arrow', () => {
    const map = doc();
    const {canvas, written} = mount(map, {schemas: BOXED_SCHEMA});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'}); // select a

    fireEvent.keyDown(canvas, {key: 'ArrowRight', altKey: true});
    // Its kind's default, plus one step — a placement that has never been
    // resized still reports the size it was built at.
    expect(boxOf(written(), 'a')).toEqual({width: 72, height: 32});
  });

  it('shrinks the other way, and stops before it vanishes', () => {
    const map = doc();
    const {canvas, written} = mount(map, {schemas: BOXED_SCHEMA});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});

    for (let press = 0; press < 20; press += 1) {
      fireEvent.keyDown(canvas, {key: 'ArrowLeft', altKey: true});
    }
    // Small enough to grab again is the only floor a box needs.
    expect(boxOf(written(), 'a')?.width).toBe(8);
  });

  it('leaves a kind with no box alone', () => {
    // Alt and an arrow on a Coin must not invent a width for it.
    const map = doc();
    const {canvas, onDocChange} = mount(map);
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});

    fireEvent.keyDown(canvas, {key: 'ArrowRight', altKey: true});
    expect(onDocChange).not.toHaveBeenCalled();
  });

  it('turns the selection with the brackets, wrapping round', () => {
    const map = doc();
    const {canvas, written} = mount(map, {schemas: BOXED_SCHEMA});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});

    fireEvent.keyDown(canvas, {key: ']'});
    expect(
      written().actors.find(one => one.id === 'a')?.properties?.positional
        ?.rotation,
    ).toBe(15);

    fireEvent.keyDown(canvas, {key: '['});
    fireEvent.keyDown(canvas, {key: '['});
    expect(
      written().actors.find(one => one.id === 'a')?.properties?.positional
        ?.rotation,
    ).toBe(345);
  });

  it('says what it did, because nothing on a canvas can be read', () => {
    const map = doc();
    const {canvas, getByTestId} = mount(map, {schemas: BOXED_SCHEMA});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'});

    fireEvent.keyDown(canvas, {key: 'ArrowDown', altKey: true});
    expect(getByTestId('stage-announcer')).toHaveTextContent('a is 64 by 40');

    fireEvent.keyDown(canvas, {key: ']'});
    expect(getByTestId('stage-announcer')).toHaveTextContent(
      'a turned to 15 degrees',
    );
  });

  it('tells a reader what the keys do', () => {
    const {canvas} = mount(doc());
    expect(canvas).toHaveAttribute('role', 'application');
    expect(canvas.getAttribute('aria-label')).toMatch(
      /Alt and an arrow resizes it/,
    );
  });
});

// …and the same two things with a pointer.
//
// The grips are painted on the canvas, so there is nothing to query: a test
// presses at the point `handlePoint` says the grip is at, which is the same
// answer the stage draws it at and hit-tests it with. One source for where a
// grip IS, rather than two that can drift (specs/BOXES_PLAN.md).
describe('resizing and turning with a pointer', () => {
  const BOXED = {
    'actors/coin': [
      {
        name: 'Has a Box',
        props: [
          {
            ownerId: 'hasABox',
            propId: 'width',
            name: 'width',
            type: 'number',
            default: 64,
          },
          {
            ownerId: 'hasABox',
            propId: 'height',
            name: 'height',
            type: 'number',
            default: 32,
          },
        ],
      },
    ],
  } as never;

  /** The selection's box, as the stage computes it: centred on the actor. */
  const boxAt = (pos: Vec) => ({
    center: pos,
    width: 64,
    height: 32,
    rotation: 0,
  });

  const select = (canvas: Element, map: MapDoc, pos: Vec) => {
    pointer(canvas, 'pointerdown', screenPoint(map, pos));
    pointer(canvas, 'pointerup', screenPoint(map, pos));
  };

  /** Grab the bottom-right grip, drag it by (dx, dy), let go. */
  const dragGrip = (
    canvas: Element,
    map: MapDoc,
    dx: number,
    dy: number,
    init: MouseEventInit = {},
  ) => {
    const grip = handlePoint(boxAt({x: 48, y: 48}), 'bottom-right');
    const to = screenPoint(map, {x: grip.x + dx, y: grip.y + dy});
    pointer(canvas, 'pointerdown', screenPoint(map, grip));
    pointer(canvas, 'pointermove', to, init);
    pointer(canvas, 'pointerup', to, init);
  };

  it('grows from the corner that was grabbed, onto the grid', () => {
    // The box is 64 by 32 about (48, 48), so the grabbed corner is at
    // (80, 64) and the drag takes it to (100, 74) — which snaps to the
    // crossing at (96, 64). Sixteen wider, no taller.
    const map = doc();
    const {canvas, written} = mount(map, {schemas: BOXED});
    select(canvas, map, {x: 48, y: 48});
    dragGrip(canvas, map, 20, 10);

    const after = written().actors.find(one => one.id === 'a');
    expect(after?.properties?.hasABox).toEqual({width: 80, height: 32});
    // Growing from a corner MOVES the middle: the far corner is what stays.
    expect(after?.properties?.positional?.position).toEqual({x: 56, y: 48});
  });

  it('puts the edge that moved ON a line', () => {
    // Which is the point of snapping the HANDLE rather than the size: the
    // far edge stays where it was, so only a moving edge can be made to line
    // up, and it is (specs/BOXES_PLAN.md).
    const map = doc();
    const {canvas, written} = mount(map, {schemas: BOXED});
    select(canvas, map, {x: 48, y: 48});
    dragGrip(canvas, map, 37, 3);

    const after = written().actors.find(one => one.id === 'a');
    const box = after?.properties?.hasABox as {width: number; height: number};
    const at = after?.properties?.positional?.position as Vec;
    expect(at.x + box.width / 2).toBe(128);
    expect((at.y + box.height / 2) % map.tile.height).toBe(0);
  });

  it('takes the pointer exactly when Alt says so', () => {
    // The same modifier that frees a drag and a turn frees a resize, and it
    // has to: a grid is a help until the thing being built is not on one.
    const map = doc();
    const {canvas, written} = mount(map, {schemas: BOXED});
    select(canvas, map, {x: 48, y: 48});
    dragGrip(canvas, map, 20, 10, {altKey: true});

    const after = written().actors.find(one => one.id === 'a');
    expect(after?.properties?.hasABox).toEqual({width: 84, height: 42});
    expect(after?.properties?.positional?.position).toEqual({x: 58, y: 53});
  });

  it('writes the map once, at the end of the drag', () => {
    // Every move writes in memory so the outline follows the pointer; writing
    // the map back recompiles the game and must happen once.
    const map = doc();
    const {canvas, onDocChange} = mount(map, {schemas: BOXED});
    select(canvas, map, {x: 48, y: 48});
    onDocChange.mockClear();

    const grip = handlePoint(boxAt({x: 48, y: 48}), 'right');
    pointer(canvas, 'pointerdown', screenPoint(map, grip));
    for (let step = 1; step <= 5; step += 1) {
      pointer(
        canvas,
        'pointermove',
        screenPoint(map, {
          x: grip.x + step * 4,
          y: grip.y,
        }),
      );
    }
    pointer(canvas, 'pointerup', screenPoint(map, {x: grip.x + 20, y: grip.y}));

    expect(onDocChange).toHaveBeenCalledTimes(1);
  });

  it('turns to where the turn grip is dragged, in steps', () => {
    const map = doc();
    const {canvas, written} = mount(map, {schemas: BOXED});
    select(canvas, map, {x: 48, y: 48});

    const grip = rotationPoint(boxAt({x: 48, y: 48}), 22 / camera(map).scale);
    pointer(canvas, 'pointerdown', screenPoint(map, grip));
    // Straight out to the right of the middle is a quarter turn.
    pointer(canvas, 'pointermove', screenPoint(map, {x: 148, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 148, y: 48}));

    expect(
      written().actors.find(one => one.id === 'a')?.properties?.positional
        ?.rotation,
    ).toBe(90);
  });

  it('leaves a kind with no box draggable as ever', () => {
    // No schema, so no grips: a press where one would be still selects and
    // drags the actor, which is what the stage did before any of this.
    const map = doc();
    const {canvas, written} = mount(map);
    select(canvas, map, {x: 48, y: 48});

    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointermove', screenPoint(map, {x: 112, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 112, y: 48}));

    const after = written().actors.find(one => one.id === 'a');
    expect(after?.properties?.hasABox).toBeUndefined();
    expect(after?.properties?.positional?.position).toEqual({x: 112, y: 48});
  });
});

// The records a map holds — what is in it that is not anywhere.
//
// A record has no position, so it cannot be placed, dragged or resized, and
// the canvas is the wrong shape for one. It lives in a list beside the canvas
// instead, with the same inspector and the same delete
// (specs/RECORDS_PLAN.md).
describe('the records panel', () => {
  /** A kind that said `is data`: no positional group in its schema. */
  const RECORD_SCHEMA = {
    'actors/note': [
      {
        trait: 'Note',
        traitName: 'Note',
        props: [
          {
            ownerId: 'Note',
            propId: 'text',
            name: 'text',
            type: 'string',
            default: '',
          },
        ],
      },
    ],
    // …and an ordinary kind beside it, which HAS a place.
    'actors/coin': [
      {
        trait: 'positional',
        traitName: 'Can Be Positioned',
        props: [
          {
            ownerId: 'positional',
            propId: 'position',
            name: 'position',
            type: 'vector',
            default: {x: 0, y: 0},
          },
        ],
      },
    ],
  } as never;

  const withRecord = (): MapDoc => ({
    ...doc(),
    actors: [
      ...doc().actors,
      // No position at all, which is what makes it a record in a map.
      {type: 'actors/note', id: 'Note-1'},
    ],
  });

  it('says nothing at all when the project has no record kinds', () => {
    const {queryByTestId} = mount(doc());
    expect(queryByTestId('record-panel')).toBeNull();
  });

  it('lists what the map holds that is nowhere', () => {
    const {getByTestId, getByRole} = mount(withRecord(), {
      schemas: RECORD_SCHEMA,
    });
    expect(getByTestId('record-panel')).toBeInTheDocument();
    expect(getByRole('button', {name: /Note-1/})).toBeInTheDocument();
  });

  it('leaves the placed actors off the list and the records off the canvas', () => {
    // The two halves of the same fact. The coins are on the canvas and not in
    // the panel; the note is in the panel and cannot be clicked on the map.
    const map = withRecord();
    const {canvas, getByTestId, queryByRole, selectedId} = mount(map, {
      schemas: RECORD_SCHEMA,
    });
    expect(queryByRole('button', {name: /^a/})).toBeNull();
    expect(getByTestId('record-panel')).toBeInTheDocument();

    // A press where a positionless placement would be if it were at the
    // origin selects nothing: the hit test skips one with no position.
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 0, y: 0}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 0, y: 0}));
    expect(selectedId()).toBeNull();
  });

  it('adds one with no position, which is what makes it a record', () => {
    const {getByRole, written} = mount(doc(), {schemas: RECORD_SCHEMA});
    fireEvent.click(getByRole('button', {name: 'Add Note'}));

    const added = written().actors.find(one => one.type === 'actors/note');
    expect(added).toBeTruthy();
    expect(added?.properties?.positional?.position).toBeUndefined();
  });

  it('selects one into the inspector, where it is edited like anything else', () => {
    const {getByRole, selectedId} = mount(withRecord(), {
      schemas: RECORD_SCHEMA,
    });
    fireEvent.click(getByRole('button', {name: /Note-1/}));
    expect(selectedId()).toBe('Note-1');
  });

  it('removes the selected one', () => {
    const {getByRole, written} = mount(withRecord(), {
      schemas: RECORD_SCHEMA,
    });
    fireEvent.click(getByRole('button', {name: /Note-1/}));
    fireEvent.click(getByRole('button', {name: 'Remove record'}));
    expect(written().actors.some(one => one.id === 'Note-1')).toBe(false);
  });
});

// The way into a placement's script from the canvas itself: a button floated
// beside the selection, a double-click, and Enter. All three follow the same
// gate as the inspector's Script button (`map-scripts`).
describe('a placement’s script, from the canvas', () => {
  /** A double-click at a world point, as the browser would give it. */
  const doubleClick = (canvas: HTMLCanvasElement, map: MapDoc, at: Vec) => {
    const {x, y} = screenPoint(map, at);
    fireEvent.doubleClick(canvas, {clientX: x, clientY: y});
  };
  const select = (canvas: HTMLCanvasElement, map: MapDoc) => {
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
  };
  /** The floating button, or null; found by its name inside the stage. */
  const floating = (view: {container: HTMLElement}) =>
    view.container.querySelector<HTMLButtonElement>(
      'button[aria-label^="Open the code of"]',
    );

  it('floats a Script button beside the selection, which opens it', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas, ...view} = mount(map, {onEditScript});
    expect(floating(view)).toBeNull();
    select(canvas, map);
    const button = floating(view)!;
    expect(button).toHaveAccessibleName('Open the code of a');
    // Placed by the stage in pixels, beside the selection.
    expect(button.style.left).toMatch(/px$/);
    expect(button.style.top).toMatch(/px$/);
    fireEvent.click(button);
    expect(onEditScript).toHaveBeenCalledWith('a');
  });

  it('opens the script of what is double-clicked, and selects it', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas, selectedId} = mount(map, {onEditScript});
    doubleClick(canvas, map, {x: 48, y: 48});
    expect(onEditScript).toHaveBeenCalledWith('a');
    expect(selectedId()).toBe('a');
  });

  it('opens nothing for a double-click on empty map', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas} = mount(map, {onEditScript});
    doubleClick(canvas, map, {x: 300, y: 300});
    expect(onEditScript).not.toHaveBeenCalled();
  });

  it('opens nothing while placing, where a double-click is two placements', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas, ...view} = mount(map, {
      onEditScript,
      placing: 'actors/coin',
    });
    doubleClick(canvas, map, {x: 48, y: 48});
    expect(onEditScript).not.toHaveBeenCalled();
    expect(floating(view)).toBeNull();
  });

  it('opens the selection’s script on Enter', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas} = mount(map, {onEditScript});
    fireEvent.keyDown(canvas, {key: 'ArrowRight'}); // select a
    fireEvent.keyDown(canvas, {key: 'Enter'});
    expect(onEditScript).toHaveBeenCalledWith('a');
  });

  it('offers none of them while scripts are withheld, or with no scripts', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const {canvas, ...view} = mount(map, {
      onEditScript,
      withheld: new Set(['map-scripts'] as const),
    });
    select(canvas, map);
    expect(floating(view)).toBeNull();
    doubleClick(canvas, map, {x: 48, y: 48});
    fireEvent.keyDown(canvas, {key: 'Enter'});
    expect(onEditScript).not.toHaveBeenCalled();

    const plain = mount(doc());
    select(plain.canvas, map);
    expect(floating(plain)).toBeNull();
  });
});

// The quick way to a section of one actor's own code: an event its kind can
// hear, picked from the inspector (`blockly/eventChoices`).
describe('adding an event to a placement', () => {
  const EVENTS = [
    {
      type: 'world_on_Mouse_IsClickedEvent',
      label: 'when … is clicked',
      drawer: 'Mouse',
    },
    {
      type: 'world_on_Space_CreatedEvent',
      label: 'when … is created',
      drawer: 'Space',
    },
  ];
  const select = (canvas: HTMLCanvasElement, map: MapDoc) => {
    pointer(canvas, 'pointerdown', screenPoint(map, {x: 48, y: 48}));
    pointer(canvas, 'pointerup', screenPoint(map, {x: 48, y: 48}));
  };

  it('lists what the kind can hear, adds the section, and opens its code', () => {
    const map = doc();
    const onEditScript = vi.fn();
    const eventsFor = vi.fn(() => EVENTS);
    const {canvas, written, ...view} = mount(map, {onEditScript, eventsFor});
    select(canvas, map);
    fireEvent.click(view.getByRole('button', {name: 'Add an event'}));
    expect(eventsFor).toHaveBeenCalledWith('actors/coin');
    expect(screen.getByText('Mouse')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', {name: 'when … is clicked'}));
    const a = written().actors.find(actor => actor.id === 'a')!;
    expect(a.blocks?.blocks?.blocks?.map(block => block.type)).toEqual([
      'world_on_Mouse_IsClickedEvent',
    ]);
    expect(onEditScript).toHaveBeenCalledWith('a');
  });

  it('is not offered while a placement’s code is withheld', () => {
    const map = doc();
    const {canvas, ...view} = mount(map, {
      onEditScript: vi.fn(),
      eventsFor: () => EVENTS,
      withheld: new Set(['map-scripts'] as const),
    });
    select(canvas, map);
    expect(view.queryByRole('button', {name: 'Add an event'})).toBeNull();
  });
});
