// A field whose content is a flyout.
//
// Blockly has no notion of a block containing a palette, so this smuggles one
// in as a field: `initView` builds a `BlockFlyout` and appends its `<g>` to the
// field group, and from then on the flyout is laid out as part of the block.
//
// The awkward part is measurement, and both halves of it are here. A field is
// asked its size before it renders, and a flyout does not know its size until
// its blocks are laid out — so `getSize` shows the flyout on first ask (nothing
// else has happened yet that could), marks itself dirty every time (a field is
// normally measured once and cached, and this one changes whenever its contents
// do), and `render_` reflows the flyout and then measures the group it drew.
//
// Ported from `apps/src/blockly/addons/cdoFieldFlyout`.

import * as Blockly from 'blockly/core';

import {BlockFlyout} from './BlockFlyout';

export interface FieldFlyoutConfig extends Blockly.FieldConfig {
  flyoutKey: string;
  name: string;
}

export class FieldFlyout extends Blockly.Field {
  private workspace: Blockly.WorkspaceSvg | undefined;
  private flyout: BlockFlyout | undefined;
  private readonly minWidth = 0;
  private readonly maxWidth = 1000;

  /** Not a value anybody edits — it is a palette. */
  EDITABLE = false;
  CURSOR = 'default';

  constructor(value: string, config: FieldFlyoutConfig) {
    super(value);
    this.configure_(config);
  }

  static override fromJson(options: Blockly.FieldConfig): FieldFlyout {
    const config = options as FieldFlyoutConfig;
    return new FieldFlyout(config.flyoutKey, config);
  }

  /** One flyout per block, so two of the same kind do not share contents. */
  static flyoutIdFor(block: Blockly.Block): string {
    return `flyout_${block.type}_${block.id}`;
  }

  override initView(): void {
    this.workspace = this.getSourceBlock()?.workspace as Blockly.WorkspaceSvg;
    const options = this.workspace?.options ?? ({} as Blockly.Options);
    this.flyout = new BlockFlyout({
      ...options,
      parentBlock: this.sourceBlock_,
      RTL: this.workspace.RTL,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
    });
    this.fieldGroup_?.appendChild(this.flyout.createDom('g'));
  }

  /** Blockly's hook for "the field was activated"; here, just show it. */
  protected override showEditor_(): void {
    this.showFlyout();
  }

  override getSize(): Blockly.utils.Size {
    if (!this.isVisible()) {
      return new Blockly.utils.Size(0, 0);
    }
    // First ask: nothing else has run that could have shown it, and a hidden
    // flyout measures as nothing — which would size the field to zero and never
    // ask again.
    if (!this.isFlyoutVisible()) {
      this.showFlyout();
    }
    // A field is measured once and cached unless it says otherwise. This one
    // changes size whenever its contents do, so it always says otherwise.
    this.isDirty_ = true;
    return super.getSize();
  }

  protected override render_(): void {
    if (this.isFlyoutVisible() && this.flyout && this.sourceBlock_) {
      // Reflow before re-showing: the flyout has to report a size that matches
      // the blocks it is about to lay out, or the field is measured against the
      // previous contents.
      this.flyout.reflow();
      this.flyout.show(FieldFlyout.flyoutIdFor(this.sourceBlock_));
    }
    if (this.fieldGroup_) {
      const box = this.fieldGroup_.getBBox();
      this.size_ = new Blockly.utils.Size(box.width, box.height);
    }
  }

  /**
   * Show it, pointing it at the block's own workspace.
   *
   * `init(workspace)` is what sets `targetWorkspace`, and that is the line that
   * makes a block dragged out of here land in the program rather than nowhere.
   */
  showFlyout(): void {
    if (!this.flyout || !this.workspace || !this.sourceBlock_) {
      return;
    }
    if (!this.flyout.targetWorkspace) {
      this.flyout.init(this.workspace);
    }
    this.flyout.show(FieldFlyout.flyoutIdFor(this.sourceBlock_));
    this.isDirty_ = true;
  }

  isFlyoutVisible(): boolean {
    return this.flyout?.isVisible() ?? false;
  }
}
