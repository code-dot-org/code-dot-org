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

import {parseActorOwnMeta} from '../../blockly/ownProperties';
import {parseRuleMeta, type PropertyMeta} from '../../blockly/ruleMeta';
import {pathSlug} from '../../blockly/ruleRegistry';
import type {DrawCommand, TextAnchor} from '../../engine/core/drawing';
import {STOCK_RULES} from '../../rules/stock';
import {STOCK_ACTORS, stockActorById, type StockActor} from '../stock';

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

/** `world_get_ActorsLabel_TextProperty` → `['Writing', 'TextProperty']`. */
const READ = /^world_get_([A-Za-z0-9]+)_(.+)$/;
const WRITE = /^world_set_([A-Za-z0-9]+)_(.+)$/;

/**
 * Every declared property's default, by the key a block type carries.
 *
 * BOTH KINDS OF DECLARER. A rule's key is its name without spaces; an ACTOR's
 * is the module path as a block-type segment (`ruleRegistry.pathSlug`), which
 * is what a `world_get_ActorsProgressBar_FractionProperty` says. The Progress
 * Bar keeps its fraction and its two colors for itself, so a preview reading
 * only the rules found nothing to draw them with and drew a bar of width zero.
 */
const declaredDefaults = (): Map<string, PropertyMeta> => {
  const out = new Map<string, PropertyMeta>();
  for (const actor of STOCK_ACTORS) {
    const path = `actors/${actor.id}`;
    for (const property of parseActorOwnMeta(path, actor.contents)
      ?.properties ?? []) {
      out.set(`${pathSlug(path)}_${property.ref.exportName}`, property);
    }
  }
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

/** Built once: nine actors ask the same question of the same declarations. */
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

/** The `define actor` root of a stock actor's file, if it parses. */
const defineActorIn = (actor: StockActor): Node | undefined => {
  try {
    return (
      (JSON.parse(actor.contents) as {blocks?: {blocks?: Node[]}}).blocks
        ?.blocks ?? []
    ).find(root => root.type === 'world_actor');
  } catch {
    return undefined; // mid-edit / not JSON, as everywhere else
  }
};

/**
 * This actor and everything it acts like, nearest first.
 *
 * Read off the FILE rather than off the shelf entry's `actors`, because the
 * row is what the generated module obeys and the entry is only what an import
 * brings. `seen` because a cycle is a project that will not load rather than a
 * picture to draw forever.
 */
const ancestry = (actor: StockActor): StockActor[] => {
  const line: StockActor[] = [];
  const seen = new Set<string>();
  for (let at: StockActor | undefined = actor; at; ) {
    if (seen.has(at.id)) {
      break;
    }
    seen.add(at.id);
    line.push(at);
    const row: Node | undefined = chain(defineActorIn(at)?.next?.block).find(
      one => one.type === 'world_acts_like',
    );
    const named: unknown = row?.fields?.ACTOR;
    at =
      typeof named === 'string'
        ? stockActorById(named.replace(/^actors\//, ''))
        : undefined;
  }
  return line;
};

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
  defaults ??= declaredDefaults();
  return defaults.get(key)?.default;
}

/**
 * The drawing a stock actor declares, as commands — or nothing for an actor
 * that wears a picture instead (`ActorPreview` shows that picture).
 */
export function previewDrawing(actor: StockActor): PreviewDrawing | undefined {
  // …AND WHAT IT ACTS LIKE, nearest first. A Health Bar says nothing about a
  // picture: it acts like a Progress Bar and inherits one, so a preview that
  // read only this file's own rows drew nothing at all
  // (`ActorBuilder.actsLike`).
  const lineage = ancestry(actor);
  const definition = lineage
    .map(one => defineActorIn(one))
    .find(node => node !== undefined);
  // IN THE DEFINITION'S OWN CHAIN, not among the roots. A drawing is a row
  // under `define actor` (specs/DRAWING.md); looking at the top level found
  // nothing, and every actor previewed as its fallback picture.
  //
  // The NEAREST one wins, which is what the builder does: a child's own
  // `define drawing` replaces an inherited picture, and one that says nothing
  // keeps it.
  const drawing = lineage
    .map(one =>
      chain(defineActorIn(one)?.next?.block).find(
        row => row.type === 'world_define_drawing',
      ),
    )
    .find(row => row !== undefined);
  if (!definition || !drawing) {
    return undefined;
  }
  // Merged from the far end inward, so a child's `set` overrides an inherited
  // one — the order overrides are applied in when the actor is really built.
  const set = new Map<string, unknown>();
  for (const one of [...lineage].reverse()) {
    const node = defineActorIn(one);
    if (node) {
      for (const [key, value] of written(node)) {
        set.set(key, value);
      }
    }
  }
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

  // THE SIZE IS A SOCKET, like everything else this reads. It was two fields
  // on the block; an interface actor's is `⟨width⟩ of ⟨this actor⟩`, and
  // `literal` resolves that against the declared defaults the same way the
  // colors and the words are resolved (`declaredDefaults`).
  return {
    width: number(drawing, 'WIDTH', 32),
    height: number(drawing, 'HEIGHT', 32),
    commands,
  };
}
