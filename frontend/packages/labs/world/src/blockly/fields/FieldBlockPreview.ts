// A field that draws a block.
//
// `define block` designs the block a rule adds to the palette, and the whole
// point of it is that the definition looks like the thing defined. Laying the
// signature out as FIELDS on the definition gets the words right but not the
// block: no outline, no category color, no sockets — a learner reads
// `push [amount] toward [target]` and still has to imagine what will turn up in
// the toolbox.
//
// So this draws the real thing. A field is an SVG group Blockly asks for a size,
// which means anything that renders into that group works — including blocks. A
// private `WorkspaceSvg` lives inside the field, holding one block built from
// the current signature with a getter plugged into each socket, so the drawing
// carries the shape, the color, the tabs and the parameter names at once. Core
// does the same thing for mutator bubbles (`MiniWorkspaceBubble`), and CDO
// Blockly does it for sprite lab's mini-toolboxes (`CdoFieldFlyout`).
//
// It is a DRAWING, not a workspace you can touch: the mini workspace takes no
// pointer events, and a transparent overlay over the field turns a press on a
// parameter into a getter dragged out onto the real workspace (dragGetterOut).
// Blocks that could be picked up would be picked up on a workspace with no
// visible extent, and dropping one anywhere would go nowhere.

import * as Blockly from 'blockly/core';

import {enumOptions, enumRefOfParamType} from '../enums';
import {paramFlavour} from '../typedVariables';

import {beginGetterDrag} from './dragGetterOut';

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

/** Where the drawing sits inside the field, so it does not touch the edges. */
const PAD = 2;

/** Marks the drawing's container, for the rule below. */
const PREVIEW_CLASS = 'worldBlockPreview';

// The drawing must not take a single pointer event, and saying so on the
// container is NOT enough: Blockly's own stylesheet sets `pointer-events` on
// fields and paths, and a descendant that sets the property wins over an
// ancestor that set it to `none`. Anything that got through started a gesture on
// a workspace with no visible extent, which surfaced as:
//
//   Tried to call gesture.setStartField, but the gesture had already been started
//   Block not present in workspace's list of top-most blocks
//
// — the second one from a drag whose connection previewer and dragged block had
// ended up on different workspaces. Hence `!important`, on everything inside.
Blockly.Css.register(`
.${PREVIEW_CLASS}, .${PREVIEW_CLASS} * {
  pointer-events: none !important;
}
`);

export class FieldBlockPreview extends Blockly.Field<string> {
  override EDITABLE = false;
  override SERIALIZABLE = false;

  /** The workspace the drawing lives on. Disposed with the field. */
  private mini: Blockly.WorkspaceSvg | null = null;
  /** The block type registered for this field's drawing; unique per instance. */
  private previewType = '';
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

  constructor() {
    super('');
  }

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
    this.isDirty_ = true;
    if (this.mini) {
      this.build();
      // The drawing decides the field's size, and the field's size decides the
      // definition block's layout — so a re-signed field has to push a re-render
      // rather than wait to be asked for its size.
      this.forceRerender();
    }
  }

  /**
   * Build the field: a workspace to draw on, and an overlay to take the presses.
   *
   * `super.initView()` is deliberately NOT called — it makes a border rect and a
   * text element this field has no use for, and the base rendering that would
   * then measure them is overridden below.
   */
  override initView(): void {
    const host = this.getSourceBlock()?.workspace as
      | Blockly.WorkspaceSvg
      | undefined;
    if (!host || !this.fieldGroup_) {
      return;
    }
    // The host's own options, so the drawing gets the same renderer, theme and
    // constants — otherwise it is the right shape in the wrong colors.
    this.mini = new Blockly.WorkspaceSvg(host.options);
    const canvas = this.mini.createDom() as SVGGElement;
    // The drawing is inert: every press belongs to the overlay below, which
    // knows what to do with it. See the stylesheet registered above — this class
    // is what turns pointer events off, all the way down.
    canvas.classList.add(PREVIEW_CLASS);
    canvas.setAttribute('transform', `translate(${PAD}, ${PAD})`);
    this.fieldGroup_.appendChild(canvas);

    this.overlay = Blockly.utils.dom.createSvgElement<SVGRectElement>(
      Blockly.utils.Svg.RECT,
      {fill: 'transparent', x: 0, y: 0, width: 0, height: 0},
      this.fieldGroup_,
    );
    Blockly.browserEvents.conditionalBind(
      this.overlay,
      'pointerdown',
      this,
      this.onPress,
    );
    this.build();
  }

  /** Draw the current signature, and measure what came out. */
  private build(): void {
    const mini = this.mini;
    if (!mini) {
      return;
    }
    // Silently: these blocks are a drawing, and a create event for one would be
    // recorded in the file's undo stack and re-serialized as if it were content.
    const enabled = Blockly.Events.isEnabled();
    if (enabled) {
      Blockly.Events.disable();
    }
    try {
      mini.clear();
      this.registerPreviewType();
      const block = mini.newBlock(this.previewType) as Blockly.BlockSvg;
      block.initSvg();
      this.paramBoxes = [];
      // A hat's parameters are fields on it, not sockets, so there is nothing
      // to plug in and nothing to drag out of one: the choice a handler filters
      // on is picked, not passed.
      const params =
        this.kind === 'event'
          ? []
          : this.parts.filter(part => part.kind === 'param');
      // The subject's socket, wherever it landed: filled with `this actor`, the
      // shadow the real call site is seeded with. A hat's leads, always.
      const subjectSocket =
        this.kind === 'event'
          ? 0
          : this.subject
            ? this.subject && this.returns && this.returns !== 'none'
              ? 0
              : params.length
            : -1;
      if (subjectSocket >= 0) {
        const here = mini.newBlock('world_this_actor') as Blockly.BlockSvg;
        here.initSvg();
        block
          .getInput(`P${subjectSocket}`)
          ?.connection?.connect(here.outputConnection!);
      }
      const slotOf = (i: number) => (subjectSocket === 0 ? i + 1 : i);
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
          .getInput(`P${slotOf(i)}`)
          ?.connection?.connect(getter.outputConnection!);
      });
      // Rendered now: everything below measures the drawing, and a queued render
      // measures as nothing.
      block.queueRender();
      Blockly.renderManagement.triggerQueuedRenders(mini);

      const size = block.getHeightWidth();
      this.size_ = new Blockly.utils.Size(
        size.width + PAD * 2,
        size.height + PAD * 2,
      );
      this.overlay?.setAttribute('width', String(this.size_.width));
      this.overlay?.setAttribute('height', String(this.size_.height));
      // Each parameter's box, in field coordinates, so a press can be matched to
      // the parameter under it.
      params.forEach((part, i) => {
        const getter = block
          .getInput(`P${slotOf(i)}`)
          ?.connection?.targetBlock() as Blockly.BlockSvg | undefined;
        if (!getter) {
          return;
        }
        const at = getter.getRelativeToSurfaceXY();
        const hw = getter.getHeightWidth();
        this.paramBoxes.push({
          part,
          x: at.x + PAD,
          y: at.y + PAD,
          w: hw.width,
          h: hw.height,
        });
      });
    } finally {
      if (enabled) {
        Blockly.Events.enable();
      }
    }
  }

  /**
   * Define the block being drawn.
   *
   * A block definition is global and keyed by type, and the signature changes
   * with every edit, so each field owns a private type it redefines in place
   * rather than sharing one that would race with the next `define block`.
   */
  private registerPreviewType(): void {
    if (!this.previewType) {
      this.previewType = `world_block_preview_${Blockly.utils.idGenerator.genUid()}`;
    }
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
      // The HAT this event makes. The subject leads, because that is what the
      // real hat asks first — whose handler this is — and a parameter is drawn
      // as the dropdown it will be, carrying that enum's choices with `(any)`
      // at the front. What is designed here and what turns up in the toolbox
      // are then the same block, down to the words in the menu.
      push('when');
      actorSocket();
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
    const definition: Record<string, unknown> = {
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
    Blockly.Blocks[this.previewType] = {
      init: function (this: Blockly.Block) {
        this.jsonInit(definition);
      },
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

  /**
   * Nothing to render: `build` sizes the field when the signature changes, and
   * the drawing keeps itself. The base implementation would measure a text
   * element this field never made.
   */
  protected override render_(): void {}

  override dispose(): void {
    // Guarded, and this is not defensive dressing. `WorkspaceSvg.dispose`
    // unregisters itself from the focus manager unconditionally, and a workspace
    // that was never injected was never registered, so it throws:
    //
    //   Attempted to unregister not registered tree: [object Object]
    //
    // A field dispose that throws leaves its BLOCK half-disposed — already out of
    // the workspace's top-block list, but not marked disposed — and the next
    // attempt to dispose it reports the corruption somewhere else entirely:
    //
    //   Block not present in workspace's list of top-most blocks
    //
    // which is what an insertion marker does on every drag. Losing the drawing's
    // workspace is worth strictly less than breaking connections.
    try {
      this.mini?.dispose();
    } catch {
      // Nothing to do: the workspace is being thrown away either way.
    }
    this.mini = null;
    if (this.previewType) {
      delete Blockly.Blocks[this.previewType];
      this.previewType = '';
    }
    super.dispose();
  }
}
