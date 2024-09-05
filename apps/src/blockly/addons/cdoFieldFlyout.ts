import GoogleBlockly, {Block, FieldConfig, WorkspaceSvg} from 'blockly/core';

import CdoBlockFlyout from './cdoBlockFlyout';

interface FieldFlyoutConfig extends FieldConfig {
  flyoutKey: string;
  name: string;
}

export default class CdoFieldFlyout extends GoogleBlockly.Field {
  private workspace_: WorkspaceSvg | undefined;
  private flyout_: CdoBlockFlyout | undefined;
  private minWidth_ = 0;
  private maxWidth_ = 1000;

  /**
   * This is a customized class that extends Blockly's Field class.
   * This field depends on `CdoBlockFlyout`, which is used to create a flyout
   * of blocks. We colloquially refer to this as a block's "mini-toolbox".
   *
   * @param {string} value - The initial value of the field.
   * @param {Object} [opt_config] - A map of options used to configure the field.
   */
  constructor(value: string, opt_config: FieldFlyoutConfig) {
    super(value);
    this.configure_(opt_config);
  }

  /**
   * Construct a FieldFlyout from a JSON arg object.
   *
   * @param {Object} options A JSON object with options.
   * @returns {CdoFieldFlyout} The new field instance.
   */
  static fromJson(options: FieldFlyoutConfig) {
    return new CdoFieldFlyout(options.flyoutKey, options);
  }

  static getFlyoutId(block: Block) {
    return `flyout_${block.type}_${block.id}`;
  }

  EDITABLE = false;
  CURSOR = 'default';

  /**
   * Create the block UI for this field.
   * @override
   */
  initView() {
    this.workspace_ = this.getSourceBlock()?.workspace as WorkspaceSvg;
    const options =
      Blockly.getMainWorkspace()?.options || this.workspace_?.options || {};
    this.flyout_ = new CdoBlockFlyout({
      ...options,
      parentBlock: this.sourceBlock_,
      RTL: this.workspace_.RTL,
      minWidth: this.minWidth_,
      maxWidth: this.maxWidth_,
    });
    this.fieldGroup_?.appendChild(this.flyout_.createDom('g'));
  }

  /**
   * This is the Blockly hook to create an editor for the field.
   * All we do here is set the flyout to visible.
   * @override
   */
  showEditor_() {
    this.setFlyoutVisible();
  }

  /**
   * Returns the height and width of the field.
   *
   * This should *in general* be the only place render_ gets called from.
   *
   * @returns {Blockly.utils.Size} Height and width.
   * @override
   */
  getSize() {
    if (!this.isVisible()) {
      return new Blockly.utils.Size(0, 0);
    }
    // On first render, if the flyout is not visible, show the flyout.
    // We can't show the flyout until other components are rendered,
    // so we delay showing it until here.
    if (!this.isFlyoutVisible()) {
      this.setFlyoutVisible();
    }
    // Normally, Blockly skips rendering fields unless we've notified the
    // rendering system that they've changed (this.isDirty_), but in this
    // case, we want to always re-render / resize the field.
    this.isDirty_ = true;
    return super.getSize();
  }

  /**
   * Used by getSize() to move/resize any DOM elements, and get the new size.
   *
   * All rendering that has an effect on the size/shape of the block should be
   * done here, and should be triggered by getSize().
   * @override
   */
  render_() {
    if (this.isFlyoutVisible() && this.flyout_ && this.sourceBlock_) {
      // Always reflow and re-show the flyout before re-sizing the field.
      // This will ensure the flyout is reporting the correct size (reflow),
      // and the blocks in the flyout are spaced correctly (show).
      this.flyout_.reflow();
      this.flyout_.show(CdoFieldFlyout.getFlyoutId(this.sourceBlock_));
    }
    if (this.fieldGroup_) {
      // The field should be the size of the fieldGroup_.
      const fieldGroupBBox = this.fieldGroup_.getBBox();
      this.size_ = new Blockly.utils.Size(
        fieldGroupBBox.width,
        fieldGroupBBox.height
      );
    }
  }

  /**
   * Show the flyout, then re-render it.
   */
  setFlyoutVisible() {
    if (!this.flyout_ || !this.workspace_ || !this.sourceBlock_) {
      return;
    }
    if (!this.flyout_.targetWorkspace) {
      this.flyout_.init(this.workspace_);
    }
    this.flyout_.show(CdoFieldFlyout.getFlyoutId(this.sourceBlock_));
    this.isDirty_ = true;
  }

  /**
   * Is this field's flyout visible?
   *
   * @returns True if visible.
   */
  isFlyoutVisible() {
    return this.flyout_?.isVisible() || false;
  }
}
