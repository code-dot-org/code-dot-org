/**
 * The runtime half of the trait blocks. SpriteLab2Engine.createLibrary puts
 * these on library.commands, and P5Lab then exposes every command name as an
 * interpreter global, so no separate registration is needed.
 *
 * A prediction is a network round trip, so `predict` takes a callback rather
 * than returning a value, and the answer is parked on the sprite for the
 * `prediction of` block to read.
 */

import {commands as mlCommands} from '@cdo/apps/lib/util/mlApi';

import {isTrainerSupported, ModelCard} from './modelCard';
import {
  buildTestData,
  resolveTrait,
  TraitValue,
  TraitValues,
} from './traitStore';

/** A p5.play sprite, in the parts this file touches. */
interface TraitSprite {
  removed?: boolean;
  traits?: TraitValues;
  prediction?: string;
  getAnimationLabel?: () => string;
}

/**
 * CoreLibrary plus the three members SpriteLab2Engine adds for traits.
 * `animationTraits` is keyed by costume NAME, because that is what
 * getAnimationLabel returns; the animation list itself is keyed by uuid.
 */
export interface TraitLibrary {
  getSpriteArray: (spriteArg: unknown) => TraitSprite[];
  animationTraits: {[costumeName: string]: TraitValues};
  modelCard?: ModelCard;
}

function costumeTraitsFor(
  library: TraitLibrary,
  sprite: TraitSprite
): TraitValues | undefined {
  const costume = sprite.getAnimationLabel?.();
  return costume ? library.animationTraits[costume] : undefined;
}

export function createTraitCommands(library: TraitLibrary) {
  return {
    /**
     * Feature values for one sprite, overriding what its costume carries.
     * Without this, two sprites wearing the same costume can never differ.
     */
    setTraitOfSprite(spriteArg: unknown, key: string, value: TraitValue) {
      for (const sprite of library.getSpriteArray(spriteArg)) {
        sprite.traits = {...(sprite.traits || {}), [key]: value};
      }
    },

    traitOfSprite(spriteArg: unknown, key: string): TraitValue | string {
      const sprite = library.getSpriteArray(spriteArg)[0];
      if (!sprite) {
        return '';
      }
      const own = sprite.traits?.[key];
      if (own !== undefined && own !== '') {
        return own;
      }
      return costumeTraitsFor(library, sprite)?.[key] ?? '';
    },

    /**
     * The sprite's feature values as one sentence, for a question to a
     * generative model: "Leaf Spots is many, Soil Moisture is wet". Names
     * come from the imported model; unset features are left out.
     */
    featuresOfSprite(spriteArg: unknown): string {
      const sprite = library.getSpriteArray(spriteArg)[0];
      const card = library.modelCard;
      if (!sprite || !card) {
        return '';
      }
      const source = {
        spriteTraits: sprite.traits,
        costumeTraits: costumeTraitsFor(library, sprite),
      };
      return card.fields
        .map(field => [field.id, resolveTrait(source, field.key)] as const)
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) => `${name} is ${value}`)
        .join(', ');
    },

    predictionOfSprite(spriteArg: unknown): string {
      return library.getSpriteArray(spriteArg)[0]?.prediction ?? '';
    },

    predictForSprite(spriteArg: unknown, callback?: () => void) {
      const sprite = library.getSpriteArray(spriteArg)[0];
      if (!sprite) {
        return;
      }
      const finish = (value: string) => {
        // A rerun destroys every sprite and builds a new library, so a late
        // answer must not write onto a sprite the student can no longer see.
        if (sprite.removed) {
          return;
        }
        sprite.prediction = value;
        callback?.();
      };

      const card = library.modelCard;
      if (!card) {
        finish('No model chosen');
        return;
      }
      // MLTrainers.predict answers a trainer it cannot run with the STRING
      // 'Error: unknown trainer', which a student would read as the
      // prediction. Stop here instead, and say which trainer it was.
      if (!isTrainerSupported(card)) {
        finish(`Cannot run a ${card.trainer} model yet`);
        return;
      }

      const {testData, missing} = buildTestData(card, {
        spriteTraits: sprite.traits,
        costumeTraits: costumeTraitsFor(library, sprite),
      });
      // Partial features are worse than no answer: predict maps each absent
      // value to NaN and ml-knn still returns a class for it.
      if (missing.length) {
        finish(`Missing: ${missing.join(', ')}`);
        return;
      }

      mlCommands
        .getPrediction({
          modelId: card.modelId,
          testValues: testData,
          callback: (value: string) => finish(value),
        })
        .catch(() => finish('Prediction failed'));
    },
  };
}
