// A field that draws the block a `define block` (or `define event`) will make.
//
// `define block` designs the block a rule adds to the palette, and the whole
// point of it is that the definition looks like the thing defined. Laying the
// signature out as FIELDS on the definition gets the words right but not the
// block: no outline, no category color, no sockets — a learner reads
// `push [amount] toward [target]` and still has to imagine what will turn up in
// the toolbox.
//
// So this draws the real thing: one block built from the current signature with
// a getter plugged into each socket, so the drawing carries the shape, the
// color, the tabs and the parameter names at once. The workspace it draws on,
// and the care about when that workspace may be made, are `FieldBlockDrawing`.
//
// What this adds on top is a transparent overlay, which turns a press on a
// parameter into a getter dragged out onto the real workspace (dragGetterOut).

import * as Blockly from 'blockly/core';

import {enumOptions, enumRefOfParamType} from '../enums';
import {paramFlavour} from '../typedVariables';

import {beginGetterDrag} from './dragGetterOut';
import {DRAWING_PAD, FieldBlockDrawing} from './FieldBlockDrawing';

/**
 * What the design makes: a block to call, or an event's hat.
 *
 * They are drawn differently because they ARE different blocks. A hat opens
 * with `when ⟨this actor⟩` and its parameters are dropdowns — the choice a
 * handler filters on is picked on the hat, not plugged into it (specs/ENUMS.md)
 * — where a call site's parameters are sockets a value goes into.
 */
export type PreviewKind = 'block' | 'event';

/** One piece of the drawn block, mirroring a designer part. */
export interface PreviewPart {
  kind: 'label' | 'param';
  /** A label's wording. */
  text?: string;
  /** A parameter's displayed name and value type. */
  name?: string;
  type?: string;
  /** A parameter's variable on the HOST workspace — what a drag hands out. */
  var?: string;
}

/**
 * A value block's style by the kind it reports — the same mapping the generated
 * query blocks use (`valueStyle` in domainBlocks). Duplicated rather than
 * imported because domainBlocks imports the designer that owns this field, and
 * the cycle is not worth six lines.
 */
const styleForReturn = (returns: string): string =>
  returns === 'boolean'
    ? 'logic_blocks'
    : returns === 'vector'
      ? 'location_blocks'
      : 'math_blocks';

/**
 * The filter dropdown's first entry, as the real hat has it (domainBlocks).
 *
 * Duplicated for the same reason `styleForReturn` is: domainBlocks imports the
 * designer that owns this field, and two words are not worth the cycle.
 */
const ANY_CHOICE: [string, string] = ['(any)', ''];

export class FieldBlockPreview extends FieldBlockDrawing {
  private parts: PreviewPart[] = [];
  private returns = 'none';
  /** What KIND of block is being designed — see `setSignature`. */
  private kind: PreviewKind = 'block';
  /** Whether the drawn block takes a subject — see `setSignature`. */
  private subject = false;
  /** Field-local boxes of each parameter, for the overlay's hit test. */
  private paramBoxes: Array<{
    part: PreviewPart;
    x: number;
    y: number;
    w: number;
    h: number;
  }> = [];
  private overlay: SVGRectElement | null = null;
  /** Which socket the subject took, or -1 — worked out while drawing. */
  private subjectSocket = -1;

  /**
   * The signature to draw. Safe before the field is in the DOM.
   *
   * `actorScoped` is placement, not signature: a member defined under a trait is
   * asked OF an actor, so the block it makes carries an extra `Actor` socket
   * that nobody wrote into the parts — trailing after "on" for an action,
   * leading for a query, which is how the generated call sites read. Drawing it
   * is the point: otherwise the preview is a different block from the one the
   * definition makes, in exactly the case a learner is most likely to wonder
   * about.
   */
  setSignature(
    parts: PreviewPart[],
    returns: string,
    actorScoped = false,
    kind: PreviewKind = 'block',
  ): void {
    this.parts = parts;
    this.returns = returns;
    this.subject = actorScoped;
    this.kind = kind;
    this.redraw();
  }

  /** The overlay that takes the presses, made before the drawing under it. */
  protected override initChrome(group: SVGGElement): void {
    this.overlay = Blockly.utils.dom.createSvgElement<SVGRectElement>(
      Blockly.utils.Svg.RECT,
      {fill: 'transparent', x: 0, y: 0, width: 0, height: 0},
      group,
    );
    Blockly.browserEvents.conditionalBind(
      this.overlay,
      'pointerdown',
      this,
      this.onPress,
    );
  }

  protected override resized(size: Blockly.utils.Size): void {
    this.overlay?.setAttribute('width', String(size.width));
    this.overlay?.setAttribute('height', String(size.height));
  }

  /** The parameters that get a socket — a hat's are fields, and get none. */
  private drawnParams(): PreviewPart[] {
    return this.kind === 'event'
      ? []
      : this.parts.filter(part => part.kind === 'param');
  }

  /** Where the subject's socket landed, or -1 for a block that takes none. */
  private subjectSlot(params: PreviewPart[]): number {
    if (this.kind === 'event') {
      return this.subject ? 0 : -1;
    }
    if (!this.subject) {
      return -1;
    }
    return this.returns && this.returns !== 'none' ? 0 : params.length;
  }

  protected override fill(
    block: Blockly.BlockSvg,
    mini: Blockly.WorkspaceSvg,
  ): void {
    this.paramBoxes = [];
    // A hat's parameters are fields on it, not sockets, so there is nothing
    // to plug in and nothing to drag out of one: the choice a handler filters
    // on is picked, not passed.
    const params = this.drawnParams();
    // The subject's socket, wherever it landed: filled with `this actor`, the
    // shadow the real call site is seeded with. A hat's leads, when it has
    // one — an event declared on the RULE is about the world, and its hat
    // takes no actor at all (`EventMeta.scope`).
    this.subjectSocket = this.subjectSlot(params);
    if (this.subjectSocket >= 0) {
      const here = mini.newBlock('world_this_actor') as Blockly.BlockSvg;
      here.initSvg();
      block
        .getInput(`P${this.subjectSocket}`)
        ?.connection?.connect(here.outputConnection!);
    }
    params.forEach((part, i) => {
      const flavour = paramFlavour(part.type ?? 'number');
      const name = part.name?.trim() || flavour.type.toLowerCase();
      const variable =
        mini.getVariableMap().getVariable(name, flavour.type) ??
        mini.getVariableMap().createVariable(name, flavour.type);
      const getter = mini.newBlock(flavour.getterType) as Blockly.BlockSvg;
      getter.setFieldValue(variable.getId(), 'VAR');
      getter.initSvg();
      block
        .getInput(`P${this.slotOf(i)}`)
        ?.connection?.connect(getter.outputConnection!);
    });
  }

  /** A parameter's socket number, once the subject has taken the first one. */
  private slotOf(i: number): number {
    return this.subjectSocket === 0 ? i + 1 : i;
  }

  protected override measured(block: Blockly.BlockSvg): void {
    // Each parameter's box, in field coordinates, so a press can be matched to
    // the parameter under it.
    this.drawnParams().forEach((part, i) => {
      const getter = block
        .getInput(`P${this.slotOf(i)}`)
        ?.connection?.targetBlock() as Blockly.BlockSvg | undefined;
      if (!getter) {
        return;
      }
      const at = getter.getRelativeToSurfaceXY();
      const hw = getter.getHeightWidth();
      this.paramBoxes.push({
        part,
        x: at.x + DRAWING_PAD,
        y: at.y + DRAWING_PAD,
        w: hw.width,
        h: hw.height,
      });
    });
  }

  protected override drawnBlock(): Record<string, unknown> {
    const args: Blockly.utils.toolbox.BlockInfo[] = [];
    let message = '';
    const push = (fragment: string) => {
      message += message ? ` ${fragment}` : fragment;
    };
    const actorSocket = () => {
      args.push({
        type: 'input_value',
        name: `P${args.length}`,
        check: 'Actor',
      } as unknown as Blockly.utils.toolbox.BlockInfo);
      push(`%${args.length}`);
    };
    const reportsSomething = this.returns && this.returns !== 'none';

    if (this.kind === 'event') {
      // The HAT this event makes. The subject leads WHEN THERE IS ONE, because
      // that is what the real hat asks first — whose handler this is — and a
      // parameter is drawn as the dropdown it will be, carrying that enum's
      // choices with `(any)` at the front. What is designed here and what turns
      // up in the toolbox are then the same block, down to the words in the
      // menu.
      //
      // Declared on the rule rather than under a trait, the event is about the
      // WORLD: it is raised once, handled on the world, and handed no actor. So
      // the hat opens `when ⟨space⟩ is pressed` with nothing before the choice,
      // and drawing `this actor` there would be a lie about the block.
      push('when');
      if (this.subject) {
        actorSocket();
      }
      for (const part of this.parts) {
        if (part.kind === 'label') {
          if (part.text) {
            push(part.text);
          }
          continue;
        }
        const choice = enumRefOfParamType(part.type ?? '');
        // An event filters on a set of choices or on nothing; a parameter of
        // any other kind has nothing to draw and no meaning here.
        if (!choice) {
          continue;
        }
        args.push({
          type: 'field_dropdown',
          name: `F${args.length}`,
          options: [ANY_CHOICE, ...enumOptions(choice)],
        } as unknown as Blockly.utils.toolbox.BlockInfo);
        push(`%${args.length}`);
      }
    } else {
      // A query leads with its subject ("⟨this actor⟩ is on the ground?"); an
      // action trails it after "on" ("apply force ⟨force⟩ on ⟨this actor⟩").
      if (this.subject && reportsSomething) {
        actorSocket();
      }
      for (const part of this.parts) {
        if (part.kind === 'label') {
          if (part.text) {
            push(part.text);
          }
          continue;
        }
        const check = paramFlavour(part.type ?? 'number').type;
        args.push({
          type: 'input_value',
          name: `P${args.length}`,
          check,
        } as unknown as Blockly.utils.toolbox.BlockInfo);
        push(`%${args.length}`);
      }
      if (this.subject && !reportsSomething) {
        push('on');
        actorSocket();
      }
    }

    const reports = this.kind !== 'event' && reportsSomething;
    return {
      // Never empty: Blockly cannot lay out a block with no message at all.
      message0: message || ' ',
      args0: args,
      inputsInline: true,
      // A hat opens a stack and closes nothing above it; a block that reports
      // plugs in and takes the color of what it reports; a block that acts
      // stacks. This is what the call site will be.
      ...(this.kind === 'event'
        ? {nextStatement: null, style: 'event_blocks'}
        : reports
          ? {
              output: paramFlavour(this.returns).type,
              style: styleForReturn(this.returns),
            }
          : {previousStatement: null, nextStatement: null, style: 'default'}),
    };
  }

  /** A press on a parameter pulls a getter for it onto the real workspace. */
  private onPress(e: PointerEvent): void {
    const block = this.getSourceBlock() as Blockly.BlockSvg | null;
    const workspace = block?.workspace as Blockly.WorkspaceSvg | undefined;
    if (!workspace || workspace.isReadOnly() || !this.overlay) {
      return;
    }
    const bounds = this.overlay.getBoundingClientRect();
    const scale = workspace.scale || 1;
    const local = {
      x: (e.clientX - bounds.left) / scale,
      y: (e.clientY - bounds.top) / scale,
    };
    const hit = this.paramBoxes.find(
      box =>
        local.x >= box.x &&
        local.x <= box.x + box.w &&
        local.y >= box.y &&
        local.y <= box.y + box.h,
    );
    if (!hit?.part.var) {
      return;
    }
    // Claimed, or Blockly drags the definition block out of its stack instead.
    e.stopPropagation();
    e.preventDefault();
    beginGetterDrag({
      workspace,
      variableId: hit.part.var,
      getterType: paramFlavour(hit.part.type ?? 'number').getterType,
      event: e,
    });
  }
}
