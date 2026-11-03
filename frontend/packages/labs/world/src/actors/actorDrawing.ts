// An actor's drawing on a page of its own (specs/DRAWING_PAGE_PLAN.md): its
// head (`drawingHead`) with the sizes in its sockets and the pen and shapes
// below it, and the actor's variables.

import {DRAWING_HEAD, DRAWING_HEAD_ID} from '../blockly/pageHeads';

import {
  actorDataOf,
  type ActorData,
  type ActorDrawing,
  type Block,
  type Socket,
} from './actorData';
import {withVariables} from './actorSteps';
import {ancestry} from './preview/drawingReader';

/** A drawing's size before anything asks the actor. */
const side = (): Socket => ({
  shadow: {type: 'math_number', fields: {NUM: 32}},
});

/** The trait that gives an actor a box. */
const BOX_TRAIT = 'Boxed#HasABoxTrait';

/** `⟨width|height⟩ of this actor`, over the 32 a socket holds when emptied. */
const boxSide = (name: 'Width' | 'Height'): Socket => ({
  ...side(),
  block: {
    type: `world_get_Boxed_${name}Property`,
    inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
  },
});

/**
 * A drawing with nothing drawn yet: as big as the actor's box when it has
 * one, since a box that is resized is a drawing that is redrawn to fit.
 */
export const emptyDrawing = (data?: ActorData): ActorDrawing =>
  data?.traits?.includes(BOX_TRAIT)
    ? {width: boxSide('Width'), height: boxSide('Height')}
    : {width: side(), height: side()};

/** The workspace the drawing is written on. */
export function drawingDocument(data: ActorData): string {
  const drawing = data.drawing ?? emptyDrawing(data);
  const variables = data.blocks?.variables;
  return JSON.stringify(
    {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: DRAWING_HEAD,
            id: DRAWING_HEAD_ID,
            x: 20,
            y: 20,
            fields: {NAME: data.name},
            inputs: {WIDTH: drawing.width, HEIGHT: drawing.height},
            ...(drawing.body ? {next: {block: drawing.body}} : {}),
          },
        ],
      },
      ...(variables ? {variables} : {}),
    },
    null,
    2,
  );
}

/** A drawing head as a workspace saves it, as far as it is read. */
interface SavedHead {
  type: string;
  inputs?: {WIDTH?: Socket; HEIGHT?: Socket};
  next?: {block?: Block};
}

/** The data with what that workspace saved: the sizes, the body, the variables. */
export function withDrawingDocument(data: ActorData, saved: string): ActorData {
  let document: {blocks?: {blocks?: SavedHead[]}; variables?: unknown[]};
  try {
    document = JSON.parse(saved);
  } catch {
    return data;
  }
  const head = (document.blocks?.blocks ?? []).find(
    root => root.type === DRAWING_HEAD,
  );
  if (!head) {
    return data;
  }
  const body = head.next?.block;
  const drawing: ActorDrawing = {
    width: head.inputs?.WIDTH ?? side(),
    height: head.inputs?.HEIGHT ?? side(),
    ...(body ? {body} : {}),
  };
  const next =
    JSON.stringify(drawing) === JSON.stringify(data.drawing)
      ? data
      : {...data, drawing};
  return withVariables(next, document.variables);
}

/** Where an actor that draws as another gets its drawing: the nearest that has one. */
export interface Inherited {
  /** The actor it is drawn as, by name. */
  name: string;
  drawing: ActorDrawing;
  /** The variables its drawing's blocks name, as that actor declares them. */
  variables: unknown[];
}

/**
 * The drawing an actor without one of its own draws with: the nearest actor
 * it acts like that has one, as the builder resolves it (`actsLike`).
 */
export function inheritedDrawing(
  files: Readonly<Record<string, string>>,
  modulePath: string,
): Inherited | undefined {
  for (const path of ancestry(files, modulePath).slice(1)) {
    const data = actorDataOf(files[`${path}.actor`] ?? '');
    if (data?.drawing) {
      const named = JSON.stringify(data.drawing);
      return {
        name: data.name,
        drawing: data.drawing,
        variables: ((data.blocks?.variables ?? []) as Array<{id?: string}>)
          .filter(one => one.id && named.includes(JSON.stringify(one.id)))
          .map(one => one as unknown),
      };
    }
  }
  return undefined;
}

/**
 * The data drawing on its own: a copy of the drawing it inherits, with the
 * variables the copy names that it does not already declare, or an empty
 * drawing when it inherits none.
 */
export function drawOwn(data: ActorData, inherited?: Inherited): ActorData {
  if (!inherited) {
    return {...data, drawing: emptyDrawing(data)};
  }
  const held = (data.blocks?.variables ?? []) as Array<{id?: string}>;
  const ids = new Set(held.map(one => one.id));
  const brought = inherited.variables.filter(
    one => !ids.has((one as {id?: string}).id),
  );
  return {
    ...data,
    drawing: structuredClone(inherited.drawing),
    ...(brought.length
      ? {blocks: {...data.blocks, variables: [...held, ...brought]}}
      : {}),
  };
}
