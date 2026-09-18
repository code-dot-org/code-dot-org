// The main map's layers, as the world's declaration (specs/LAYERS_PLAN.md).
//
// A world's layer list is fixed when the world is built, so a layer cannot be
// added by loading a map; the main map is in the world's own file, though,
// and the generator can read it. Its layers are declared in the world's
// prologue, ahead of the ones `define layer` blocks declare, and each slot's
// starting values follow as the calls a block would have made. What the map
// editor shows is then what the game draws, with no block written.

interface Slot {
  sprite?: unknown;
  repeat?: unknown;
  offset?: {x?: unknown; y?: unknown};
}

export interface MainMapLayer {
  id: string;
  name?: string;
  parallax?: {x: number; y: number};
  fit?: boolean;
  background?: Slot;
  foreground?: Slot;
}

/** The layers a world file's `map` states, or none. */
export function mainMapLayersOf(contents: string): MainMapLayer[] {
  try {
    const layers = (JSON.parse(contents) as {map?: {layers?: unknown}}).map
      ?.layers;
    return Array.isArray(layers)
      ? layers.filter(
          (layer): layer is MainMapLayer =>
            Boolean(layer) && typeof (layer as MainMapLayer).id === 'string',
        )
      : [];
  } catch {
    return [];
  }
}

const q = (value: string): string => JSON.stringify(value);
const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const vector = (x: number, y: number): string =>
  `new WorldLab.Vector(${x}, ${y})`;

/** `world.defineLayer({…})` for one layer, with what the map says about it. */
const declaration = (layer: MainMapLayer): string => {
  const parts = [`id: ${q(layer.id)}`];
  if (layer.name) {
    parts.push(`name: ${q(layer.name)}`);
  }
  if (layer.parallax) {
    parts.push(
      `parallax: ${vector(num(layer.parallax.x, 1), num(layer.parallax.y, 1))}`,
    );
  }
  if (layer.fit) {
    parts.push('fit: true');
  }
  return `world.defineLayer({${parts.join(', ')}});\n`;
};

/** The calls that give one slot its starting values, or nothing to say. */
const slotCalls = (
  layer: string,
  which: 'Background' | 'Foreground',
  slot: Slot | undefined,
): string => {
  if (!slot) {
    return '';
  }
  let code = '';
  if (typeof slot.sprite === 'string' && slot.sprite) {
    code += `world.set${which}(${q(slot.sprite)}, ${q(layer)});\n`;
  }
  if (slot.repeat === true) {
    code += `world.set${which}Repeat(true, ${q(layer)});\n`;
  }
  const x = num(slot.offset?.x, 0);
  const y = num(slot.offset?.y, 0);
  if (x !== 0 || y !== 0) {
    code += `world.set${which}Offset(${vector(x, y)}, ${q(layer)});\n`;
  }
  return code;
};

/**
 * The world's layer declarations: the main map's, in their order, then the
 * blocks' that the map did not already name — and after them each slot's
 * starting values. Nothing at all when neither says anything, so a world
 * with no layers still declares none and the engine supplies the default.
 */
export function layerDeclarations(
  mapLayers: readonly MainMapLayer[],
  planned: ReadonlyArray<{id: string}>,
  defaultId: string,
): string {
  const named = new Set(mapLayers.map(layer => layer.id));
  const fromBlocks = planned.filter(entry => !named.has(entry.id));
  const anything =
    mapLayers.length > 0 || planned.some(entry => entry.id !== defaultId);
  if (!anything) {
    return '';
  }
  return (
    mapLayers.map(declaration).join('') +
    fromBlocks
      .map(entry => `world.defineLayer({id: ${q(entry.id)}});\n`)
      .join('') +
    mapLayers
      .map(
        layer =>
          slotCalls(layer.id, 'Background', layer.background) +
          slotCalls(layer.id, 'Foreground', layer.foreground),
      )
      .join('')
  );
}
