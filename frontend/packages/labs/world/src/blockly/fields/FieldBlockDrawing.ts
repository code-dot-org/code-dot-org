// A field that draws a block: the machinery, without an opinion about which.
//
// Two fields want the same trick. `define block` draws the call site its
// signature will make (`FieldBlockPreview`), and `define property` draws the
// getter and the setter it will make (`FieldPropertyPreview`). Both need a
// private workspace inside a field, one block built on it, and a size handed
// back to the block the field sits on — and both need the same three pieces of
// care about WHEN that happens, which is what this file is for.
//
// A field is an SVG group Blockly asks for a size, so anything that renders
// into that group works — including blocks. Core does the same thing for
// mutator bubbles (`MiniWorkspaceBubble`), and CDO Blockly does it for sprite
// lab's mini-toolboxes (`CdoFieldFlyout`).
//
// It is a DRAWING, not a workspace you can touch: the mini workspace takes no
// pointer events. Blocks that could be picked up would be picked up on a
// workspace with no visible extent, and dropping one anywhere would go nowhere.
// A subclass that wants a press does it with chrome of its own, over the top
// (`initChrome`).

import * as Blockly from 'blockly/core';

import {markPreviewWorkspace} from './scopedVariable';

/** Where the drawing sits inside the field, so it does not touch the edges. */
export const DRAWING_PAD = 2;

/** Marks the drawing's container, for the rule below. */
const DRAWING_CLASS = 'worldBlockPreview';

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
.${DRAWING_CLASS}, .${DRAWING_CLASS} * {
  pointer-events: none !important;
}
`);

export abstract class FieldBlockDrawing extends Blockly.Field<string> {
  override EDITABLE = false;
  override SERIALIZABLE = false;

  /** The workspace the drawing lives on. Disposed with the field. */
  protected mini: Blockly.WorkspaceSvg | null = null;
  /** The block type registered for this field's drawing; unique per instance. */
  private drawnType = '';
  /** The deferred draw, so disposing before it lands cancels it. */
  private pending: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super('');
  }

  /**
   * The block to draw, as Blockly's block JSON. Asked for on every rebuild.
   *
   * Never empty: Blockly cannot lay out a block with no message at all, which
   * is why every implementation falls back to a single space.
   */
  protected abstract drawnBlock(): Record<string, unknown>;

  // The four hooks below are declared without bodies, so a subclass that wants
  // none carries none. Each is called with `?.()`.

  /** Fill the drawn block's sockets. Runs with events off, before layout. */
  protected fill?(block: Blockly.BlockSvg, mini: Blockly.WorkspaceSvg): void;

  /** Whatever else this field wants measured, once the drawing has rendered. */
  protected measured?(block: Blockly.BlockSvg): void;

  /** Chrome made BEFORE the drawing, so it stays on top of it. */
  protected initChrome?(group: SVGGElement): void;

  /** The field's new size, for chrome that has to match it. */
  protected resized?(size: Blockly.utils.Size): void;

  /**
   * Draw it again: what is being drawn has changed.
   *
   * The drawing decides the field's size, and the field's size decides the
   * host block's layout — so this pushes a re-render rather than waiting to be
   * asked for a size. Safe before the field is in the DOM: with no workspace
   * yet there is nothing to redraw, and `initView` will draw the current state
   * when it arrives.
   */
  protected redraw(): void {
    this.isDirty_ = true;
    if (this.mini) {
      this.build();
      this.forceRerender();
    }
  }

  /**
   * Build the field: chrome first, then the drawing under it.
   *
   * `super.initView()` is deliberately NOT called — it makes a border rect and
   * a text element this field has no use for, and the base rendering that would
   * then measure them is overridden below.
   */
  override initView(): void {
    if (!this.getSourceBlock()?.workspace || !this.fieldGroup_) {
      return;
    }
    this.initChrome?.(this.fieldGroup_);
    // The drawing itself comes on the next turn of the loop — see `drawNow`.
    this.pending = setTimeout(() => {
      this.pending = null;
      this.drawNow();
    }, 0);
  }

  /**
   * Build the drawing's workspace and draw into it.
   *
   * NOT in `initView`, and this is the whole reason the field is built in two
   * halves. A workspace registers itself with Blockly's FocusManager when its
   * DOM is created, and the manager REFUSES to change state while it is inside
   * a focus or blur callback:
   *
   *   FocusManager state changes cannot happen in a tree/node focus/blur
   *   callback.
   *
   * Returning to the tab does exactly that — the window's focus event reaches
   * the flyout, which re-creates the blocks it shows, which initialises their
   * fields. A field that made a workspace there took the toolbox down with it.
   * There is no public way to ask the manager whether it is locked, so this
   * waits for the callback to have returned instead, which is a timeout of
   * zero.
   */
  private drawNow(): void {
    const host = this.getSourceBlock()?.workspace as
      | Blockly.WorkspaceSvg
      | undefined;
    if (!host || !this.fieldGroup_ || this.mini) {
      return;
    }
    // The host's own options, so the drawing gets the same renderer, theme and
    // constants — otherwise it is the right shape in the wrong colors.
    this.mini = new Blockly.WorkspaceSvg(host.options);
    // A picture, not a program: the blocks on it are read by nobody, so a
    // getter in one of its sockets draws what it holds rather than what some
    // surrounding scope offers (`markPreviewWorkspace`).
    markPreviewWorkspace(this.mini);
    const canvas = this.mini.createDom() as SVGGElement;
    // The drawing is inert: every press belongs to whatever chrome the subclass
    // made, which knows what to do with it. See the stylesheet registered above
    // — this class is what turns pointer events off, all the way down.
    canvas.classList.add(DRAWING_CLASS);
    canvas.setAttribute(
      'transform',
      `translate(${DRAWING_PAD}, ${DRAWING_PAD})`,
    );
    // Under the chrome, which was made first and must stay on top.
    this.fieldGroup_.insertBefore(canvas, this.fieldGroup_.firstChild);
    this.build();
    // The drawing decides the field's size, and this one arrived after the
    // block was laid out — so it has to ask for that layout again.
    this.forceRerender();
  }

  /** Draw the current state, and measure what came out. */
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
      this.registerDrawnType();
      const block = mini.newBlock(this.drawnType) as Blockly.BlockSvg;
      block.initSvg();
      this.fill?.(block, mini);
      // Rendered now: everything below measures the drawing, and a queued render
      // measures as nothing.
      block.queueRender();
      Blockly.renderManagement.triggerQueuedRenders(mini);

      const size = block.getHeightWidth();
      this.size_ = new Blockly.utils.Size(
        size.width + DRAWING_PAD * 2,
        size.height + DRAWING_PAD * 2,
      );
      this.resized?.(this.size_);
      this.measured?.(block);
    } finally {
      if (enabled) {
        Blockly.Events.enable();
      }
    }
  }

  /**
   * Define the block being drawn.
   *
   * A block definition is global and keyed by type, and what is drawn changes
   * with every edit, so each field owns a private type it redefines in place
   * rather than sharing one that would race with the next definition block.
   */
  private registerDrawnType(): void {
    if (!this.drawnType) {
      this.drawnType = `world_block_drawing_${Blockly.utils.idGenerator.genUid()}`;
    }
    const definition = this.drawnBlock();
    Blockly.Blocks[this.drawnType] = {
      init: function (this: Blockly.Block) {
        this.jsonInit(definition);
      },
    };
  }

  /**
   * Nothing to render: `build` sizes the field when what it draws changes, and
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
    if (this.pending) {
      clearTimeout(this.pending);
      this.pending = null;
    }
    try {
      this.mini?.dispose();
    } catch {
      // Nothing to do: the workspace is being thrown away either way.
    }
    this.mini = null;
    if (this.drawnType) {
      delete Blockly.Blocks[this.drawnType];
      this.drawnType = '';
    }
    super.dispose();
  }
}
