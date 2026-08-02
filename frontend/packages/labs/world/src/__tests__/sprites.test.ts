// The stock appearance library and the drawings behind it.
//
// Nothing here is loaded at runtime: a project draws only what it holds, and the
// library is a shelf to copy from. What still has to agree is the shelf and the
// generator — a stock sprite whose image was never drawn is a row in the picker
// that imports a broken file, and a strip animation whose frame count does not
// match its drawing reads squares that are not there.

import {describe, expect, it} from 'vitest';

import * as generator from '../../scripts/generate-sprites.mjs';
import {
  spriteFileName,
  STOCK_ANIMATIONS,
  STOCK_CELL,
  STOCK_SPRITES,
} from '../appearance/stock';
import {STOCK_IMAGES} from '../appearance/stockImages';

describe('the stock appearance library', () => {
  it('offers exactly the drawings the generator draws', () => {
    const drawn = [
      ...generator.SPRITE_NAMES,
      ...Object.keys(generator.ANIMATION_SPECS),
    ];
    expect(STOCK_SPRITES.map(sprite => sprite.id).sort()).toEqual(
      [...drawn].sort(),
    );
    expect(STOCK_CELL).toBe(generator.SPRITE_SIZE);
  });

  it('carries the bytes of every one of them', () => {
    // `stockImages.ts` is generated (scripts/write-stock-assets.mjs); a sprite
    // added to the library without re-running it would import an empty file.
    for (const sprite of STOCK_SPRITES) {
      expect(STOCK_IMAGES[sprite.id], sprite.id).toMatch(
        /^data:image\/png;base64,/,
      );
      expect(sprite.dataUrl).toBe(STOCK_IMAGES[sprite.id]);
    }
  });

  it('marks the grids as grids, and nothing else', () => {
    // A drawing is a grid exactly when the generator drew it as a strip of
    // frames; that is what its `.sheet` says on import (appearance/sheetFile),
    // and an unmarked strip is a wide picture with no cells to pick.
    for (const sprite of STOCK_SPRITES) {
      const drawnAsStrip = sprite.id in generator.ANIMATION_SPECS;
      expect(Boolean(sprite.sheet), sprite.id).toBe(drawnAsStrip);
      if (sprite.sheet) {
        expect(sprite.sheet.cell, sprite.id).toEqual({
          width: STOCK_CELL,
          height: STOCK_CELL,
        });
      }
    }
  });

  it('reads as many frames out of a strip as the strip has', () => {
    for (const animation of STOCK_ANIMATIONS) {
      for (const def of Object.values(animation.document.animations)) {
        const strip = def.frames.filter(frame => frame.position);
        if (strip.length === 0) {
          continue; // a scaling animation, not a strip
        }
        const spec = generator.ANIMATION_SPECS[animation.id];
        expect(spec, animation.id).toBeDefined();
        expect(strip.length).toBe(spec.frames);
        // Every rectangle lands inside the drawing.
        for (const frame of strip) {
          expect(frame.position!.x + frame.position!.width).toBeLessThanOrEqual(
            spec.frames * STOCK_CELL,
          );
        }
      }
    }
  });

  it('names the image file each animation reads, and ships it', () => {
    for (const animation of STOCK_ANIMATIONS) {
      const named = new Set(
        Object.values(animation.document.animations).flatMap(def =>
          def.frames.map(frame => frame.sprite),
        ),
      );
      expect([...named].sort()).toEqual(
        animation.sprites.map(spriteFileName).sort(),
      );
      for (const id of animation.sprites) {
        expect(
          STOCK_SPRITES.some(sprite => sprite.id === id),
          id,
        ).toBe(true);
      }
    }
  });
});
