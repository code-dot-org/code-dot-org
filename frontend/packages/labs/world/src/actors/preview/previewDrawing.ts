// What a stock actor LOOKS like, before you have one.
//
// The import dialog says what each actor is in a sentence. A sentence is not a
// picture of a speech box, and a learner choosing between a Label, a Button and
// a Speech Box is choosing between three pictures.
//
// SO IT DRAWS THE ACTOR'S OWN DRAWING. A stock actor's file carries a `define
// drawing` — the same one the import copies — and this reads it into the
// `DrawCommand`s the engine would produce, which the DRIVER'S OWN painter then
// paints (`runtime/driver/drawingTextures.paintDrawing`). So the preview and
// the game are one painter, and what a preview can drift from is narrowed to
// this reading.
//
// WHY NOT RUN THE ACTOR. Because running one means compiling a module, which is
// the sandbox's job and a second or so of esbuild — for a picture of a thing
// nobody has imported yet. The drawings themselves are a closed vocabulary:
// six shapes, a pen, and values that are literals or property reads.
//
// A POSTER, NOT A SCREENSHOT, in exactly one place. A Health Bar reads the
// health of the actor it is POINTED AT, and points at nobody until a project
// wires it up — so its honest picture is an empty track, which advertises
// nothing. The preview answers "is anybody there?" with yes and reads the
// Health rule's own defaults, which is the bar a learner will see the moment
// they point it at something.

import {parseRuleMeta, type PropertyMeta} from '../../blockly/ruleMeta';
import type {DrawCommand, TextAnchor} from '../../engine/core/drawing';
import {STOCK_RULES} from '../../rules/stock';
import type {StockActor} from '../stock';

/** A block as it sits in a saved workspace. */
interface Node {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Node; shadow?: Node}>;
  next?: {block?: Node};
}

/** The drawing a preview paints. */
export interface PreviewDrawing {
  width: number;
  height: number;
  commands: DrawCommand[];
}

/** `world_get_Writing_TextProperty` → `['Writing', 'TextProperty']`. */
const READ = /^world_get_([A-Za-z0-9]+)_(.+)$/;
const WRITE = /^world_set_([A-Za-z0-9]+)_(.+)$/;

/** Every stock rule's declared properties, by the key a block type carries. */
const ruleDefaults = (): Map<string, PropertyMeta> => {
  const out = new Map<string, PropertyMeta>();
  for (const rule of STOCK_RULES) {
    const meta = parseRuleMeta(`rules/${rule.id}`, rule.contents);
    for (const property of meta?.properties ?? []) {
      // Keyed as the block type keys it: the rule's name without spaces, then
      // the property's export name (`domainBlocks.memberKey`).
      out.set(
        `${(meta?.name ?? '').replaceAll(' ', '')}_${property.ref.exportName}`,
        property,
      );
    }
  }
  return out;
};

/** Built once: nine actors ask the same question of the same twenty rules. */
let defaults: Map<string, PropertyMeta> | undefined;

const chain = (from: Node | undefined): Node[] => {
  const out: Node[] = [];
  for (let at = from; at; at = at.next?.block) {
    out.push(at);
  }
  return out;
};

const socket = (node: Node, name: string): Node | undefined =>
  node.inputs?.[name]?.block ?? node.inputs?.[name]?.shadow;

/**
 * What this actor's own rows SET, by the same key the reads use.
 *
 * A Label carries `set text of this actor to ⟨Label⟩`, and the drawing reads
 * `text` — so the word on the preview is the word in the file rather than the
 * rule's empty default.
 */
const written = (root: Node): Map<string, unknown> => {
  const out = new Map<string, unknown>();
  for (const row of chain(root.next?.block)) {
    const parts = WRITE.exec(row.type ?? '');
    const value = socket(row, 'VALUE');
    if (parts && value) {
      out.set(`${parts[1]}_${parts[2]}`, literal(value, out));
    }
  }
  return out;
};

/** A value socket, as a number, string or color — or undefined. */
function literal(node: Node | undefined, set: Map<string, unknown>): unknown {
  if (!node) {
    return undefined;
  }
  switch (node.type) {
    case 'math_number':
      return Number(node.fields?.NUM ?? 0);
    case 'text':
      return String(node.fields?.TEXT ?? '');
    case 'colour_picker':
      return String(node.fields?.COLOUR ?? '#000000');
    case 'logic_boolean':
      return node.fields?.BOOL === 'TRUE';
    case 'math_arithmetic': {
      const a = Number(literal(socket(node, 'A'), set) ?? 0);
      const b = Number(literal(socket(node, 'B'), set) ?? 0);
      switch (node.fields?.OP) {
        case 'ADD':
          return a + b;
        case 'MINUS':
          return a - b;
        case 'DIVIDE':
          return b === 0 ? 0 : a / b;
        default:
          return a * b;
      }
    }
    case 'logic_ternary':
      // The branch a wired-up actor takes — see the header's one assumption.
      return literal(socket(node, 'THEN'), set);
    case 'world_any_actors':
      return true;
    default:
      break;
  }
  const read = READ.exec(node.type ?? '');
  if (!read) {
    return undefined;
  }
  const key = `${read[1]}_${read[2]}`;
  if (set.has(key)) {
    return set.get(key);
  }
  defaults ??= ruleDefaults();
  return defaults.get(key)?.default;
}

/**
 * The drawing a stock actor declares, as commands — or nothing for an actor
 * that wears a picture instead (`ActorPreview` shows that picture).
 */
export function previewDrawing(actor: StockActor): PreviewDrawing | undefined {
  let roots: Node[];
  try {
    roots =
      (JSON.parse(actor.contents) as {blocks?: {blocks?: Node[]}}).blocks
        ?.blocks ?? [];
  } catch {
    return undefined;
  }
  const definition = roots.find(root => root.type === 'world_actor');
  const drawing = roots.find(root => root.type === 'world_define_drawing');
  if (!definition || !drawing) {
    return undefined;
  }
  const set = written(definition);
  const number = (node: Node, name: string, fallback = 0) =>
    Number(literal(socket(node, name), set) ?? fallback);
  const color = (node: Node, name: string) => {
    const value = literal(socket(node, name), set);
    return typeof value === 'string' ? value : undefined;
  };

  const commands: DrawCommand[] = [];
  // The pen, which is state: a fill or an outline set once applies to every
  // shape after it, exactly as it does in the engine (`core/drawing`).
  let fill: string | undefined = '#ffffff';
  let stroke: string | undefined;
  let strokeWidth = 1;
  // `strokeWidth` is always carried, with or without a stroke: the engine's
  // own `Paint` requires it so the driver never has to invent one.
  const paint = (): {fill?: string; stroke?: string; strokeWidth: number} => ({
    ...(fill === undefined ? {} : {fill}),
    ...(stroke === undefined ? {} : {stroke}),
    strokeWidth,
  });

  for (const row of chain(socket(drawing, 'DO'))) {
    switch (row.type) {
      case 'world_pen_fill':
        fill = color(row, 'COLOR');
        break;
      case 'world_pen_outline':
        stroke = color(row, 'COLOR');
        strokeWidth = number(row, 'WIDTH', 1);
        break;
      case 'world_pen_no_outline':
        stroke = undefined;
        break;
      case 'world_draw_rectangle':
        commands.push({
          op: 'rectangle',
          x: number(row, 'X'),
          y: number(row, 'Y'),
          width: number(row, 'WIDTH'),
          height: number(row, 'HEIGHT'),
          ...paint(),
        });
        break;
      case 'world_draw_text':
      case 'world_draw_paragraph':
        commands.push({
          op: 'text',
          text: String(literal(socket(row, 'TEXT'), set) ?? ''),
          x: number(row, 'X'),
          y: number(row, 'Y'),
          size: number(row, 'SIZE', 12),
          anchor: (literal(socket(row, 'ANCHOR'), set) ??
            'center') as TextAnchor,
          ...(row.type === 'world_draw_paragraph'
            ? {wrapWidth: number(row, 'WIDTH', 0) || undefined}
            : {}),
          ...paint(),
        });
        break;
      default:
        // A command this reading has not met. Skipped rather than guessed at:
        // a preview missing a shape is a worse picture, and a preview drawing
        // an invented one is a lie.
        break;
    }
  }

  return {
    width: Number(drawing.fields?.WIDTH ?? 32),
    height: Number(drawing.fields?.HEIGHT ?? 32),
    commands,
  };
}
