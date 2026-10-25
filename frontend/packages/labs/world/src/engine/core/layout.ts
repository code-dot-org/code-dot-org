// A Screen's grid layout: a tree of splits, each docking actors into its
// regions (specs/DOCKING_PLAN.md; SIMPLE_INTERFACE.md, "The grid layout is a
// tree of splits").
//
// A split divides its region across (side by side) or down (one above the
// other). One side is fixed at a number of pixels and the other fills what
// is left, so a HUD bar stays a bar in a taller window, which a ratio would
// not. A leaf docks one placement by its id, and that placement fills its
// region.
//
// Pure, and here rather than in `World`, as the anchors are: the loader
// asks it for boxes, the editor asks it for boxes and for edits, and both can
// be tested without a world.

/** A region docking one placement, by its id in the map. */
export interface DockLeaf {
  dock: string;
}

/** A region divided in two, one side fixed and the other filling the rest. */
export interface Split {
  split: 'across' | 'down';
  fixed: 'first' | 'second';
  /** The fixed side's size, in pixels. */
  size: number;
  first: LayoutNode;
  second: LayoutNode;
}

export type LayoutNode = DockLeaf | Split;

/** A region, from its top left, in pixels. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where one actor docks against a region: one of its four sides. */
export type Side = 'top' | 'bottom' | 'left' | 'right';

/** The way to a split from the root: which side, at each split passed. */
export type SplitPath = ReadonlyArray<'first' | 'second'>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Whether a stored value is a layout this can read, all the way down. */
export function isLayout(value: unknown): value is LayoutNode {
  if (!isObject(value)) {
    return false;
  }
  if ('dock' in value) {
    return typeof value.dock === 'string';
  }
  return (
    (value.split === 'across' || value.split === 'down') &&
    (value.fixed === 'first' || value.fixed === 'second') &&
    typeof value.size === 'number' &&
    Number.isFinite(value.size) &&
    isLayout(value.first) &&
    isLayout(value.second)
  );
}

const isLeaf = (node: LayoutNode): node is DockLeaf => 'dock' in node;

/** Every placement the layout docks, in reading order. */
export function dockedIds(node: LayoutNode | undefined): string[] {
  if (!node) {
    return [];
  }
  return isLeaf(node)
    ? [node.dock]
    : [...dockedIds(node.first), ...dockedIds(node.second)];
}

/** Whether anything under a node is there to be docked. */
const holds = (node: LayoutNode, present: (id: string) => boolean): boolean =>
  isLeaf(node)
    ? present(node.dock)
    : holds(node.first, present) || holds(node.second, present);

/** A split's two regions within `box`, the fixed side clamped to fit. */
function halves(split: Split, box: Box): [Box, Box] {
  const across = split.split === 'across';
  const whole = across ? box.width : box.height;
  const fixed = Math.max(0, Math.min(whole, split.size));
  const firstSize = split.fixed === 'first' ? fixed : whole - fixed;
  return across
    ? [
        {...box, width: firstSize},
        {...box, x: box.x + firstSize, width: box.width - firstSize},
      ]
    : [
        {...box, height: firstSize},
        {...box, y: box.y + firstSize, height: box.height - firstSize},
      ];
}

/**
 * Each docked placement's box, in a screen `width` by `height`.
 *
 * A side holding nothing that is `present` is a hole, and its sibling takes
 * the whole region: a docked placement deleted from the map leaves its leaf
 * behind, and the layout closes over it.
 */
export function layoutBoxes(
  node: LayoutNode | undefined,
  width: number,
  height: number,
  present: (id: string) => boolean = () => true,
): Map<string, Box> {
  const boxes = new Map<string, Box>();
  const walk = (at: LayoutNode, box: Box) => {
    if (isLeaf(at)) {
      if (present(at.dock)) {
        boxes.set(at.dock, box);
      }
      return;
    }
    const first = holds(at.first, present);
    const second = holds(at.second, present);
    if (!first || !second) {
      if (first) walk(at.first, box);
      if (second) walk(at.second, box);
      return;
    }
    const [one, two] = halves(at, box);
    walk(at.first, one);
    walk(at.second, two);
  };
  if (node) {
    walk(node, {x: 0, y: 0, width, height});
  }
  return boxes;
}

/** The line between a split's two sides, for the editor to draw and drag. */
export interface Divider {
  path: SplitPath;
  split: 'across' | 'down';
  /** Where the line is: an x for `across`, a y for `down`. */
  at: number;
  /** The region the split divides. */
  box: Box;
}

/** Every split's divider in a screen `width` by `height`. */
export function dividers(
  node: LayoutNode | undefined,
  width: number,
  height: number,
  present: (id: string) => boolean = () => true,
): Divider[] {
  const found: Divider[] = [];
  const walk = (at: LayoutNode, box: Box, path: SplitPath) => {
    if (isLeaf(at)) {
      return;
    }
    const first = holds(at.first, present);
    const second = holds(at.second, present);
    if (!first || !second) {
      if (first) walk(at.first, box, [...path, 'first']);
      if (second) walk(at.second, box, [...path, 'second']);
      return;
    }
    const [one, two] = halves(at, box);
    found.push({
      path,
      split: at.split,
      at: at.split === 'across' ? one.x + one.width : one.y + one.height,
      box,
    });
    walk(at.first, one, [...path, 'first']);
    walk(at.second, two, [...path, 'second']);
  };
  if (node) {
    walk(node, {x: 0, y: 0, width, height}, []);
  }
  return found;
}

// ── Edits ───────────────────────────────────────────────────────────────

/** The layout without `id`'s leaf; its split, if any, closes over it. */
export function undock(
  node: LayoutNode | undefined,
  id: string,
): LayoutNode | undefined {
  if (!node) {
    return undefined;
  }
  if (isLeaf(node)) {
    return node.dock === id ? undefined : node;
  }
  const first = undock(node.first, id);
  const second = undock(node.second, id);
  if (!first) return second;
  if (!second) return first;
  return first === node.first && second === node.second
    ? node
    : {...node, first, second};
}

/** A split putting `placed` on `side` of `other`, `placed` fixed at `size`. */
function beside(
  placed: LayoutNode,
  other: LayoutNode,
  side: Side,
  size: number,
): Split {
  const split = side === 'top' || side === 'bottom' ? 'down' : 'across';
  const leading = side === 'top' || side === 'left';
  return {
    split,
    fixed: leading ? 'first' : 'second',
    size: Math.max(0, Math.round(size)),
    first: leading ? placed : other,
    second: leading ? other : placed,
  };
}

/**
 * The layout with `id` docked on `side` of `target`: of the whole screen
 * when `target` is undefined, else of the placement docked as `target`. The
 * new side is fixed at `size`; what was there fills the rest. Docked
 * somewhere already, it is moved. The first thing docked into an empty
 * layout fills the screen, whichever side it was dropped on.
 */
export function dock(
  node: LayoutNode | undefined,
  id: string,
  target: string | undefined,
  side: Side,
  size: number,
): LayoutNode {
  const rest = undock(node, id);
  const leaf: DockLeaf = {dock: id};
  if (!rest) {
    return leaf;
  }
  if (target === undefined || target === id) {
    return beside(leaf, rest, side, size);
  }
  const into = (at: LayoutNode): LayoutNode =>
    isLeaf(at)
      ? at.dock === target
        ? beside(leaf, at, side, size)
        : at
      : {...at, first: into(at.first), second: into(at.second)};
  const docked = into(rest);
  // A target the layout does not hold: beside the whole screen instead.
  return dockedIds(docked).includes(id)
    ? docked
    : beside(leaf, rest, side, size);
}

/** The layout with the split at `path` fixing its side at `size`. */
export function resize(
  node: LayoutNode | undefined,
  path: SplitPath,
  size: number,
): LayoutNode | undefined {
  if (!node || isLeaf(node)) {
    return node;
  }
  if (path.length === 0) {
    return {...node, size: Math.max(0, Math.round(size))};
  }
  const [step, ...rest] = path;
  const child = resize(node[step], rest, size);
  return child === node[step] || !child ? node : {...node, [step]: child};
}

/** The split at `path`, or nothing. */
export function splitAt(
  node: LayoutNode | undefined,
  path: SplitPath,
): Split | undefined {
  let at = node;
  for (const step of path) {
    if (!at || isLeaf(at)) {
      return undefined;
    }
    at = at[step];
  }
  return at && !isLeaf(at) ? at : undefined;
}
