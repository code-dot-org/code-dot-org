// Per-instance bounds for a `world_slider`.
//
// The block's range is not a property of the block type — it comes from the
// effect parameter the block is standing in for. `ripple.strength` runs 0 to
// 0.1 and `pulse.speed` runs 0 to 12, and both are the same block. So the
// bounds travel in the block's `extraState`, which is exactly what extraState
// is for: the part of a block's shape that its type cannot know.
//
// This is a mutator with no dialog. Blockly reaches `saveExtraState` /
// `loadExtraState` through the mutator seam whether or not there is any UI
// behind it, and there is nothing here for a learner to reshape — the range is
// the effect author's, not theirs.

import {defineMutator} from '@code-dot-org/blockly';

import {niceStep, type FieldSlider} from '../fields/FieldSlider';

export const SLIDER_RANGE_MUTATOR = 'slider_range_mutator';

/** A slider's bounds, as stored on the block. */
export interface SliderRangeState {
  min: number;
  max: number;
  /**
   * Rounding step; `1` makes an integer slider. Omitted derives one from the
   * range (see `niceStep`) rather than leaving the value unrounded — a raw
   * drag produces values like 0.043271604938, which is noise on the block.
   */
  precision?: number;
}

/** The range a slider falls back to with no state of its own: a plain 0–1. */
export const DEFAULT_SLIDER_RANGE: SliderRangeState = {min: 0, max: 1};

export const sliderRangeMutator = defineMutator(SLIDER_RANGE_MUTATOR, {
  sliderRange_: {...DEFAULT_SLIDER_RANGE} as SliderRangeState,

  saveExtraState(): SliderRangeState {
    return {...this.sliderRange_};
  },

  loadExtraState(state: SliderRangeState): void {
    this.sliderRange_ = {...DEFAULT_SLIDER_RANGE, ...state};
    this.applySliderRange_();
  },

  /**
   * Push the range onto the field.
   *
   * `setConstraints` is `FieldNumber`'s own, so it governs the typed value as
   * much as the dragged one: a learner who types 5 into a 0–1 knob gets 1,
   * which is the same answer dragging past the end gives. One range, both
   * routes to it.
   */
  applySliderRange_(): void {
    const field = this.getField('NUM') as FieldSlider | null;
    if (!field) {
      return;
    }
    const {min, max, precision} = this.sliderRange_;
    // The step applies to a typed value as much as a dragged one. That is
    // `FieldNumber.setConstraints`, and it is the right trade: a knob whose
    // slider snaps to 0.02 but whose text box accepts 0.0234 would be showing
    // a value its own control cannot express.
    field.setConstraints(min, max, precision ?? niceStep(min, max));
    // Re-clamp what is already there: a saved value can fall outside a range
    // that has since been narrowed by an edit to the `.effect` file.
    field.setValue(field.getValue());
  },
});
