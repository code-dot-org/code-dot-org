// A number field with a slider drawn beside it, dragged in place.
//
// Effect parameters are bounded — "strength, 0 to 0.1" — and a bare number
// socket throws that bound away: the learner is left typing values into a range
// they cannot see, where 0.35 and 0.035 look equally plausible and one of them
// does nothing. A slider shows the range and makes the whole of it reachable by
// dragging.
//
// It subclasses `FieldNumber` rather than replacing it, so the number stays
// exactly as editable as it was — click the digits and Blockly opens its usual
// inline text input, type anything, and `FieldNumber`'s own min/max clamp it.
// There is one value, held where it always was; the slider is a second way to
// reach it, not a second copy of it.
//
// The drag is handled here rather than in a popup. Blockly's stock slider
// (`@blockly/field-slider`) opens a dropdown, which costs a click to open, a
// drag, and a click to dismiss for what should be one gesture — and hides the
// value's position in its range at exactly the moment you want to see it. The
// cost of doing it inline is that we intercept `pointerdown` before Blockly's
// gesture machinery sees it (see `beginDrag`), because otherwise dragging the
// thumb would drag the block out of the workspace.

import * as Blockly from 'blockly/core';

import {getCSSVariable} from '@code-dot-org/blockly';
import {PluginType} from '@code-dot-org/blockly/plugins';
import type {FieldPlugin} from '@code-dot-org/blockly/plugins';

/** The field type name (the `type` a block arg resolves to). */
export const FIELD_SLIDER_NAME = 'field_slider';

/** Track length in workspace units. Wide enough to aim, short enough to fit. */
const TRACK_WIDTH = 54;
/** Gap between the track and the number text. */
const TRACK_GAP = 8;
const TRACK_HEIGHT = 4;
const THUMB_RADIUS = 6;
/** Left inset, when the renderer's own field padding is unavailable. */
const DEFAULT_PAD = 5;

/**
 * The slider is drawn to the LEFT of the number, which is not the reading order
 * you would pick on a page.
 *
 * It has to be. The number's width changes with the value — "0.02" is wider
 * than "0.1" — so with the track on the right it shifts sideways as you drag
 * it, sliding out from under the pointer and, at the moment the digit count
 * changes, jumping. On the left the track's origin is fixed to the field's own
 * edge and only the text past it moves, which nothing is touching.
 */

/**
 * Round a range to a step a learner can land on.
 *
 * Dragging a 54px track yields about forty distinguishable positions, so a raw
 * mapping produces values like 0.043271604938 — noise presented as precision,
 * and unreadable on the block. This picks the 1/2/5-times-a-power-of-ten step
 * nearest to a hundredth of the range: finer than the drag can resolve, so it
 * never fights the gesture, and coarse enough that every value reads cleanly.
 *
 *   0 – 0.1  ->  0.001     0 – 1   ->  0.01
 *   0 – 12   ->  0.2       2 – 128 ->  2
 */
export function niceStep(min: number, max: number): number {
  const span = Math.abs(max - min);
  if (!Number.isFinite(span) || span === 0) {
    return 0;
  }
  const exponent = Math.floor(Math.log10(span / 100));
  const magnitude = Math.pow(10, exponent);
  const fraction = span / 100 / magnitude;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * magnitude;
}

export type FieldSliderConfig = Blockly.FieldNumberFromJsonConfig;

export class FieldSlider extends Blockly.FieldNumber {
  private track: SVGRectElement | null = null;
  private fill: SVGRectElement | null = null;
  private thumb: SVGCircleElement | null = null;
  /** Bound pointer listeners, live only for the duration of one drag. */
  private moveBinding: Blockly.browserEvents.Data | null = null;
  private upBinding: Blockly.browserEvents.Data | null = null;
  /** Where the number ends and the slider begins, from the last layout pass. */
  private trackLeft = 0;

  static override fromJson(options: FieldSliderConfig): FieldSlider {
    return new FieldSlider(
      options.value ?? 0,
      options.min,
      options.max,
      options.precision,
    );
  }

  /**
   * Draw the track and thumb, and take over pointer events on them.
   *
   * `super.initView()` builds the border rect and the number text; everything
   * added here sits to the right of it inside the same field group, so the two
   * move and scale together as one field.
   */
  override initView(): void {
    super.initView();
    const group = this.fieldGroup_;
    if (!group) {
      return;
    }
    const svg = <T extends SVGElement>(
      tag: Blockly.utils.Svg<T>,
      attrs: Record<string, string | number>,
    ) => Blockly.utils.dom.createSvgElement<T>(tag, attrs, group);

    this.track = svg(Blockly.utils.Svg.RECT, {
      rx: TRACK_HEIGHT / 2,
      ry: TRACK_HEIGHT / 2,
      height: TRACK_HEIGHT,
      width: TRACK_WIDTH,
    });
    // The portion left of the thumb, so the value reads at a glance even when
    // the thumb is at an end and there is nothing to compare it against.
    this.fill = svg(Blockly.utils.Svg.RECT, {
      rx: TRACK_HEIGHT / 2,
      ry: TRACK_HEIGHT / 2,
      height: TRACK_HEIGHT,
      width: 0,
    });
    this.thumb = svg(Blockly.utils.Svg.CIRCLE, {r: THUMB_RADIUS});
    this.thumb.style.cursor = 'ew-resize';
    this.track.style.cursor = 'ew-resize';

    // Claim pointerdown on the track and thumb before it reaches the block.
    for (const target of [this.track, this.thumb]) {
      Blockly.browserEvents.conditionalBind(
        target,
        'pointerdown',
        this,
        this.beginDrag,
      );
    }
  }

  /**
   * Reserve room for the slider on top of whatever the number needs.
   *
   * `super` sizes the field to its text and lays the border rect over that; the
   * rect is then stretched to cover the slider too, so the field reads as one
   * control rather than a number with something stuck to it.
   */
  protected override updateSize_(margin?: number): void {
    super.updateSize_(margin);
    this.trackLeft =
      this.getConstants()?.FIELD_BORDER_RECT_X_PADDING ?? DEFAULT_PAD;
    this.size_.width += TRACK_WIDTH + TRACK_GAP;
    this.size_.height = Math.max(this.size_.height, THUMB_RADIUS * 2 + 2);
    this.borderRect_?.setAttribute('width', String(this.size_.width));
    this.borderRect_?.setAttribute('height', String(this.size_.height));
    this.layoutSlider();
  }

  /** Push the number past the track, which owns the left of the field. */
  protected override positionTextElement_(
    xOffset: number,
    contentWidth: number,
  ): void {
    super.positionTextElement_(xOffset + TRACK_WIDTH + TRACK_GAP, contentWidth);
  }

  /** Put the track and thumb where the current value says they go. */
  private layoutSlider(): void {
    if (!this.track || !this.fill || !this.thumb) {
      return;
    }
    const midline = this.size_.height / 2;
    const left = this.trackLeft;
    const usable = TRACK_WIDTH - THUMB_RADIUS * 2;
    const filled = usable * this.fraction();

    this.track.setAttribute('x', String(left));
    this.track.setAttribute('y', String(midline - TRACK_HEIGHT / 2));
    this.fill.setAttribute('x', String(left));
    this.fill.setAttribute('y', String(midline - TRACK_HEIGHT / 2));
    this.fill.setAttribute('width', String(THUMB_RADIUS + filled));
    this.thumb.setAttribute('cx', String(left + THUMB_RADIUS + filled));
    this.thumb.setAttribute('cy', String(midline));
    this.applySliderColour();
  }

  /** Where the value sits in its range, 0..1. */
  private fraction(): number {
    const min = this.getMin();
    const max = this.getMax();
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
      return 0;
    }
    const value = Number(this.getValue() ?? min);
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }

  /**
   * Colour the slider from the design system rather than the block.
   *
   * A shadow block takes the colour of whatever it is plugged into, so a track
   * tinted from the block would change hue between an actor effect and a world
   * effect for no reason a learner could name.
   */
  private applySliderColour(): void {
    const track = getCSSVariable('background-neutral-tertiary') || '#e8eaed';
    const fill = getCSSVariable('background-brand-purple-primary') || '#9657c7';
    const edge = getCSSVariable('borders-neutral-strong') || '#9aa0a6';
    this.track?.setAttribute('fill', track);
    this.fill?.setAttribute('fill', fill);
    this.thumb?.setAttribute('fill', fill);
    this.thumb?.setAttribute('stroke', edge);
    this.thumb?.setAttribute('stroke-width', '1');
  }

  override applyColour(): void {
    super.applyColour();
    this.applySliderColour();
  }

  protected override render_(): void {
    super.render_();
    this.layoutSlider();
  }

  /**
   * Start dragging the thumb.
   *
   * `stopPropagation` is the crux: Blockly starts a block drag from a
   * `pointerdown` that reaches the block's SVG, so without this every attempt
   * to move the thumb would pull the block off its socket instead. Claiming the
   * event here also means `showEditor_` never fires for a track click, so
   * dragging never opens the text input over the number.
   *
   * The whole drag is one undo entry: an event group is opened here and closed
   * on release, so a learner who drags from 0 to 0.08 and regrets it presses
   * undo once rather than forty times.
   */
  private beginDrag(e: PointerEvent): void {
    if (!this.isCurrentlyEditable() || Blockly.browserEvents.isRightButton(e)) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    Blockly.Events.setGroup(true);
    this.moveBinding = Blockly.browserEvents.conditionalBind(
      document,
      'pointermove',
      this,
      this.continueDrag,
      // Bind without the capture-identifier check: the pointer leaves the thumb
      // almost immediately in any real drag, and these must keep firing.
      true,
    );
    this.upBinding = Blockly.browserEvents.conditionalBind(
      document,
      'pointerup',
      this,
      this.endDrag,
      true,
    );
    this.setFromPointer(e);
  }

  private continueDrag(e: PointerEvent): void {
    e.preventDefault();
    this.setFromPointer(e);
  }

  private endDrag(): void {
    if (this.moveBinding) {
      Blockly.browserEvents.unbind(this.moveBinding);
      this.moveBinding = null;
    }
    if (this.upBinding) {
      Blockly.browserEvents.unbind(this.upBinding);
      this.upBinding = null;
    }
    Blockly.Events.setGroup(false);
  }

  /**
   * Map a pointer position to a value.
   *
   * Measured off the track's own client rect, so workspace zoom and scroll are
   * already accounted for — converting through the workspace transform by hand
   * gets this wrong the moment someone zooms.
   */
  private setFromPointer(e: PointerEvent): void {
    if (!this.track) {
      return;
    }
    const rect = this.track.getBoundingClientRect();
    const inset = (THUMB_RADIUS / TRACK_WIDTH) * rect.width;
    const usable = rect.width - inset * 2;
    if (usable <= 0) {
      return;
    }
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left - inset) / usable),
    );
    const min = this.getMin();
    const max = this.getMax();
    // `setValue` runs the inherited validator, which rounds to the field's
    // precision — so a slider on an integer parameter yields integers without
    // knowing anything about precision itself.
    this.setValue(min + ratio * (max - min));
  }

  override dispose(): void {
    this.endDrag();
    super.dispose();
  }
}

/**
 * A block arg for a slider field: `fieldSliderArg('NUM', 0.02, {min: 0, max: 0.1})`.
 *
 * Mirrors `fieldVectorArg`. The bounds given here are the block *definition's*
 * defaults; a block placed as an effect parameter's shadow overrides them per
 * instance from that parameter's own declared range (see `sliderRange`).
 */
export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: FIELD_SLIDER_NAME,
  field: FieldSlider,
};

export const fieldSliderArg = (
  name: string,
  value: number,
  bounds: {min: number; max: number; precision?: number} = {min: 0, max: 1},
) =>
  ({
    type: plugin,
    name,
    value,
    min: bounds.min,
    max: bounds.max,
    precision: bounds.precision,
  }) as const;

export default plugin;
