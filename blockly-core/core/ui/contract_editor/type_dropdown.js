'use strict';

goog.provide('Blockly.TypeDropdown');

/**
 * A DOM-based type selection dropdown
 * @param {!Object} options
 * @param {Function} options.onTypeChanged takes parameter {String} newType
 * @param {Array.<BlockValueType>} options.typeChoices
 * @constructor
 */
Blockly.TypeDropdown = function (options) {
  /**
   * @type {goog.ui.Select}
   * @private
   */
  this.selectComponent_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.buttonColorSquareDiv_ = null;

  /**
   * Called with new {Blockly.BlockValueType}
   * @type {Function}
   * @private
   */
  this.onTypeChanged_ = options.onTypeChanged;

  /**
   * Types to make available
   * @type {Array.<BlockValueType>}
   * @private
   */
  this.typeChoices_ = options.typeChoices;

  /**
   * Current type of select dropdown
   * @type {Blockly.BlockValueType}
   * @private
   */
  this.type_ = options.type;

  // For disposal
  this.changeListenerKey_ = null;
};

Blockly.TypeDropdown.prototype.render = function (parent) {
  var selectComponent = this.renderSelectComponent_(parent);
  this.buttonColorSquareDiv_ = this.createColorSquareDiv();
  goog.dom.appendChild(selectComponent.getElement(), this.buttonColorSquareDiv_);
  this.setSquareIconColor(this.type_, this.buttonColorSquareDiv_);
  this.attachListeners_(selectComponent);
  this.selectComponent_ = selectComponent;
  this.setType_(this.type_);
};

Blockly.TypeDropdown.prototype.setType_ = function (newType) {
  this.type_ = newType;
  this.setSquareIconColor(this.type_, this.buttonColorSquareDiv_);
};

/**
 * @param {Element} parent parent to render on
 * @returns {goog.ui.Select}
 * @private
 */
Blockly.TypeDropdown.prototype.renderSelectComponent_ = function (parent) {
  var selectComponent = this.createSelect_();
  selectComponent.render(parent);
  return selectComponent;
};

/**
 * @returns {goog.ui.Select} new dropdown
 * @private
 */
Blockly.TypeDropdown.prototype.createSelect_ = function() {
  var newTypeDropdown = new goog.ui.Select(null, null,
    goog.ui.FlatMenuButtonRenderer.getInstance(),
    null,
    new Blockly.CustomCssClassMenuRenderer('colored-type-dropdown'));
  this.typeChoices_.forEach(function (choiceKey) {
    var menuItem = new goog.ui.MenuItem(choiceKey);
    newTypeDropdown.addItem(menuItem);
    var colorIconDiv = this.createColorSquareDiv();
    goog.dom.insertChildAt(menuItem.getElement(), colorIconDiv, 0);
    this.setSquareIconColor(choiceKey, colorIconDiv);
  }, this);
  newTypeDropdown.setValue(this.type_);
  return newTypeDropdown;
};

/**
 * @returns {Element}
 * @private
 */
Blockly.TypeDropdown.prototype.createColorSquareDiv = function () {
  return goog.dom.createDom('div', 'color-square-icon');
};

Blockly.TypeDropdown.prototype.attachListeners_ = function (selectComponent) {
  this.changeListenerKey_ = goog.events.listen(selectComponent, goog.ui.Component.EventType.CHANGE,
    goog.bind(this.selectChanged_, this));
};

/**
 * @param comboBoxEvent
 * @private
 */
Blockly.TypeDropdown.prototype.selectChanged_ = function(comboBoxEvent) {
  /** @type {Blockly.BlockValueType} */
  var newType = comboBoxEvent.target.getContent();
  this.setType_(newType);
  this.onTypeChanged_(newType);
};

/**
 * Updates dropdown button's color square to match given type
 * @param {Blockly.BlockValueType} newType
 * @param {Element} colorIconDiv
 */
Blockly.TypeDropdown.prototype.setSquareIconColor = function (newType, colorIconDiv) {
  var hsvColor = Blockly.FunctionalTypeColors[newType];
  var hexColor = goog.color.hsvToHex(hsvColor[0], hsvColor[1], hsvColor[2] * 255);
  colorIconDiv.style.background = hexColor;
};

Blockly.TypeDropdown.prototype.dispose = function () {
  goog.events.unlistenByKey(this.changeListenerKey_);
  this.selectComponent_.dispose();
};
