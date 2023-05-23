Blockly.FieldFlyout = function (a, b) {
  Blockly.FieldFlyout.superClass_.constructor.call(this, a);
  this.configure_(b);
};
goog.inherits(Blockly.FieldFlyout, Blockly.Field);
Blockly.FieldFlyout.fromJson = function (a) {
  return new Blockly.FieldFlyout(a.flyoutKey, a);
};
Blockly.FieldFlyout.prototype.EDITABLE = !1;
Blockly.FieldFlyout.prototype.CURSOR = 'default';
Blockly.FieldFlyout.prototype.configure_ = function (a) {
  a &&
    ((this.foldoutText_ = a.foldoutText),
    (this.sizingBehavior_ = a.sizingBehavior),
    (this.minWidth_ = a.minWidth),
    (this.maxWidth_ = a.maxWidth));
};
Blockly.FieldFlyout.prototype.initView = function () {
  this.createTextElement_();
  this.textContent_.nodeValue = this.foldoutText_;
  var a = Blockly.utils.dom.createSvgElement('tspan', {}, null);
  this.arrow_ = document.createTextNode('\u25b8');
  a.appendChild(this.arrow_);
  this.textElement_.insertBefore(a, this.textContent_);
  this.workspace_ = this.getSourceBlock().workspace;
  this.flyout_ = new Blockly.BlockFlyout({
    disabledPatternId: this.workspace_.options.disabledPatternId,
    parentWorkspace: this.workspace_,
    RTL: this.workspace_.RTL,
    sizingBehavior: this.sizingBehavior_,
    minWidth: this.minWidth_,
    maxWidth: this.maxWidth_,
  });
  this.flyout_.setSourceBlock_(this.getSourceBlock());
  this.fieldGroup_.appendChild(this.flyout_.createDom('g'));
};
Blockly.FieldFlyout.prototype.showEditor_ = function () {
  this.setFlyoutVisible(!this.isFlyoutVisible());
};
Blockly.FieldFlyout.prototype.render_ = function () {
  var a = this.fieldGroup_.getBBox();
  if (this.flyout_.isVisible()) {
    var b = this.textElement_.getBBox();
    this.size_ = new goog.math.Size(
      Math.max(b.width, this.flyout_.getWidth() + 16),
      a.height + 14
    );
  } else this.size_ = new goog.math.Size(a.width, a.height);
};
Blockly.FieldFlyout.prototype.setFlyoutVisible = function (a) {
  this.flyout_.targetWorkspace_ ||
    (this.flyout_.init(this.workspace_), this.flyout_.svgGroup);
  a
    ? ((this.arrow_.nodeValue = '\u25be'), this.flyout_.show(this.getValue()))
    : ((this.arrow_.nodeValue = '\u25b8'), this.flyout_.hide());
  this.forceRerender();
};
Blockly.FieldFlyout.prototype.isFlyoutVisible = function () {
  return this.flyout_.isVisible();
};
Blockly.Field.register('field_flyout', Blockly.FieldFlyout);
