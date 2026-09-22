// The interface kit, PLAYED: typed into, clicked, and answered.
//
// Every actor in the set is on this screen, and what is being checked is that
// they COMPOSE — a field takes the typing, a bar follows the field's own
// event, a button raises a click with no hit test anywhere, and a Speech Box
// says what the button asked it to, a letter at a time (specs/UI_ACTORS.md).
//
// Each of those is a seam between two files that were written apart, and the
// only place they are all in one world.

import {describe, expect, it} from 'vitest';

import {PositionProperty, Vector, type Actor} from '../engine';
import {PORTRAIT} from '../fixtures/interfaceKit';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';
import {TILE_SIZE} from '../runtime/viewport';

import {compileProject} from './support/compileProject';

const at = (world: {actors: Iterable<unknown>}, type: string) =>
  [...world.actors].find(one => (one as {type?: string}).type === type) as {
    get(p: unknown): unknown;
    act(a: unknown, ...rest: unknown[]): void;
  };

describe('the theme, through the whole path', () => {
  // THE ONLY TEST THAT TAKES IT END TO END, which is why it exists: the world
  // preamble, the generated `use theme` row, the bundler resolving a `.style`
  // import, the engine resolving `extends`, and a drawing asking for a class.
  //
  // Everything else exercises a piece. The reader tests read files off disk,
  // the engine tests hand `useTheme` a document already in hand, and the
  // theme tests only ever parse. Two bugs lived in the gap between them: the
  // bundler had never heard of `.style`, and `useTheme` was generated with no
  // way to find a theme BY PATH — so a file's `extends`, a map's theme and a
  // placement's all fell back to the base, silently (specs/STYLES_PLAN.md).
  const open = async () =>
    (await compileProject(projectFiles(WORLD_SCENARIOS.interface.source)))
      .world;

  /** The theme an actor is painted out of, which is the cascade's answer. */
  const themeFor = (world: unknown, actor: Actor) =>
    (
      world as {
        themeFor(a: Actor): {name: string; styles: Map<string, unknown>};
      }
    ).themeFor(actor);

  it('paints the kit out of the theme the world names', async () => {
    const world = await open();
    expect(world.currentTheme().name).toBe('Modern');
    // A class the drawings actually ask for, resolved.
    expect(world.styleNamed('button')).toMatchObject({fill: '#3050a0'});
  });

  it('answers a class for an actor, which is what a drawing asks', async () => {
    const world = await open();
    const button = at(world, 'actors/button') as unknown as Actor;
    expect(
      (world as unknown as {styleFor(a: Actor, n: string): unknown}).styleFor(
        button,
        'button',
      ),
    ).toMatchObject({fill: '#3050a0'});
  });

  /**
   * The project with its MAIN MAP edited — which is the world's own file now,
   * under `map` beside `blocks` (specs/MAIN_MAP_PLAN.md).
   */
  const withMainMap = (
    edit: (map: {
      theme?: string;
      actors: Array<{type: string; properties?: Record<string, unknown>}>;
    }) => void,
  ) => {
    const files = projectFiles(WORLD_SCENARIOS.interface.source);
    const path = Object.keys(files).find(one => one.endsWith('.world'))!;
    const world = JSON.parse(files[path]) as {
      map: Parameters<typeof edit>[0];
    };
    edit(world.map);
    return {...files, [path]: JSON.stringify(world)};
  };

  it('lets a MAP override the world, all the way through', async () => {
    // Compiled, not constructed: the field goes into the world's document,
    // the document into a module, the module into `loadMap`, and the load
    // remembers it for every actor it placed. A main map is a map — it
    // compiles to the same call a named one does.
    const {world} = await compileProject(
      withMainMap(map => {
        map.theme = 'styles/classic';
      }),
    );

    const button = at(world, 'actors/button') as unknown as Actor;
    expect(world.currentTheme().name).toBe('Modern');
    expect(themeFor(world, button).name).toBe('Classic');
  });

  it('lets a PLACEMENT override the map, and resolves its `extends`', async () => {
    // The third level, and the one that needs `extends` to mean anything:
    // `danger.style` holds one class and inherits the rest, so a button
    // pointed at it has to come out red AND keep its corner.
    const {world} = await compileProject(
      withMainMap(map => {
        map.theme = 'styles/classic';
        for (const placed of map.actors) {
          if (placed.type === 'actors/button') {
            placed.properties = {
              ...placed.properties,
              hasAStyle: {theme: 'styles/danger'},
            };
          }
        }
      }),
    );

    const button = at(world, 'actors/button') as unknown as Actor;
    const theme = themeFor(world, button);
    expect(theme.name).toBe('Danger');
    // Its own class…
    expect(theme.styles.get('button')).toMatchObject({fill: '#e06c75'});
    // …and one it never mentions, which only `extends` can have supplied.
    expect(theme.styles.get('ring')).toEqual(
      world.currentTheme().styles.get('ring'),
    );
  });

  it('knows every theme the project holds, by path', async () => {
    // The preamble's whole job. Without it `extends` cannot resolve, and
    // neither can a map's theme or a placement's — none of the three is a
    // path an import could have followed.
    const world = await open();
    const found = world as unknown as {
      themeAt?: unknown;
      defineTheme(p: string, d: unknown): void;
    };
    expect(found.defineTheme).toBeTypeOf('function');
    // Classic is in the project and is NOT the world's — so the only way to
    // see it is the registry.
    world.useTheme('styles/classic');
    expect(world.currentTheme().name).toBe('Classic');
    expect(world.styleNamed('button')).toMatchObject({fill: '#d4d0c8'});
  });
});

describe('the interface kit', () => {
  const open = async () => {
    const {world, modules} = await compileProject(
      projectFiles(WORLD_SCENARIOS.interface.source),
    );
    const text = modules['actors/label'].TextProperty;
    const fraction = modules['actors/progressBar'].FractionProperty;
    return {
      world,
      says: (type: string) => at(world, type).get(text) as string,
      filled: () => at(world, 'actors/progressBar').get(fraction) as number,
      click: (x: number, y: number) => {
        world.setPointer({x, y}, ['left']);
        world.tick(1 / 60);
        world.setPointer({x, y}, []);
        world.tick(1 / 60);
      },
      type: (characters: string[]) => {
        world.addTyped(characters);
        world.tick(1 / 60);
      },
    };
  };

  it('places one of each, saying what it ships with', async () => {
    const kit = await open();

    expect(kit.says('actors/label')).toBe('WHAT IS YOUR NAME?');
    expect(kit.says('actors/button')).toBe('SAY HELLO');
    // The field ships EMPTY, where a Label ships with words: a field whose
    // first keystroke has to delete something is a field with a bug in it.
    expect(kit.says('actors/textInput')).toBe('');
  });

  it('is a dialog: the form is the Panel’s, and goes where the Panel goes', async () => {
    // The title, the field, the button and the bar are the Panel's children
    // (specs/PARENTING.md): each is stored in the Panel's frame and lands
    // where the map editor and the game both put it. The test's clicks
    // above still land, because the Panel is at (160, 100) and the field
    // sits 20 above its middle.
    const {world} = await open();
    const actors = [...world.actors] as Actor[];
    const panel = actors.find(actor => actor.type === 'actors/panel')!;
    const field = actors.find(actor => actor.type === 'actors/textInput')!;
    expect(field.parent()).toBe(panel);
    expect(panel.children()).toHaveLength(7);
    const before = field.get(PositionProperty);
    expect([before.x, before.y]).toEqual([160, 80]);
    panel.set(PositionProperty, new Vector(200, 300));
    const after = field.get(PositionProperty);
    expect([after.x, after.y]).toEqual([200, 280]);
  });

  it('is seen through a phone-shaped window, on a map of the same size', async () => {
    // The one world in the library whose view is not the default: a form on
    // a square screen looks like a game with a form in it. The map is said
    // to match, so nothing reads a level shorter than its window.
    const {world} = await open();
    const view = world.viewSize();
    expect(view.y).toBeGreaterThan(view.x);
    expect({x: view.x, y: view.y}).toEqual({
      x: PORTRAIT.columns * TILE_SIZE,
      y: PORTRAIT.rows * TILE_SIZE,
    });
    expect(world.mapBounds()).toEqual(view);
  });

  it('takes the typing once the field is clicked, and moves the bar', async () => {
    // Two seams at once. The field takes what was TYPED, and the BAR follows —
    // which it can only do because the field raises `changed`, an event the
    // actor declares for itself and the world hears (`ActorBuilder.defineEvent`).
    const kit = await open();
    expect(kit.filled()).toBe(0);

    kit.click(160, 80);
    kit.type(['A', 'd', 'a']);

    expect(kit.says('actors/textInput')).toBe('Ada');
    // A FRAME LATER for the bar, and the reason is the event queue: `changed`
    // is raised from inside a handler, and an event raised while this tick's
    // events are being dispatched is delivered on the next one. That is what
    // keeps a handler from growing the list it is being walked from, and it
    // costs one frame — a sixtieth of a second, on a bar nobody is racing.
    expect(kit.filled()).toBe(0);
    kit.world.tick(1 / 60);
    expect(kit.filled()).toBeCloseTo(3 / 12, 5);
  });

  it('answers the button, a letter at a time', async () => {
    // The click needs no hit test written anywhere — `is clicked with` is
    // raised on the Button alone — and the Speech Box lets the line out on its
    // own timer rather than showing it whole.
    const kit = await open();
    kit.click(160, 80);
    kit.type(['A', 'd', 'a']);
    kit.click(160, 130);

    // Part way through after a quarter of a second: the whole line at once
    // would mean the typewriter never ran.
    for (let frame = 0; frame < 15; frame++) {
      kit.world.tick(1 / 60);
    }
    const part = kit.says('actors/speechBox');
    expect(part.length).toBeGreaterThan(0);
    expect('HELLO Ada'.startsWith(part)).toBe(true);
    expect(part).not.toBe('HELLO Ada');

    for (let frame = 0; frame < 120; frame++) {
      kit.world.tick(1 / 60);
    }
    expect(kit.says('actors/speechBox')).toBe('HELLO Ada');
  });

  it('does not take typing meant for nobody', async () => {
    // Clicking the button rather than the field leaves the field alone, which
    // is the clear-then-set the Mouse rule's ordering buys (`rules/mouse`).
    const kit = await open();
    kit.click(160, 130);
    kit.type(['x']);

    expect(kit.says('actors/textInput')).toBe('');
  });
});
