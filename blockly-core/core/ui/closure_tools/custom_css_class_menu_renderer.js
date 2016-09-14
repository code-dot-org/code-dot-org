'use strict';

goog.provide('Blockly.CustomCssClassMenuRenderer');

goog.require('goog.ui.MenuRenderer');

/**
 * Simple dropdown menu renderer override to include a class on the dropdown menu.
 * @constructor
 */
Blockly.CustomCssClassMenuRenderer = function (customCssClass) {
  this.customCssClass_ = customCssClass;
  Blockly.CustomCssClassMenuRenderer.superClass_.constructor.call(this);
};
goog.inherits(Blockly.CustomCssClassMenuRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(Blockly.CustomCssClassMenuRenderer);

Blockly.CustomCssClassMenuRenderer.prototype.getCssClass = function () {
  return goog.ui.MenuRenderer.CSS_CLASS + ' ' + this.customCssClass_;
};
