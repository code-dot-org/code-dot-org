/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

require('../utils'); // For Function.prototype.inherits()
var i18n = require('../../locale/current/netsim');
var markup = require('./NetSimShardSelectionPanel.html');
var NetSimPanel = require('./NetSimPanel');

var KeyCodes = require('../constants').KeyCodes;

/**
 * Generator and controller for message log.
 * @param {jQuery} rootDiv
 * @param {NetSimConnection} connection
 * @param {DashboardUser} user - The current user's info, whether logged in or not.
 * @constructor
 * @augments NetSimPanel
 */
var NetSimShardSelectionPanel = module.exports = function (rootDiv, connection,
    user) {
  /**
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;

  /**
   * @type {string}
   * @private
   */
  this.displayName_ = (user.isSignedIn) ? user.name : '';

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-shard-selection-panel',
    panelTitle: i18n.pickASection(),
    canMinimize: false
  });
};
NetSimShardSelectionPanel.inherits(NetSimPanel);

/**
 * Recreate markup within panel body.
 */
NetSimShardSelectionPanel.prototype.render = function () {
  // Create boilerplate panel markup
  NetSimShardSelectionPanel.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(markup({
    displayName: this.displayName_
  }));
  this.getBody().html(newMarkup);

  // Bind handlers
  var nameField = this.getBody().find('#netsim_lobby_name');
  nameField.keyup(this.onNameKeyUp_.bind(this));

  var setNameButton = this.getBody().find('#netsim_lobby_set_name_button');
  setNameButton.click(this.setNameButtonClick_.bind(this));

  if (this.displayName_.length === 0) {
    nameField.focus();
  }
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimShardSelectionPanel.prototype.onNameKeyUp_ = function (jQueryEvent) {
  var name = jQueryEvent.target.value;
  var setNameButton = this.getBody().find('#netsim_lobby_set_name_button');
  setNameButton.attr('disabled', name.length === 0);

  if (name.length > 0 && jQueryEvent.which === KeyCodes.ENTER) {
    this.setNameButtonClick_();
  }
};

/** @private */
NetSimShardSelectionPanel.prototype.setNameButtonClick_ = function () {
  this.displayName_ = this.getBody().find('#netsim_lobby_name').val();
  this.render();
};
