/**
 * @overview UI component used to select a DNS mode at runtime.
 */
'use strict';

var markup = require('./NetSimDnsModeControl.html.ejs');
var DnsMode = require('./NetSimConstants').DnsMode;

/**
 * Generator and controller for DNS mode selector
 * @param {jQuery} rootDiv
 * @param {function} dnsModeChangeCallback
 * @constructor
 */
var NetSimDnsModeControl = module.exports = function (rootDiv,
    dnsModeChangeCallback) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {function}
   * @private
   */
  this.dnsModeChangeCallback_ = dnsModeChangeCallback;

  /**
   * Set of all DNS mode radio buttons
   * @type {jQuery}
   * @private
   */
  this.dnsModeRadios_ = null;

  /**
   * Internal state: Current DNS mode.
   * @type {DnsMode}
   * @private
   */
  this.currentDnsMode_ = DnsMode.NONE;

  this.render();
};

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimDnsModeControl.prototype.render = function () {
  var renderedMarkup = $(markup({}));
  this.rootDiv_.html(renderedMarkup);

  this.dnsModeRadios_ = this.rootDiv_.find('input[type="radio"][name="dns_mode"]');
  this.dnsModeRadios_.change(this.onDnsModeChange_.bind(this));
  this.setDnsMode(this.currentDnsMode_);
};

/**
 * Handler for a new radio button being selected.
 * @private
 */
NetSimDnsModeControl.prototype.onDnsModeChange_ = function () {
  var newDnsMode = this.dnsModeRadios_.filter(':checked').val();
  this.dnsModeChangeCallback_(newDnsMode);
};

/**
 * @param {DnsMode} newDnsMode
 */
NetSimDnsModeControl.prototype.setDnsMode = function (newDnsMode) {
  this.currentDnsMode_ = newDnsMode;
  this.dnsModeRadios_
      .filter('[value="' + newDnsMode + '"]')
      .prop('checked', true);
};
