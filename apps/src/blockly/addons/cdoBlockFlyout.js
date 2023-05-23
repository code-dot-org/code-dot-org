Blockly.BlockFlyout = function (a) {
  a.getMetrics = this.getMetrics_.bind(this);
  a.setMetrics = this.setMetrics_.bind(this);
  Blockly.BlockFlyout.superClass_.constructor.call(this, a);
  this.horizontalLayout_ = !0;
  this.sizingBehavior_ = a.sizingBehavior || this.sizingBehavior_;
  this.minWidth_ = a.minWidth || this.minWidth_;
  this.maxWidth_ = a.maxWidth || this.maxWidth_;
};
goog.inherits(Blockly.BlockFlyout, Blockly.HorizontalFlyout);
Blockly.BlockFlyout.SIZING_BEHAVIOR = {
  FIT_PARENT: 'fitParent',
  FIT_CONTENT: 'fitContent',
};
Blockly.BlockFlyout.FOLDOUT_HEIGHT = 20;
Blockly.BlockFlyout.prototype.autoClose = !1;
Blockly.BlockFlyout.prototype.sizingBehavior_ =
  Blockly.BlockFlyout.SIZING_BEHAVIOR.FIT_CONTENT;
Blockly.BlockFlyout.prototype.minWidth_ = 0;
Blockly.BlockFlyout.prototype.maxWidth_ = 1e3;
Blockly.BlockFlyout.prototype.getMetrics_ = function () {
  if (!this.isVisible()) return null;
  try {
    var a = this.workspace_.getCanvas().getBBox();
  } catch (e) {
    a = {
      height: 0,
      y: 0,
      width: 0,
      x: 0,
    };
  }
  var b = this.height_,
    c = this.width_ + 2 * this.MARGIN;
  if (this.sizingBehavior_ == Blockly.BlockFlyout.SIZING_BEHAVIOR.FIT_CONTENT) {
    var d = b;
    a = c - 1;
  } else
    (d = (a.height + 2 * this.MARGIN) * this.workspace_.scale),
      (a = (a.width + this.GAP_X + 2 * this.MARGIN) * this.workspace_.scale);
  return {
    viewHeight: b,
    viewWidth: c,
    contentHeight: d,
    contentWidth: a,
    viewTop: -this.workspace_.scrollY,
    viewLeft: -this.workspace_.scrollX,
    contentTop: 0,
    contentLeft: 0,
    absoluteTop: this.SCROLLBAR_PADDING,
    absoluteLeft: this.SCROLLBAR_PADDING,
  };
};
Blockly.BlockFlyout.prototype.setMetrics_ = function (a) {
  var b = this.getMetrics_();
  b &&
    ('number' === typeof a.x &&
      (this.workspace_.scrollX = -b.contentWidth * a.x),
    this.workspace_.translate(
      this.workspace_.scrollX + b.absoluteLeft,
      this.workspace_.scrollY + b.absoluteTop
    ));
};
Blockly.BlockFlyout.prototype.createDom = function (a) {
  Blockly.BlockFlyout.superClass_.createDom.call(this, a);
  a = 'flyoutClip' + Blockly.utils.genUid().replace(/([\(\)])/g, '');
  var b = Blockly.utils.dom.createSvgElement('defs', {}, this.svgGroup_);
  b = Blockly.utils.dom.createSvgElement(
    'clipPath',
    {
      id: a,
    },
    b
  );
  this.svgClipPath_ = Blockly.utils.dom.createSvgElement('path', {}, b);
  this.svgGroup_.setAttribute('clip-path', 'url(#' + a + ')');
  return this.svgGroup_;
};
Blockly.BlockFlyout.prototype.init = function (a) {
  Blockly.BlockFlyout.superClass_.init.call(this, a);
  a = this.scrollbar_.outerSvg_;
  for (
    var b = Blockly.utils.dom.createSvgElement('g', {}, null);
    a.firstChild;

  )
    b.appendChild(a.firstChild);
  for (var c = a.attributes.length - 1; 0 <= c; c--)
    b.attributes.setNamedItem(a.attributes[c].cloneNode());
  this.scrollbar_.outerSvg_ = b;
  this.svgGroup_.appendChild(this.scrollbar_.outerSvg_);
};
Blockly.BlockFlyout.prototype.reflowInternal_ = function () {
  this.height_ = this.width_ = 0;
  for (var a = this.workspace_.getTopBlocks(!1), b = 0, c; (c = a[b]); b++) {
    var d = c.getHeightWidth();
    this.updateHeight_(d);
    this.updateWidth_(d);
    c.flyoutRect_ && this.moveRectToBlock_(c.flyoutRect_, c);
  }
  this.height_ += 2 * this.MARGIN;
  this.setBackgroundPath_(this.width_, this.height_);
  this.position();
};
Blockly.BlockFlyout.prototype.updateHeight_ = function (a) {
  this.height_ = Math.max(this.height_, a.height);
};
Blockly.BlockFlyout.prototype.updateWidth_ = function (a) {
  this.sizingBehavior_ == Blockly.BlockFlyout.SIZING_BEHAVIOR.FIT_CONTENT
    ? ((this.width_ += a.width), (this.width_ += this.GAP_X))
    : 0 == this.width_ &&
      (this.width_ = this.sourceBlock_.getHeightWidth().width - 36);
};
Blockly.BlockFlyout.prototype.position = function () {
  this.isVisible() &&
    this.positionAt_(
      this.width_,
      this.height_,
      0,
      Blockly.BlockFlyout.FOLDOUT_HEIGHT
    );
};
Blockly.BlockFlyout.prototype.setBackgroundPath_ = function (a, b) {
  var c = [
    'M 0,' +
      (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP
        ? 0
        : this.CORNER_RADIUS),
  ];
  c.push(
    'a',
    this.CORNER_RADIUS,
    this.CORNER_RADIUS,
    0,
    0,
    1,
    this.CORNER_RADIUS,
    -this.CORNER_RADIUS
  );
  c.push('h', a);
  c.push(
    'a',
    this.CORNER_RADIUS,
    this.CORNER_RADIUS,
    0,
    0,
    1,
    this.CORNER_RADIUS,
    this.CORNER_RADIUS
  );
  c.push('v', b);
  c.push(
    'a',
    this.CORNER_RADIUS,
    this.CORNER_RADIUS,
    0,
    0,
    1,
    -this.CORNER_RADIUS,
    this.CORNER_RADIUS
  );
  c.push('h', -1 * a);
  c.push(
    'a',
    this.CORNER_RADIUS,
    this.CORNER_RADIUS,
    0,
    0,
    1,
    -this.CORNER_RADIUS,
    -this.CORNER_RADIUS
  );
  c.push('z');
  c = c.join(' ');
  this.svgClipPath_.setAttribute('d', c);
  this.svgBackground_.setAttribute('d', c);
};
Blockly.BlockFlyout.prototype.setSourceBlock_ = function (a) {
  this.sourceBlock_ = a;
};
