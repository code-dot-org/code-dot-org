// The Label, PLAYED: two of one kind, two sizes, and words that fill the box.
//
// A Label is the base of the interface set — a Button is a Label that answers
// a press, a Speech Box is a Label that lets its line out slowly — so what is
// checked here is inherited by all of them (specs/UI_ACTORS.md).
//
// COMPILED AND RUN, because the claim is about instances. `width` and `height`
// are the Label's own properties and its drawing is sized from them; a
// structural test can see the property named in the file and cannot see
// whether the CANVAS is what reads it, which is the half that matters and the
// half that passed while broken when this was written the other way round.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {IntrinsicSizeProperty} from '../../engine/rules/spatial';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const label = stockActorById('label')!;
const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** `add actor ⟨Label⟩ do set width of ⟨this actor⟩ to ⟨w⟩`. */
const place = (width: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: 'actors/label'},
  inputs: {
    DO: {
      block: {
        type: 'world_set_ActorsLabel_WidthProperty',
        inputs: {ACTOR: me(), VALUE: number(width)},
      },
    },
  },
});

/** Two Labels of one kind, made two widths. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {block: {...place(200), next: {block: place(48)}}},
      },
    ],
  },
});

const project = () => {
  const withLabel = importStockActor(
    WORLD_SCENARIOS.empty.source,
    label,
  ).source;
  const main = Object.values(withLabel.files).find(
    file => file.name === 'main.world',
  )!;
  return projectFiles({
    ...withLabel,
    files: {...withLabel.files, [main.id]: {...main, contents: WORLD}},
  });
};

describe('a Label', () => {
  it('is as big as each one says it is', async () => {
    const {world} = await compileProject(project());
    // A frame, because the widths are set in the placement body and the actor
    // is placed before the body runs (`__tests__/drawingSize`).
    world.renderSnapshot();
    const boxes = [...world.actors].map(actor => {
      const size = actor.get(IntrinsicSizeProperty);
      return [size.x, size.y];
    });

    // Two Labels of ONE kind, two boxes — and the height is the one nobody
    // touched, so it is still the kind's default.
    expect(boxes).toEqual([
      [200, 24],
      [48, 24],
    ]);
  });

  it('paints each at its own width, wrapping into it', async () => {
    // The canvas follows the property, and so does the column the words are
    // laid into: a Label that drew at the kind's size and wrapped at the kind's
    // width would be the same picture twice.
    const {world} = await compileProject(project());
    const painted = world
      .renderSnapshot()
      .map(
        state =>
          (state as {drawing?: {width: number; commands: unknown[]}}).drawing,
      );

    expect(painted.map(drawing => drawing?.width)).toEqual([200, 48]);
    // …and the paragraph command carries that same column, which is what makes
    // a narrow Label wrap where a wide one does not.
    const columns = painted.map(
      drawing =>
        (drawing?.commands as Array<{op: string; wrapWidth?: number}>).find(
          command => command.op === 'text',
        )?.wrapWidth,
    );
    expect(columns).toEqual([200, 48]);
  });
});
