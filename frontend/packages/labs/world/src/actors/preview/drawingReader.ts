// An actor's `define drawing`, read out of its file and run without the engine.
//
// The drawing language is a closed vocabulary — a pen, five shapes, and values
// that are literals, arithmetic or property reads — and a drawing may not SET
// anything (specs/DRAWING.md). So a picture of an actor can be had by reading
// the rows and resolving each read against what the actor's properties hold:
// the declared default, what the file's own `set` rows put there, and, for a
// placement on a map, what the inspector wrote over both. No module, no
// compile, no sandbox; the commands go to the driver's own painter
// (`runtime/driver/paintDrawing`), so the picture and the game share one
// painter and what can drift is this reading.
//
// This began as the import dialog's preview of a STOCK actor
// (`previewDrawing`) and was widened to any project actor for the map editor,
// which draws a placement while its words are being typed. Two things changed
// in the widening and are worth knowing:
//
// IT SAYS WHETHER IT UNDERSTOOD. A block this reading has not met is skipped
// rather than guessed at — a preview missing a shape is a worse picture, and a
// preview drawing an invented one is a lie — and the result says so
// (`complete`), so a caller with a sandbox can prefer the sandbox's picture
// for exactly the drawings this could not finish. The Text Input's caret is
// one: it reads the time and a rule's `focused`, which a still cannot know.
//
// A READ MAY BE OVERRIDDEN. A map names what a placement overrides by the
// declaring kind's id and the property's (`Label.text`), and a block names the
// same property by the file's path and the export
// (`world_get_ActorsLabel_TextProperty`). `declarationsOf` builds both keys
// from one walk over the project's declarations, so a placement's overrides
// translate without anybody typing the correspondence twice.

import {BUILTIN_RULE_META} from '../../blockly/builtinMeta';
import {parseActorOwnMeta} from '../../blockly/ownProperties';
import {parseRuleMeta, type PropertyMeta} from '../../blockly/ruleMeta';
import {pathSlug} from '../../blockly/ruleRegistry';
import {cssColor} from '../../engine/core/color';
import type {DrawCommand, Shadow, TextAnchor} from '../../engine/core/drawing';
import {
  NO_THEME,
  resolveTheme,
  type ResolvedTheme,
} from '../../engine/core/theme';
import {STYLED} from '../../engine/rules/styled';

/** A block as it sits in a saved workspace — only what is read here. */
export interface Node {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: Node; shadow?: Node}>;
  next?: {block?: Node};
}

/** The drawing a reading produced. */
export interface ReadDrawing {
  width: number;
  height: number;
  commands: DrawCommand[];
  /**
   * Whether every block met was one this reading knows. False means a shape
   * or a value was skipped, and a truer picture exists somewhere that can run
   * the actor.
   */
  complete: boolean;
}

/** How wide `text` is at `size`, in pixels — the painter's own font. */
export type Measure = (text: string, size: number, weight?: 'bold') => number;

/** The project as text: `actors/label.actor` → its JSON, and so on. */
export type Files = Record<string, string>;

/** Overrides as a map holds them: declaring owner id, then property id. */
export type Overrides = Record<string, Record<string, unknown>>;

/**
 * Every declared property in a project, by both of its names.
 *
 * `defaults` is keyed as a READ block is — `ActorsLabel_TextProperty`,
 * `Health_HealthProperty` — and answers what a read finds when nothing has
 * written the property. `blockKeyOf` is keyed as a MAP is — `Label.text` —
 * and says which read that override feeds.
 */
export interface Declarations {
  defaults: Map<string, PropertyMeta>;
  blockKeyOf: Map<string, string>;
}

/**
 * The id a `define actor` NAME compiles to, which is the owner id its
 * properties carry in a map (`domainBlocks.id_from_name`, copied rather than
 * imported so this file does not pull Blockly in).
 */
const ownerIdOf = (name: string): string =>
  name.replaceAll(/[^A-Za-z0-9_]/g, '_');

/** Once per project: many placements ask the same question of the same files. */
const declared = new WeakMap<Files, Declarations>();

export function declarationsOf(files: Files): Declarations {
  const known = declared.get(files);
  if (known) {
    return known;
  }
  const defaults = new Map<string, PropertyMeta>();
  const blockKeyOf = new Map<string, string>();
  for (const [path, contents] of Object.entries(files)) {
    if (path.endsWith('.actor')) {
      const modulePath = path.replace(/\.actor$/, '');
      const meta = parseActorOwnMeta(modulePath, contents);
      for (const property of meta?.properties ?? []) {
        const key = `${pathSlug(modulePath)}_${property.ref.exportName}`;
        defaults.set(key, property);
        blockKeyOf.set(`${ownerIdOf(meta!.name)}.${property.id}`, key);
      }
    } else if (path.endsWith('.rule')) {
      const meta = parseRuleMeta(path.replace(/\.rule$/, ''), contents);
      for (const property of meta?.properties ?? []) {
        // Keyed as the block type keys it: the rule's name without spaces,
        // then the property's export name (`domainBlocks.memberKey`).
        const key = `${(meta?.name ?? '').replaceAll(' ', '')}_${property.ref.exportName}`;
        defaults.set(key, property);
        // A map keys a rule's property by whichever owns it — the trait, for
        // a trait's own; the rule, for the rest — so both are answered.
        blockKeyOf.set(`${meta?.id ?? ''}.${property.id}`, key);
        if (property.ownerTraitId) {
          blockKeyOf.set(`${property.ownerTraitId}.${property.id}`, key);
        }
      }
    }
  }
  // …and the rules the ENGINE provides, which are in every world and are in
  // no `.rule` file to walk. A Label's box is one of them now (`Has a Box`,
  // specs/BOXES_PLAN.md), so a preview that did not know them drew every
  // interface actor at whatever literal its drawing fell back to.
  for (const meta of BUILTIN_RULE_META) {
    for (const property of meta.properties) {
      const key = `${meta.name.replaceAll(' ', '')}_${property.ref.exportName}`;
      defaults.set(key, property);
      blockKeyOf.set(`${meta.id}.${property.id}`, key);
      if (property.ownerTraitId) {
        blockKeyOf.set(`${property.ownerTraitId}.${property.id}`, key);
      }
    }
  }
  const built = {defaults, blockKeyOf};
  declared.set(files, built);
  return built;
}

/** `world_get_ActorsLabel_TextProperty` → `['ActorsLabel', 'TextProperty']`. */
const READ = /^world_get_([A-Za-z0-9]+)_(.+)$/;
const WRITE = /^world_set_([A-Za-z0-9]+)_(.+)$/;

const chain = (from: Node | undefined): Node[] => {
  const out: Node[] = [];
  for (let at = from; at; at = at.next?.block) {
    out.push(at);
  }
  return out;
};

const socket = (node: Node, name: string): Node | undefined =>
  node.inputs?.[name]?.block ?? node.inputs?.[name]?.shadow;

const field = (node: Node, name: string): unknown => node.fields?.[name];

/** The `define actor` root of an actor file, if it parses. */
export function defineActorIn(contents: string | undefined): Node | undefined {
  if (contents === undefined) {
    return undefined;
  }
  try {
    return (
      (JSON.parse(contents) as {blocks?: {blocks?: Node[]}}).blocks?.blocks ??
      []
    ).find(root => root.type === 'world_actor');
  } catch {
    return undefined; // mid-edit / not JSON, as everywhere else
  }
}

/** The `define world` root of a world file, if it parses. */
function defineWorldIn(contents: string | undefined): Node | undefined {
  if (contents === undefined) {
    return undefined;
  }
  try {
    return (
      (JSON.parse(contents) as {blocks?: {blocks?: Node[]}}).blocks?.blocks ??
      []
    ).find(root => root.type === 'world_world');
  } catch {
    return undefined;
  }
}

/**
 * This actor and everything it acts like, nearest first, as module paths.
 *
 * Read off the FILE, because the `acts like` row is what the generated module
 * obeys. `seen` because a cycle is a project that will not load rather than a
 * picture to draw forever.
 */
export function ancestry(files: Files, actorPath: string): string[] {
  const line: string[] = [];
  const seen = new Set<string>();
  for (let at: string | undefined = actorPath; at; ) {
    if (seen.has(at)) {
      break;
    }
    seen.add(at);
    line.push(at);
    const row: Node | undefined = chain(
      defineActorIn(files[`${at}.actor`])?.next?.block,
    ).find(one => one.type === 'world_acts_like');
    const named: unknown = row?.fields?.ACTOR;
    at = typeof named === 'string' ? named : undefined;
  }
  return line;
}

/** Whether an actor file, or one it acts like, declares a drawing. */
export function declaresDrawing(files: Files, actorPath: string): boolean {
  return ancestry(files, actorPath).some(one =>
    chain(defineActorIn(files[`${one}.actor`])?.next?.block).some(
      row => row.type === 'world_define_drawing',
    ),
  );
}

/**
 * One reading: the values in hand, and whether anything was beyond it.
 *
 * `set` holds what has been WRITTEN, by block key — the file's own `set`
 * rows and then a placement's overrides — and a read that finds nothing there
 * falls back to the declaration's default.
 */
class Reading {
  complete = true;
  private readonly set: Map<string, unknown>;
  private readonly declarations: Declarations;
  private readonly measure: Measure | undefined;
  /**
   * The theme this reading is under, so a measurement can name its style.
   *
   * `world_text_width` asks how wide words are IN A STYLE, because the painter
   * draws them in one and a bold caption is wider than a regular one. The
   * still has to ask the same question the game asks or the two disagree about
   * where a caret goes (`World.textWidth`).
   */
  private readonly theme: ResolvedTheme;

  constructor(
    set: Map<string, unknown>,
    declarations: Declarations,
    measure: Measure | undefined,
    theme: ResolvedTheme,
  ) {
    this.set = set;
    this.declarations = declarations;
    this.measure = measure;
    this.theme = theme;
  }

  /** A value socket, resolved — or undefined, which also marks the reading. */
  value(node: Node | undefined): unknown {
    if (!node) {
      return undefined;
    }
    switch (node.type) {
      case 'math_number':
        return Number(field(node, 'NUM') ?? 0);
      case 'text': {
        // The lab's `text` carries a chain socket: `⟨HELLO ⟩ + ⟨…⟩`.
        const rest = socket(node, 'ADD');
        return `${String(field(node, 'TEXT') ?? '')}${rest ? this.text(rest) : ''}`;
      }
      case 'world_as_text': {
        const rest = socket(node, 'ADD');
        return `${this.text(socket(node, 'VALUE'))}${rest ? this.text(rest) : ''}`;
      }
      case 'colour_picker':
        return String(field(node, 'COLOUR') ?? '#000000');
      // …and the other colour block, which is the one with an ALPHA and
      // therefore the one a shadow is written in. Through the engine's own
      // `cssColor` rather than a second spelling of the same arithmetic: a
      // still and the live picture that disagree by a rounding are two
      // pictures, and the map editor would show the wrong one.
      case 'world_rgba':
        return cssColor([
          this.number(socket(node, 'R')),
          this.number(socket(node, 'G')),
          this.number(socket(node, 'B')),
          this.number(socket(node, 'A'), 1),
        ]);
      case 'logic_boolean':
        return field(node, 'BOOL') === 'TRUE';
      case 'math_arithmetic': {
        const a = this.number(socket(node, 'A'));
        const b = this.number(socket(node, 'B'));
        switch (field(node, 'OP')) {
          case 'ADD':
            return a + b;
          case 'MINUS':
            return a - b;
          case 'DIVIDE':
            return b === 0 ? 0 : a / b;
          case 'POWER':
            return a ** b;
          default:
            return a * b;
        }
      }
      case 'math_modulo': {
        const divisor = this.number(socket(node, 'DIVISOR'));
        return divisor === 0
          ? 0
          : this.number(socket(node, 'DIVIDEND')) % divisor;
      }
      case 'logic_compare': {
        const a = this.value(socket(node, 'A'));
        const b = this.value(socket(node, 'B'));
        if (a === undefined || b === undefined) {
          return undefined;
        }
        switch (field(node, 'OP')) {
          case 'EQ':
            return a === b;
          case 'NEQ':
            return a !== b;
          case 'LT':
            return Number(a) < Number(b);
          case 'LTE':
            return Number(a) <= Number(b);
          case 'GT':
            return Number(a) > Number(b);
          case 'GTE':
            return Number(a) >= Number(b);
          default:
            return undefined;
        }
      }
      case 'logic_operation': {
        const a = this.value(socket(node, 'A'));
        const b = this.value(socket(node, 'B'));
        if (a === undefined || b === undefined) {
          return undefined;
        }
        return field(node, 'OP') === 'OR'
          ? Boolean(a) || Boolean(b)
          : Boolean(a) && Boolean(b);
      }
      case 'logic_negate': {
        const inner = this.value(socket(node, 'BOOL'));
        return inner === undefined ? undefined : !inner;
      }
      case 'logic_ternary': {
        // A condition this can answer picks the branch. One it cannot — a
        // Health Bar asks whether anybody is there — takes the THEN branch,
        // which is the poster: the bar a learner sees once it is pointed at
        // somebody, rather than the empty track it is before.
        const condition = this.value(socket(node, 'IF'));
        return condition === false
          ? this.value(socket(node, 'ELSE'))
          : this.value(socket(node, 'THEN'));
      }
      case 'text_length':
        return this.text(socket(node, 'VALUE')).length;
      case 'world_text_width': {
        if (!this.measure) {
          this.complete = false;
          return undefined;
        }
        const named = String(node.fields?.STYLE ?? '');
        const style = named ? this.theme.styles.get(named) : undefined;
        return this.measure(
          this.text(socket(node, 'TEXT')),
          this.number(socket(node, 'SIZE'), 12),
          style?.weight === 'bold' ? 'bold' : undefined,
        );
      }
      case 'world_any_actors':
        return true;
      case 'world_time':
        // A still is drawn at the start of time. What blinks is drawn as it
        // is at that instant, and the reading is not complete for it.
        this.complete = false;
        return 0;
      default:
        break;
    }
    const read = READ.exec(node.type ?? '');
    if (!read) {
      this.complete = false;
      return undefined;
    }
    const key = `${read[1]}_${read[2]}`;
    if (this.set.has(key)) {
      return this.set.get(key);
    }
    const declaration = this.declarations.defaults.get(key);
    if (!declaration) {
      this.complete = false;
      return undefined;
    }
    return declaration.default;
  }

  number(node: Node | undefined, fallback = 0): number {
    const value = this.value(node);
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : Number(value ?? fallback) || fallback;
  }

  text(node: Node | undefined): string {
    const value = this.value(node);
    return value === undefined ? '' : String(value);
  }

  color(node: Node | undefined): string | undefined {
    const value = this.value(node);
    return typeof value === 'string' ? value : undefined;
  }
}

/**
 * What an actor's own rows SET, by the key a read uses.
 *
 * A Label carries `set text of this actor to ⟨Label⟩`, and the drawing reads
 * `text` — so the word on the picture is the word in the file rather than the
 * declaration's empty default. Literals only: a `set` of an expression is
 * work for the running actor.
 */
function written(root: Node, into: Map<string, unknown>, reading: Reading) {
  for (const row of chain(root.next?.block)) {
    const parts = WRITE.exec(row.type ?? '');
    const value = socket(row, 'VALUE');
    if (parts && value) {
      const resolved = reading.value(value);
      if (resolved !== undefined) {
        into.set(`${parts[1]}_${parts[2]}`, resolved);
      }
    }
  }
}

/**
 * Read `actorPath`'s drawing out of `files`, with `overrides` written over
 * the actor's own values — or nothing, for an actor with no drawing to read
 * (one that wears a picture instead).
 */
/**
 * The theme the project's worlds point at, resolved.
 *
 * THE READER IS A SECOND IMPLEMENTATION OF THE PEN — it makes the map
 * editor's stills without running a game — so it has to find the theme the
 * same way the game does, which is a `use theme` row under `define world`.
 * Without this every drawing naming a style would read INCOMPLETE and every
 * interface picture in the editor would fall back to the sandbox's slow path
 * (specs/STYLES_PLAN.md).
 *
 * THE FIRST WORLD THAT NAMES ONE. A project with two worlds on two themes is
 * a thing the editor cannot draw one picture for; it draws the first, which
 * is also what a palette thumbnail can mean at all.
 */
function themeDocumentAt(files: Files, path: string): unknown {
  const contents = files[`${path}.style`];
  if (contents === undefined) {
    return undefined;
  }
  try {
    return JSON.parse(contents);
  } catch {
    // A theme mid-edit is no theme, not a broken editor.
    return undefined;
  }
}

/**
 * The theme a drawing is read under: the one given, else the world's.
 *
 * THE READER SEES TWO OF THE THREE LEVELS. A still is of a KIND — the map
 * editor's palette thumbnail, the picker's picture — so there is no placement
 * to ask, and the caller passes one in when it has one (a placement being
 * drawn on the stage does). What is found here is the base: the first `use
 * theme` row under a `define world` (specs/STYLES_PLAN.md).
 */
function themeOf(files: Files, override?: string): ResolvedTheme {
  const parentAt = (path: string) => themeDocumentAt(files, path);
  if (override) {
    const named = themeDocumentAt(files, override);
    if (named !== undefined) {
      return resolveTheme(named, parentAt, [override]);
    }
  }
  for (const [path, contents] of Object.entries(files)) {
    if (!path.endsWith('.world')) {
      continue;
    }
    const root = defineWorldIn(contents);
    const row =
      root &&
      chain(root.next?.block).find(one => one.type === 'world_use_theme');
    const named = row && field(row, 'THEME');
    if (typeof named !== 'string' || !named) {
      continue;
    }
    const document = themeDocumentAt(files, named);
    if (document === undefined) {
      return NO_THEME;
    }
    return resolveTheme(document, parentAt, [named]);
  }
  return NO_THEME;
}

export function readDrawing(
  files: Files,
  actorPath: string,
  overrides: Overrides = {},
  measure?: Measure,
  /**
   * The theme of the MAP this is being drawn on, if it is being drawn on one.
   *
   * The middle level of the cascade, and the one a reading cannot find for
   * itself: the placement's own theme is in `overrides` and the world's is in
   * a `.world` file, but which map a still belongs to is the caller's
   * question. A palette thumbnail belongs to no map and passes nothing
   * (specs/STYLES_PLAN.md).
   */
  mapTheme?: string,
): ReadDrawing | undefined {
  // …AND WHAT IT ACTS LIKE, nearest first. A Health Bar says nothing about a
  // picture: it acts like a Progress Bar and inherits one, so a reading of
  // this file's own rows alone would draw nothing (`ActorBuilder.actsLike`).
  const lineage = ancestry(files, actorPath);
  const roots = lineage
    .map(one => defineActorIn(files[`${one}.actor`]))
    .filter((root): root is Node => root !== undefined);
  // The NEAREST drawing wins, which is what the builder does: a child's own
  // `define drawing` replaces an inherited picture, and one that says
  // nothing keeps it. A ROW under `define actor` (specs/DRAWING.md).
  const drawing = roots
    .map(root =>
      chain(root.next?.block).find(row => row.type === 'world_define_drawing'),
    )
    .find(row => row !== undefined);
  if (!roots.length || !drawing) {
    return undefined;
  }
  const declarations = declarationsOf(files);
  const set = new Map<string, unknown>();
  // The actor's own theme beats the map's, which beats the world's — the
  // same order `World.themeFor` resolves in, because a still that disagreed
  // with the game would be a second picture. Resolved BEFORE the reading
  // because the reading needs it: a measurement names the style it will be
  // drawn in, and the style is the theme's to give.
  const own = overrides[STYLED.trait]?.[STYLED.theme];
  const theme = themeOf(
    files,
    (typeof own === 'string' && own) || mapTheme || undefined,
  );
  const reading = new Reading(set, declarations, measure, theme);
  // Merged from the far end inward, so a child's `set` overrides an inherited
  // one — the order overrides are applied in when the actor is really built.
  for (const root of [...roots].reverse()) {
    written(root, set, reading);
  }
  // …and the placement's, over all of it, which is what an override means.
  for (const [ownerId, values] of Object.entries(overrides)) {
    for (const [propId, value] of Object.entries(values)) {
      const key = declarations.blockKeyOf.get(`${ownerId}.${propId}`);
      if (key !== undefined) {
        set.set(key, value);
      }
    }
  }
  // Anything a `set` row could not resolve is that row's business, not the
  // drawing's: the reading starts clean here.
  reading.complete = true;

  const commands: DrawCommand[] = [];
  // The pen, which is state: a fill or an outline set once applies to every
  // shape after it, exactly as it does in the engine (`core/drawing`).
  let fill: string | undefined = '#ffffff';
  let stroke: string | undefined;
  let strokeWidth = 1;
  let radius = 0;
  let shadow: Shadow | undefined;
  let bold = false;
  // `strokeWidth` is always carried, with or without a stroke: the engine's
  // own `Paint` requires it so the driver never has to invent one. Everything
  // else is absent when it was not asked for, which is that same `Paint`'s
  // rule and is why a still of a drawing hashes the same as the live one.
  const paint = (): {
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    shadow?: Shadow;
  } => ({
    ...(fill === undefined ? {} : {fill}),
    ...(stroke === undefined ? {} : {stroke}),
    strokeWidth,
    ...(shadow === undefined ? {} : {shadow}),
  });
  const number = (node: Node, name: string, fallback = 0) =>
    reading.number(socket(node, name), fallback);

  const run = (rows: Node[]): void => {
    for (const row of rows) {
      switch (row.type) {
        case 'world_pen_fill': {
          // AN UNSET COLOUR LEAVES WHAT THE PEN HAD, exactly as
          // `CommandPen.fill` leaves it. `text color` defaults to empty so a
          // class can reach a caption, and a reader that took the empty
          // string as a colour would draw every caption in nothing — a still
          // and the live picture that differ are two pictures
          // (specs/STYLES_PLAN.md).
          const chosen = reading.color(socket(row, 'COLOR'));
          if (chosen !== '') {
            fill = chosen;
          }
          break;
        }
        case 'world_pen_outline':
          stroke = reading.color(socket(row, 'COLOR'));
          strokeWidth = number(row, 'WIDTH', 1);
          break;
        case 'world_pen_no_fill':
          fill = undefined;
          break;
        case 'world_pen_no_outline':
          stroke = undefined;
          break;
        // …and the three that decide the SHAPE of a control rather than its
        // colour. A reader that did not know them reported the drawing
        // INCOMPLETE — which is not nothing: an incomplete reading falls back
        // to the sandbox's picture, so every still of every interface actor
        // in the map editor would have gone the slow way round
        // (specs/STYLES_PLAN.md).
        case 'world_pen_corner':
          radius = Math.max(0, number(row, 'RADIUS', 0));
          break;
        case 'world_pen_shadow':
          shadow = {
            color: reading.color(socket(row, 'COLOR')) ?? '#000000',
            blur: Math.max(0, number(row, 'BLUR', 0)),
            offsetY: number(row, 'DOWN', 0),
          };
          break;
        case 'world_pen_no_shadow':
          shadow = undefined;
          break;
        case 'world_pen_weight':
          bold = field(row, 'WEIGHT') === 'bold';
          break;
        // …and all of them at once, out of the project's theme. A style the
        // theme does not define LEAVES THE PEN ALONE, exactly as
        // `CommandPen.useStyle` leaves it — the still and the live picture
        // have to be wrong in the same way, or they are two pictures.
        case 'world_pen_style': {
          const style = theme.styles.get(String(field(row, 'STYLE') ?? ''));
          if (!style) {
            break;
          }
          if (style.fill !== undefined) {
            fill = style.fill ?? undefined;
          }
          if (style.stroke !== undefined) {
            stroke = style.stroke ?? undefined;
          }
          if (style.strokeWidth !== undefined) {
            strokeWidth = style.strokeWidth;
          }
          if (style.corner !== undefined) {
            radius = Math.max(0, style.corner);
          }
          if (style.shadow !== undefined) {
            shadow = style.shadow ?? undefined;
          }
          if (style.weight !== undefined) {
            bold = style.weight === 'bold';
          }
          break;
        }
        case 'world_draw_rectangle':
          commands.push({
            op: 'rectangle',
            x: number(row, 'X'),
            y: number(row, 'Y'),
            width: number(row, 'WIDTH'),
            height: number(row, 'HEIGHT'),
            // Clamped as `CommandPen.rectangle` clamps it, because the two
            // have to agree: a still and the live picture that differ are two
            // pictures, and the editor shows the wrong one.
            ...(radius > 0
              ? {
                  radius: Math.min(
                    radius,
                    number(row, 'WIDTH') / 2,
                    number(row, 'HEIGHT') / 2,
                  ),
                }
              : {}),
            ...paint(),
          });
          break;
        case 'world_draw_circle':
          commands.push({
            op: 'circle',
            x: number(row, 'X'),
            y: number(row, 'Y'),
            radius: number(row, 'RADIUS'),
            ...paint(),
          });
          break;
        case 'world_draw_line':
          commands.push({
            op: 'line',
            x1: number(row, 'X1'),
            y1: number(row, 'Y1'),
            x2: number(row, 'X2'),
            y2: number(row, 'Y2'),
            ...paint(),
          });
          break;
        case 'world_draw_text':
        case 'world_draw_paragraph':
          commands.push({
            op: 'text',
            text: reading.text(socket(row, 'TEXT')),
            x: number(row, 'X'),
            y: number(row, 'Y'),
            size: number(row, 'SIZE', 12),
            anchor: (reading.value(socket(row, 'ANCHOR')) ??
              'center') as TextAnchor,
            ...(row.type === 'world_draw_paragraph'
              ? {wrapWidth: number(row, 'WIDTH', 0) || undefined}
              : {}),
            ...(bold ? {weight: 'bold' as const} : {}),
            ...paint(),
          });
          break;
        case 'world_draw_image': {
          const sprite = field(row, 'SPRITE');
          if (typeof sprite === 'string' && sprite) {
            commands.push({
              op: 'image',
              sprite,
              x: number(row, 'X'),
              y: number(row, 'Y'),
            });
          }
          break;
        }
        case 'controls_if': {
          // Each branch in turn, as Blockly runs it; a condition this cannot
          // answer is false here and marks the reading, since the true
          // picture may have the branch in it.
          let taken = false;
          for (let n = 0; row.inputs?.[`IF${n}`]; n++) {
            const condition = reading.value(socket(row, `IF${n}`));
            if (condition === undefined) {
              reading.complete = false;
            }
            if (condition) {
              run(chain(socket(row, `DO${n}`)));
              taken = true;
              break;
            }
          }
          if (!taken && row.inputs?.ELSE) {
            run(chain(socket(row, 'ELSE')));
          }
          break;
        }
        default:
          // A command this reading has not met. Skipped rather than guessed
          // at, and said so.
          reading.complete = false;
          break;
      }
    }
  };
  run(chain(socket(drawing, 'DO')));

  // THE SIZE IS A SOCKET, like everything else this reads: an interface
  // actor's is `⟨width⟩ of ⟨this actor⟩`, resolved against the same values
  // as the colors and the words — a placement's own width included.
  return {
    width: number(drawing, 'WIDTH', 32),
    height: number(drawing, 'HEIGHT', 32),
    commands,
    complete: reading.complete,
  };
}
