import GoogleBlockly from 'blockly/core';
import CdoBlockFlyout from './cdoBlockFlyout';

/**
 * @param value The initial value of the field.
 *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
 * subclasses that want to handle configuration and setting the field value
 * after their own constructors have run).
 * @param opt_validator  A function that is called to validate changes to the
 *     field's value. Takes in a value & returns a validated value, or null to
 *     abort the change.
 * @param opt_config A map of options used to configure the field.
 *    Refer to the individual field's documentation for a list of properties
 * this parameter supports.
 */
export default class CdoFieldFlyout extends GoogleBlockly.Field {
  constructor(value, opt_config) {
    super(value);
    this.configure_(opt_config);
  }

  static fromJson(options) {
    return new CdoFieldFlyout(options.flyoutKey, options);
  }

  EDITABLE = false;
  CURSOR = 'default';

  configure_(config) {
    config &&
      ((this.sizingBehavior_ = config.sizingBehavior),
      (this.minWidth_ = config.minWidth),
      (this.maxWidth_ = config.maxWidth));
  }

  initView() {
    this.workspace_ = this.getSourceBlock().workspace;
    this.flyout_ = new CdoBlockFlyout({
      ...Blockly.getMainWorkspace().options,
      disabledPatternId: this.workspace_.options.disabledPatternId,
      parentWorkspace: this.workspace_,
      RTL: this.workspace_.RTL,
      sizingBehavior: this.sizingBehavior_,
      minWidth: this.minWidth_,
      maxWidth: this.maxWidth_,
    });
    this.flyout_.setSourceBlock_(this.getSourceBlock());
    this.fieldGroup_.appendChild(this.flyout_.createDom('g'));
  }

  showEditor_() {
    this.setFlyoutVisible(!this.isFlyoutVisible());
  }

  /**
   * Used by getSize() to move/resize any DOM elements, and get the new size.
   *
   * All rendering that has an effect on the size/shape of the block should be
   * done here, and should be triggered by getSize().
   */
  render_() {
    const fieldGroupBBox = this.fieldGroup_.getBBox();
    if (this.flyout_.isVisible()) {
      this.size_ = new Blockly.utils.Size(
        this.flyout_.getWidth(),
        fieldGroupBBox.height
      );
    } else {
      this.size_ = new Blockly.utils.Size(
        fieldGroupBBox.width,
        fieldGroupBBox.height
      );
    }
  }

  setFlyoutVisible(isVisible) {
    this.flyout_.targetWorkspace_ ||
      (this.flyout_.init(this.workspace_), this.flyout_.svgGroup_);
    isVisible
      ? this.flyout_.show(`flyout_${this.sourceBlock_.type}`)
      : this.flyout_.hide();
    this.forceRerender();
  }

  isFlyoutVisible() {
    return this.flyout_.isVisible();
  }
}
