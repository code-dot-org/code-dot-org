export default class CdoTrashcan {
  constructor(workspace) {
    /**
     * The workspace the trashcan sits in.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * A list of XML (stored as strings) representing blocks in the trashcan.
     * @type {!Array.<string>}
     * @private
     */
    this.contents_ = [];

    /**
     * The trashcan flyout.
     * @type {Blockly.Flyout}
     * @package
     */
    this.flyout = null;

    if (this.workspace_.options.maxTrashcanContents <= 0) {
      return;
    }
    // Create flyout options.
    var flyoutWorkspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        scrollbars: true,
        parentWorkspace: this.workspace_,
        rtl: this.workspace_.RTL,
        oneBasedIndex: this.workspace_.options.oneBasedIndex,
        renderer: this.workspace_.options.renderer,
        rendererOverrides: this.workspace_.options.rendererOverrides
      })
    );
    // Create vertical or horizontal flyout.
    if (this.workspace_.horizontalLayout) {
      flyoutWorkspaceOptions.toolboxPosition =
        this.workspace_.toolboxPosition === Blockly.TOOLBOX_AT_TOP
          ? Blockly.TOOLBOX_AT_BOTTOM
          : Blockly.TOOLBOX_AT_TOP;
      if (!Blockly.HorizontalFlyout) {
        throw Error('Missing require for Blockly.HorizontalFlyout');
      }
      this.flyout = new Blockly.HorizontalFlyout(flyoutWorkspaceOptions);
    } else {
      flyoutWorkspaceOptions.toolboxPosition =
        this.workspace_.toolboxPosition === Blockly.TOOLBOX_AT_RIGHT
          ? Blockly.TOOLBOX_AT_LEFT
          : Blockly.TOOLBOX_AT_RIGHT;
      if (!Blockly.VerticalFlyout) {
        throw Error('Missing require for Blockly.VerticalFlyout');
      }
      this.flyout = new Blockly.VerticalFlyout(flyoutWorkspaceOptions);
    }
    this.workspace_.addChangeListener(this.onDelete_.bind(this));
  }

  createDom() {
    /* Here's the markup that will be generated:
    <g class="blocklyTrash">
      <clippath id="blocklyTrashBodyClipPath837493">
        <rect width="47" height="45" y="15"></rect>
      </clippath>
      <image width="64" height="92" y="-32" xlink:href="media/sprites.png"
          clip-path="url(#blocklyTrashBodyClipPath837493)"></image>
      <clippath id="blocklyTrashLidClipPath837493">
        <rect width="47" height="15"></rect>
      </clippath>
      <image width="84" height="92" y="-32" xlink:href="media/sprites.png"
          clip-path="url(#blocklyTrashLidClipPath837493)"></image>
    </g>
    */
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      'g',
      {class: 'blocklyTrash'},
      null
    );
    var clip;
    var rnd = String(Math.random()).substring(2);
    clip = Blockly.utils.dom.createSvgElement(
      'clipPath',
      {id: 'blocklyTrashBodyClipPath' + rnd},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      'rect',
      {
        width: this.WIDTH_,
        height: this.BODY_HEIGHT_,
        y: this.LID_HEIGHT_
      },
      clip
    );
    var body = Blockly.utils.dom.createSvgElement(
      'image',
      {
        width: Blockly.SPRITE.width,
        x: -this.SPRITE_LEFT_,
        height: Blockly.SPRITE.height,
        y: -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashBodyClipPath' + rnd + ')'
      },
      this.svgGroup_
    );
    body.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      'xlink:href',
      CdoTrashcan.TRASH_URL
    );

    clip = Blockly.utils.dom.createSvgElement(
      'clipPath',
      {id: 'blocklyTrashLidClipPath' + rnd},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      'rect',
      {width: this.WIDTH_, height: this.LID_HEIGHT_},
      clip
    );
    this.svgLid_ = Blockly.utils.dom.createSvgElement(
      'image',
      {
        width: Blockly.SPRITE.width,
        x: -this.SPRITE_LEFT_,
        height: Blockly.SPRITE.height,
        y: -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashLidClipPath' + rnd + ')'
      },
      this.svgGroup_
    );
    this.svgLid_.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      'xlink:href',
      CdoTrashcan.TRASH_URL
    );

    this.notAllowed_ = Blockly.utils.dom.createSvgElement(
      'g',
      {},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      'line',
      {x1: 0, y1: 10, x2: 45, y2: 60, stroke: '#c00', 'stroke-width': 5},
      this.notAllowed_
    );
    Blockly.utils.dom.createSvgElement(
      'circle',
      {cx: 22, cy: 33, r: 33, stroke: '#c00', 'stroke-width': 5, fill: 'none'},
      this.notAllowed_
    );

    Blockly.bindEventWithChecks_(this.svgGroup_, 'mouseup', this, this.click);
    // bindEventWithChecks_ quashes events too aggressively. See:
    // https://groups.google.com/forum/#!topic/blockly/QF4yB9Wx00s
    // Bind to body instead of this.svgGroup_ so that we don't get lid jitters
    Blockly.bindEvent_(body, 'mouseover', this, this.mouseOver_);
    Blockly.bindEvent_(body, 'mouseout', this, this.mouseOut_);
    this.animateLid_();
    return this.svgGroup_;
  }

  init(verticalSpacing) {
    if (this.workspace_.options.maxTrashcanContents > 0) {
      Blockly.utils.dom.insertAfter(
        this.flyout.createDom('svg'),
        this.workspace_.getParentSvg()
      );
      this.flyout.init(this.workspace_);
    }

    this.verticalSpacing_ = this.MARGIN_BOTTOM_ + verticalSpacing;
    this.setOpen(false);
    return this.verticalSpacing_ + this.BODY_HEIGHT_ + this.LID_HEIGHT_;
  }

  dispose() {
    if (this.svgGroup_) {
      Blockly.utils.dom.removeNode(this.svgGroup_);
      this.svgGroup_ = null;
    }
    this.svgLid_ = null;
    this.workspace_ = null;
    clearTimeout(this.lidTask_);
  }

  contentsIsOpen() {
    return this.flyout.isVisible();
  }

  emptyContents() {
    if (!this.contents_.length) {
      return;
    }
    this.contents_.length = 0;
    this.setMinOpenness_(0);
    if (this.contentsIsOpen()) {
      this.flyout.hide();
    }
  }

  position() {
    // Not yet initialized.
    if (!this.verticalSpacing_) {
      return;
    }
    var metrics = this.workspace_.getMetrics();
    if (!metrics) {
      // There are no metrics available (workspace is probably not visible).
      return;
    }

    this.left_ = Math.round(metrics.flyoutWidth / 2 - this.WIDTH_ / 2);
    this.top_ = this.verticalSpacing_;

    this.svgGroup_.setAttribute(
      'transform',
      'translate(' + this.left_ + ',' + this.top_ + ')'
    );
  }

  getClientRect() {
    if (!this.svgGroup_) {
      return null;
    }

    var trashRect = this.svgGroup_.getBoundingClientRect();
    var top = trashRect.top + this.SPRITE_TOP_ - this.MARGIN_HOTSPOT_;
    var bottom =
      top + this.LID_HEIGHT_ + this.BODY_HEIGHT_ + 2 * this.MARGIN_HOTSPOT_;
    var left = trashRect.left + this.SPRITE_LEFT_ - this.MARGIN_HOTSPOT_;
    var right = left + this.WIDTH_ + 2 * this.MARGIN_HOTSPOT_;
    return new Blockly.utils.Rect(top, bottom, left, right);
  }

  setDisabled(disabled) {
    const visibility = disabled ? 'visible' : 'hidden';
    this.notAllowed_.setAttribute('visibility', visibility);
  }

  setOpen(state) {
    if (this.isOpen === state) {
      return;
    }
    clearTimeout(this.lidTask_);
    this.isOpen = state;
    this.animateLid_();
  }

  animateLid_() {
    var frames = CdoTrashcan.ANIMATION_FRAMES_;

    var delta = 1 / (frames + 1);
    this.lidOpen_ += this.isOpen ? delta : -delta;
    this.lidOpen_ = Math.min(Math.max(this.lidOpen_, this.minOpenness_), 1);

    this.setLidAngle_(this.lidOpen_ * CdoTrashcan.MAX_LID_ANGLE_);

    var minOpacity = CdoTrashcan.OPACITY_MIN_;
    var maxOpacity = CdoTrashcan.OPACITY_MAX_;
    // Linear interpolation between min and max.
    var opacity = minOpacity + this.lidOpen_ * (maxOpacity - minOpacity);
    this.svgGroup_.style.opacity = opacity;

    if (this.lidOpen_ > this.minOpenness_ && this.lidOpen_ < 1) {
      this.lidTask_ = setTimeout(
        this.animateLid_.bind(this),
        CdoTrashcan.ANIMATION_LENGTH_ / frames
      );
    }
  }

  setLidAngle_(lidAngle) {
    var openAtRight = !this.workspace_.RTL;
    this.svgLid_.setAttribute(
      'transform',
      'rotate(' +
        (openAtRight ? -lidAngle : lidAngle) +
        ',' +
        (openAtRight ? 4 : this.WIDTH_ - 4) +
        ',' +
        (this.LID_HEIGHT_ - 2) +
        ')'
    );
  }

  setMinOpenness_(newMin) {
    this.minOpenness_ = newMin;
    if (!this.isOpen) {
      this.setLidAngle_(newMin * CdoTrashcan.MAX_LID_ANGLE_);
    }
  }

  close() {
    this.setOpen(false);
  }

  click() {
    if (!this.contents_.length) {
      return;
    }

    var xml = [];
    for (var i = 0, text; (text = this.contents_[i]); i++) {
      xml[i] = Blockly.Xml.textToDom(text);
    }
    this.flyout.show(xml);
  }

  mouseOver_() {
    if (this.contents_.length) {
      this.setOpen(true);
    }
  }

  mouseOut_() {
    this.setOpen(false);
  }

  onDelete_(event) {
    if (this.workspace_.options.maxTrashcanContents <= 0) {
      return;
    }
    if (event.type === Blockly.Events.BLOCK_DELETE) {
      this.workspace_.hideTrashcan();
    }
    if (
      event.type === Blockly.Events.BLOCK_DELETE &&
      event.oldXml.tagName.toLowerCase() !== 'shadow'
    ) {
      var cleanedXML = this.cleanBlockXML_(event.oldXml);
      if (this.contents_.indexOf(cleanedXML) !== -1) {
        return;
      }
      this.contents_.unshift(cleanedXML);
      while (
        this.contents_.length > this.workspace_.options.maxTrashcanContents
      ) {
        this.contents_.pop();
      }

      this.setMinOpenness_(this.HAS_BLOCKS_LID_ANGLE_);
    }
  }

  cleanBlockXML_(xml) {
    var xmlBlock = xml.cloneNode(true);
    var node = xmlBlock;
    while (node) {
      // Things like text inside tags are still treated as nodes, but they
      // don't have attributes (or the removeAttribute function) so we can
      // skip removing attributes from them.
      if (node.removeAttribute) {
        node.removeAttribute('x');
        node.removeAttribute('y');
        node.removeAttribute('id');
        node.removeAttribute('disabled');
        if (node.nodeName === 'comment') {
          // Future proof just in case.
          node.removeAttribute('h');
          node.removeAttribute('w');
          node.removeAttribute('pinned');
        }
      }

      // Try to go down the tree
      var nextNode = node.firstChild || node.nextSibling;
      // If we can't go down, try to go back up the tree.
      if (!nextNode) {
        nextNode = node.parentNode;
        while (nextNode) {
          // We are valid again!
          if (nextNode.nextSibling) {
            nextNode = nextNode.nextSibling;
            break;
          }
          // Try going up again. If parentNode is null that means we have
          // reached the top, and we will break out of both loops.
          nextNode = nextNode.parentNode;
        }
      }
      node = nextNode;
    }
    return Blockly.Xml.domToText(xmlBlock);
  }
}

CdoTrashcan.prototype.WIDTH_ = 47;
CdoTrashcan.prototype.BODY_HEIGHT_ = 44;
CdoTrashcan.prototype.LID_HEIGHT_ = 16;
CdoTrashcan.prototype.MARGIN_BOTTOM_ = 20;
CdoTrashcan.prototype.MARGIN_SIDE_ = 20;
CdoTrashcan.prototype.MARGIN_HOTSPOT_ = 10;
CdoTrashcan.prototype.SPRITE_LEFT_ = 0;
CdoTrashcan.prototype.SPRITE_TOP_ = 32;
CdoTrashcan.prototype.HAS_BLOCKS_LID_ANGLE_ = 0.1;
CdoTrashcan.ANIMATION_LENGTH_ = 80;
CdoTrashcan.ANIMATION_FRAMES_ = 4;
CdoTrashcan.OPACITY_MIN_ = 0.4;
CdoTrashcan.OPACITY_MAX_ = 0.8;
CdoTrashcan.MAX_LID_ANGLE_ = 45;
CdoTrashcan.prototype.isOpen = false;
CdoTrashcan.prototype.minOpenness_ = 0;
CdoTrashcan.prototype.svgGroup_ = null;
CdoTrashcan.prototype.svgLid_ = null;
CdoTrashcan.prototype.lidTask_ = 0;
CdoTrashcan.prototype.lidOpen_ = 0;
CdoTrashcan.prototype.left_ = 0;
CdoTrashcan.prototype.top_ = 0;
CdoTrashcan.TRASH_URL = '/blockly/media/trash.png';
