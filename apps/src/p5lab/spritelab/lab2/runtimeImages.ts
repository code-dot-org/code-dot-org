/**
 * Image names that are not images. A block names one of these where the
 * picture is decided at run time: the costume a student clicked in an earlier
 * scene, or every costume the project has. The engine maps them to real
 * names before p5.play sees them, and widens the scene preload to cover them.
 *
 * Both start with '@' so that an image name made from words does not
 * collide with them.
 */

import {
  BACKGROUNDS_CATEGORY,
  BLOCKS_CATEGORY,
  RuntimeAnimationList,
} from './types';
import {isUiSprite, UiSprite} from './uiSprites';

export const CHOSEN_IMAGE = '@chosen';
export const EVERY_IMAGE = '@every';

/** Costume names in list order; backgrounds and blocks are not costumes. */
export function costumeNames(list: RuntimeAnimationList | undefined): string[] {
  return (list?.orderedKeys || [])
    .map(key => list?.propsByKey[key])
    .filter(
      props =>
        !!props?.name &&
        !(props.categories || []).some(
          c => c === BACKGROUNDS_CATEGORY || c === BLOCKS_CATEGORY
        )
    )
    .map(props => props!.name);
}

/**
 * The chosen costume, or the first one when nothing was chosen yet. The
 * fallback lets a student edit the scene that shows the choice without
 * first playing the scene that makes it.
 */
export function chosenImageName(
  chosen: string | undefined,
  list: RuntimeAnimationList | undefined
): string | undefined {
  const names = costumeNames(list);
  return chosen && names.includes(chosen) ? chosen : names[0];
}

/** A block's image name, with CHOSEN_IMAGE mapped to a real one. */
export function resolveImageName(
  name: unknown,
  chosen: string | undefined,
  list: RuntimeAnimationList | undefined
): unknown {
  return name === CHOSEN_IMAGE ? chosenImageName(chosen, list) : name;
}

/**
 * The names a scene must preload. Null means the whole list: the compile
 * collected nothing, or the program asked for every costume.
 */
export function expandReferencedImages(
  referenced: Set<string> | null,
  chosen: string | undefined,
  list: RuntimeAnimationList | undefined
): Set<string> | null {
  if (!referenced || referenced.has(EVERY_IMAGE)) {
    return null;
  }
  if (!referenced.has(CHOSEN_IMAGE)) {
    return referenced;
  }
  const out = new Set(referenced);
  const name = chosenImageName(chosen, list);
  if (name) {
    out.add(name);
  }
  return out;
}

export interface GridCell {
  x: number;
  y: number;
  /** Sprite size in the percent units of addSprite's `scale`. */
  size: number;
}

// Below a title line, and clear of the canvas edges.
const GRID_AREA = {left: 20, top: 100, width: 360, height: 280};
const GRID_FILL = 0.85;

/** Cells for n pictures, row by row, as square as the area allows. */
export function gridLayout(n: number): GridCell[] {
  if (n <= 0) {
    return [];
  }
  const columns = Math.min(4, Math.ceil(Math.sqrt(n)));
  const rows = Math.ceil(n / columns);
  const cell = Math.min(GRID_AREA.width / columns, GRID_AREA.height / rows);
  const left = GRID_AREA.left + (GRID_AREA.width - cell * columns) / 2;
  const top = GRID_AREA.top + (GRID_AREA.height - cell * rows) / 2;
  return Array.from({length: n}, (_, i) => ({
    x: left + cell * ((i % columns) + 0.5),
    y: top + cell * (Math.floor(i / columns) + 0.5),
    size: cell * GRID_FILL,
  }));
}

export interface ImageLibrary {
  addSprite(opts: {
    animation: string;
    location: {x: number; y: number};
    scale: number;
  }): unknown;
  getSpriteArray(spriteArg: unknown): UiSprite[];
  addEvent(
    type: string,
    args: unknown,
    callback: (args: unknown) => void
  ): void;
}

/** Where the choice lives: the engine, which outlives each scene's library. */
export interface ChoiceStore {
  chosen?: string;
}

export function createImageCommands(
  library: ImageLibrary,
  store: ChoiceStore,
  list: RuntimeAnimationList | undefined
) {
  return {
    whenImageClicked(callback: () => void) {
      library.addEvent('whenclick', {sprite: {costume: 'all'}}, args => {
        const {clickedSprite} = (args || {}) as {clickedSprite?: number};
        const sprite = library.getSpriteArray({id: clickedSprite})[0];
        const name =
          sprite && !isUiSprite(sprite) && sprite.getAnimationLabel();
        if (!name) {
          return;
        }
        store.chosen = name;
        callback();
      });
    },

    makeImageGrid() {
      const names = costumeNames(list);
      gridLayout(names.length).forEach((cell, i) =>
        library.addSprite({
          animation: names[i],
          location: {x: cell.x, y: cell.y},
          scale: cell.size,
        })
      );
    },
  };
}
