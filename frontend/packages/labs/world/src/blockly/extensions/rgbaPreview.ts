// The swatch on the `r g b a` block.
//
// Four sliders tell you the channels and nothing about the color. 0.2 / 1 /
// 0.4 is green, but only to someone who already knows; the point of dragging
// them is to arrive at a color, and until now the only way to see the result
// was to run the game.
//
// So the block leads with a `field_colour`, which does double duty. It shows
// what the channels currently add up to, live as they are dragged. And clicking
// it opens the same grid of presets the plain picker offers, which writes those
// channels — so a learner can start from "green" and then adjust it, rather
// than having to reach green by arithmetic.
//
// THE SOCKETS ARE THE TRUTH. The swatch never overrides them: picking a preset
// writes to the channels and the swatch is then re-derived from what they
// actually hold. If a channel is driven by something we cannot write — a
// variable, a query, arithmetic — the preset simply does not take there, and
// the swatch visibly disagrees with what was picked. That is honest feedback
// that something else owns that channel, and it beats silently discarding the
// learner's block.

import type {Block} from 'blockly';

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {rgb, toHex} from '../../engine';

export const RGBA_PREVIEW_EXTENSION = 'world_rgba_preview';

/** The channel inputs the swatch reflects. Alpha is not a color. */
const CHANNELS = ['R', 'G', 'B'] as const;

/** The field a channel's value lives in, on a slider or a plain number. */
const VALUE_FIELD = 'NUM';

/**
 * A channel's current value, or undefined when nothing readable holds it.
 *
 * "Readable" means a block with a `NUM` field — the slider shadow, or a
 * `math_number` a learner dropped in. Anything else is a computation whose
 * value is not known until the game runs.
 */
function readChannel(block: Block, input: string): number | undefined {
  const target = block.getInputTargetBlock(input);
  if (!target || !target.getField(VALUE_FIELD)) {
    return undefined;
  }
  const value = Number(target.getFieldValue(VALUE_FIELD));
  return Number.isFinite(value) ? value : undefined;
}

export const rgbaPreviewExtension: Extension = defineExtension(
  RGBA_PREVIEW_EXTENSION,
  {
    extension() {
      const block = this as Block;
      const field = block.getField('PREVIEW') as Blockly.Field<string> | null;
      if (!field) {
        return;
      }

      // One flag for both directions. Without it the sync loops: writing a
      // channel fires a change event, which re-derives the swatch, which runs
      // the validator, which writes the channels again.
      let syncing = false;

      /** Re-derive the swatch from whatever the channels now hold. */
      const fromChannels = (): void => {
        const values = CHANNELS.map(input => readChannel(block, input));
        // An unreadable channel shows as 0 rather than blanking the swatch: the
        // block that owns it is right there to see, and two of three channels
        // is still worth showing.
        const hex = toHex(values.map(value => value ?? 0));
        if (field.getValue() !== hex) {
          syncing = true;
          try {
            field.setValue(hex);
          } finally {
            syncing = false;
          }
        }
      };

      /** Push a picked preset out to the channels that can take it. */
      const toChannels = (hex: string): void => {
        const values = rgb(hex);
        syncing = true;
        try {
          CHANNELS.forEach((input, index) => {
            const target = block.getInputTargetBlock(input);
            // Only where a value already lives. A channel holding real logic
            // keeps it; the swatch will show that it did not take.
            if (target?.getField(VALUE_FIELD)) {
              target.setFieldValue(values[index], VALUE_FIELD);
            }
          });
        } finally {
          syncing = false;
        }
        // The channels may have rounded what they were given (a slider snaps to
        // its step), so read back rather than trusting the preset.
        fromChannels();
      };

      field.setValidator(function (this: unknown, value: string) {
        if (!syncing) {
          // Deferred: a validator runs BEFORE the field takes the value, and
          // `fromChannels` at the end of `toChannels` would then be overwritten
          // by the value being validated.
          setTimeout(() => toChannels(value), 0);
        }
        return value;
      });

      block.setOnChange(function (this: Block, event: Blockly.Events.Abstract) {
        // Cheap enough to run on anything that is not pure chrome: it reads
        // three fields and usually finds the swatch already correct.
        if (event.isUiEvent || syncing) {
          return;
        }
        fromChannels();
      });

      fromChannels();
    },
  },
);
