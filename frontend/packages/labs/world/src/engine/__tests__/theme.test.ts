// A theme: named values, named bundles, and what happens when one is missing.
//
// The claim under test is the one the whole design turns on — a style resolves
// to VALUES before anything is drawn, so two themes over one drawing are two
// pictures and the texture cache says so (specs/STYLES_PLAN.md).

import {describe, expect, it} from 'vitest';

import type {Actor} from '../core/Actor';
import {drawingKey, type Pen} from '../core/drawing';
import {resolveTheme} from '../core/theme';
import type {World} from '../core/World';
import {ActorBuilder, PositionProperty, Vector, WorldBuilder} from '../index';
import {HasAStyleTrait, ThemeProperty} from '../rules/styled';

const MODERN = {
  name: 'Modern',
  tokens: {accent: '#3050a0', ink: '#ffffff', radius: 8},
  styles: {
    'button face': {
      fill: '$accent',
      stroke: null,
      corner: '$radius',
      weight: 'bold' as const,
      shadow: {color: '#000000', blur: 5, down: 2},
    },
    'chosen row': {fill: '$accent'},
  },
};

/** A world drawing one kind through a routine, with a theme lent to it. */
function themed(
  theme: unknown,
  draw: (actor: Actor, pen: Pen, world: World) => void,
) {
  const builder = new WorldBuilder({id: 'w', name: 'W'});
  const world = builder.getWorld();
  world.useTheme(theme);
  builder.addActor(
    new ActorBuilder({id: 'a', name: 'A'})
      .set(PositionProperty, new Vector(0, 0))
      .defineDrawing(20, 10, draw),
    'a',
    'label',
  );
  return world;
}

const commandsOf = (world: World) =>
  world.renderSnapshot()[0].drawing!.commands;

describe('reading a theme', () => {
  it('follows a token reference and keeps a literal', () => {
    const theme = resolveTheme(MODERN);
    expect(theme.styles.get('button face')).toMatchObject({
      fill: '#3050a0',
      corner: 8,
      weight: 'bold',
      shadow: {color: '#000000', blur: 5, offsetY: 2},
    });
    expect(theme.unresolved).toEqual([]);
  });

  it('tells absent from null, which is how styles compose', () => {
    // A field a style does not mention LEAVES THE PEN ALONE, so a second
    // style can change a fill and keep a corner. Without the distinction
    // every style would have to restate everything.
    const theme = resolveTheme(MODERN);
    const face = theme.styles.get('button face')!;
    const row = theme.styles.get('chosen row')!;
    expect(face.stroke).toBeNull(); // said out loud: no outline
    expect(row).not.toHaveProperty('stroke'); // not mentioned: keep it
    expect(row).not.toHaveProperty('corner');
  });

  it('keeps the name of a reference that named no token', () => {
    // A typo in a theme is ordinary; a typo that draws nothing and says
    // nothing is the failure this lab keeps meeting.
    const theme = resolveTheme({
      tokens: {accent: '#111111'},
      styles: {face: {fill: '$acccent', corner: '$radius'}},
    });
    expect(theme.unresolved).toEqual(['$acccent', '$radius']);
    // …and the rest of the style is still built.
    expect(theme.styles.has('face')).toBe(true);
  });

  it('survives a document that is nonsense', () => {
    // A theme that threw would take down every drawing in the world, which
    // is a worse answer to a typo than a button with no corner.
    expect(resolveTheme(undefined).styles.size).toBe(0);
    expect(resolveTheme('not a theme').styles.size).toBe(0);
    expect(resolveTheme({styles: {bad: null}}).styles.size).toBe(0);
  });

  it('does not chase a token that names another token', () => {
    // One hop. A token referring to a token is the start of the cascade this
    // is built to avoid, and following them makes a cycle a hang.
    const theme = resolveTheme({
      tokens: {a: '$b', b: '#123456'},
      styles: {face: {fill: '$a'}},
    });
    expect(theme.styles.get('face')!.fill).toBe('$b');
  });
});

describe('the cascade', () => {
  // THE WHOLE POINT OF THE RESHAPE. A drawing names a CLASS and never a file;
  // which file that class is looked up in is the world's, the map's, or the
  // placement's — so "this one button is the dangerous one" costs a property
  // on a placement rather than a second kind (specs/STYLES_PLAN.md).
  const FILES: Record<string, unknown> = {
    'styles/base': MODERN,
    'styles/danger': {
      extends: 'styles/base',
      styles: {'button face': {fill: '#b0303a'}},
    },
  };
  const findFile = (path: string) => FILES[path];

  /** A world on the base theme, holding one kind that paints its button. */
  const worldOnBase = () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const world = builder.getWorld();
    world.useTheme(MODERN, findFile);
    return {builder, world};
  };

  const kind = () =>
    new ActorBuilder({id: 'a', name: 'A'})
      .set(PositionProperty, new Vector(0, 0))
      .useTraits([HasAStyleTrait])
      .defineDrawing(20, 10, (actor: Actor, pen: Pen, world: World) => {
        pen.useStyle(world.styleFor(actor, 'button face'));
        pen.rectangle(0, 0, 20, 10);
      });

  const fillsOf = (world: World) =>
    world
      .renderSnapshot()
      .map(one => (one.drawing?.commands[0] as {fill?: string})?.fill);

  it('takes the world’s theme when nobody says otherwise', () => {
    const {builder, world} = worldOnBase();
    builder.addActor(kind(), 'a', 'label');
    expect(fillsOf(world)).toEqual(['#3050a0']);
  });

  it('takes the ACTOR’s own theme over the world’s', () => {
    const {builder, world} = worldOnBase();
    builder.addActor(kind().set(ThemeProperty, 'styles/danger'), 'a', 'label');
    // …and `danger` says only the one class, so `extends` is doing the rest.
    expect(fillsOf(world)).toEqual(['#b0303a']);
  });

  it('is two looks in ONE world, from one kind and one drawing', () => {
    // The case the first cut could not express at all: two Buttons, same
    // kind, same drawing, same `any ⟨Button⟩` — different files.
    const {builder, world} = worldOnBase();
    builder.addActor(kind(), 'plain', 'label');
    builder.addActor(
      kind().set(ThemeProperty, 'styles/danger'),
      'risky',
      'label',
    );
    expect(fillsOf(world).sort()).toEqual(['#3050a0', '#b0303a']);
  });

  it('falls through a theme that names no such file', () => {
    // A placement pointing at a theme somebody deleted takes its map's, which
    // is the world's here — visible and ordinary rather than blank.
    const {builder, world} = worldOnBase();
    builder.addActor(kind().set(ThemeProperty, 'styles/gone'), 'a', 'label');
    expect(fillsOf(world)).toEqual(['#3050a0']);
  });

  it('leaves an actor that never elected the trait alone', () => {
    // `use style` is a pen block and ANY drawing may write it, including one
    // on an actor with no theme of its own. Reading a property an actor does
    // not carry throws, and it would throw inside a drawing routine.
    const {builder, world} = worldOnBase();
    builder.addActor(
      new ActorBuilder({id: 'b', name: 'B'})
        .set(PositionProperty, new Vector(0, 0))
        .defineDrawing(20, 10, (actor: Actor, pen: Pen, other: World) => {
          pen.useStyle(other.styleFor(actor, 'button face'));
          pen.rectangle(0, 0, 20, 10);
        }),
      'b',
      'label',
    );
    expect(fillsOf(world)).toEqual(['#3050a0']);
  });
});

describe('drawing through one', () => {
  it('is two different pictures under two themes', () => {
    // THE CLAIM THE DESIGN TURNS ON. A style resolves to values before the
    // command is made, so the key changes with the theme. Carry the NAME into
    // the command instead and two themes hash to one key — and the second
    // world is served the first one's texture.
    const draw = (_actor: Actor, pen: Pen, world: World) => {
      pen.useStyle(world.styleNamed('button face'));
      pen.rectangle(0, 0, 20, 10);
    };
    const one = commandsOf(themed(MODERN, draw));
    const other = commandsOf(
      themed({...MODERN, tokens: {...MODERN.tokens, accent: '#a03030'}}, draw),
    );

    // …and the corner is clamped to half the box, as the pen always clamps it.
    expect(one[0]).toMatchObject({fill: '#3050a0', radius: 5});
    expect(other[0]).toMatchObject({fill: '#a03030'});
    expect(drawingKey(20, 10, one)).not.toBe(drawingKey(20, 10, other));
  });

  it('carries the whole bundle onto the shape', () => {
    const [box] = commandsOf(
      themed(MODERN, (_actor, pen, world) => {
        pen.useStyle(world.styleNamed('button face'));
        pen.rectangle(0, 0, 20, 10);
      }),
    );
    expect(box).toMatchObject({
      fill: '#3050a0',
      shadow: {color: '#000000', blur: 5, offsetY: 2},
    });
    // `stroke: null` in the file means no outline, and says it out loud.
    expect(box).not.toHaveProperty('stroke');
  });

  it('leaves the pen alone when the style is not there', () => {
    // A control that vanishes is a thing a learner cannot act on. Drawing in
    // the wrong colour is at least on the screen, and the theme keeps the
    // name so a sandbox can say which one was missing.
    const [box] = commandsOf(
      themed(MODERN, (_actor, pen, world) => {
        pen.fill('#00ff00');
        pen.useStyle(world.styleNamed('no such style'));
        pen.rectangle(0, 0, 20, 10);
      }),
    );
    expect(box).toMatchObject({fill: '#00ff00'});
  });

  it('keeps what a later style does not mention', () => {
    // `chosen row` says only a fill, so the corner the face set stays.
    const [box] = commandsOf(
      themed(MODERN, (_actor, pen, world) => {
        pen.useStyle(world.styleNamed('button face'));
        pen.useStyle(world.styleNamed('chosen row'));
        pen.rectangle(0, 0, 20, 10);
      }),
    );
    expect(box).toMatchObject({radius: 5, fill: '#3050a0'});
  });

  it('answers nothing at all for a world lent no theme', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
    expect(world.styleNamed('button face')).toBeUndefined();
    expect(world.currentTheme().name).toBe('');
  });
});
