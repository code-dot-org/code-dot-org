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

var utils = require('../utils');
var i18n = require('../../locale/current/netsim');
var markup = require('./NetSimShardSelectionPanel.html');
var NetSimPanel = require('./NetSimPanel');

var KeyCodes = require('../constants').KeyCodes;

/**
 * @type {string}
 * @const
 */
var SELECTOR_NONE_VALUE = '';

/**
 * @typedef {Object} shardChoice
 * @property {string} shardID - unique key for shard
 * @property {string} displayName - localized shard name
 */

/**
 * Generator and controller for message log.
 * @param {jQuery} rootDiv
 * @param {NetSimConnection} connection
 * @param {DashboardUser} user - The current user's info, whether logged in or not.
 * @param {string} [sharedShardSeed] - A shard identifier provided when loading
 *        a share link.  We guarantee that this shard will be an option.
 * @constructor
 * @augments NetSimPanel
 */
var NetSimShardSelectionPanel = module.exports = function (rootDiv, connection,
    user, sharedShardSeed) {
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

  /**
   * Shard options for the current user
   * @type {shardChoice[]}
   * @private
   */
  this.shardChoices_ = [];

  /**
   * Which shard ID is currently selected
   * @type {string}
   * @private
   */
  this.selectedShardID_ = SELECTOR_NONE_VALUE;

  // Figure out the list of user sections, which requires an async request
  // and re-render if the user is signed in.
  if (user.isSignedIn) {
    this.getUserSections_(function (sectionList) {
      this.buildShardChoiceList_(sectionList, sharedShardSeed);
      this.render();
    }.bind(this));
  } else {
    this.buildShardChoiceList_([], sharedShardSeed);
  }

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
    displayName: this.displayName_,
    selectedShardID: this.selectedShardID_,
    shardChoices: this.shardChoices_,
    SELECTOR_NONE_VALUE: SELECTOR_NONE_VALUE
  }));
  this.getBody().html(newMarkup);

  // Bind handlers
  var nameField = this.getBody().find('#netsim_lobby_name');
  nameField.keyup(this.onNameKeyUp_.bind(this));

  var setNameButton = this.getBody().find('#netsim_lobby_set_name_button');
  setNameButton.click(this.setNameButtonClick_.bind(this));

  var shardSelect = this.getBody().find('#netsim_shard_select');
  shardSelect.change(this.onShardSelectChange_.bind(this));
  shardSelect.keyup(this.onShardSelectKeyUp_.bind(this));

  var setShardButton = this.getBody().find('#netsim_shard_confirm_button');
  setShardButton.click(this.setShardButtonClick_.bind(this));

  if (this.displayName_.length === 0) {
    nameField.focus();
  } else if (this.selectedShardID_ === SELECTOR_NONE_VALUE) {
    shardSelect.focus();
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

NetSimShardSelectionPanel.prototype.onShardSelectChange_ = function (jQueryEvent) {
  var shardID = jQueryEvent.target.value;
  var setShardButton = this.getBody().find('#netsim_shard_confirm_button');
  setShardButton.attr('disabled', !shardID || shardID === SELECTOR_NONE_VALUE);
};

NetSimShardSelectionPanel.prototype.onShardSelectKeyUp_ = function (jQueryEvent) {
  var shardID = jQueryEvent.target.value;
  if (shardID && shardID !== SELECTOR_NONE_VALUE &&
      jQueryEvent.which === KeyCodes.ENTER) {
    this.setShardButtonClick_();
  }
};

NetSimShardSelectionPanel.prototype.setShardButtonClick_ = function () {
  this.selectedShardID_ = this.getBody().find('#netsim_shard_select').val();
  this.connection_.connectToShard(this.selectedShardID_, this.displayName_);
  this.render();
};

/**
 * Generate a unique shard key from the given seed
 * @param {string} seed
 * @private
 */
NetSimShardSelectionPanel.prototype.makeShardIDFromSeed_ = function (seed) {
  // TODO (bbuchanan) : Use unique level ID when generating shard ID
  var levelID = 'demo';
  // TODO (bbuchanan) : Ensure shard ID is 48 characters or less
  // Maybe grab this MIT-licensed implementation via node?
  // https://github.com/blueimp/JavaScript-MD5
  //return 'ns_' + md5(levelID + '_' + seed);
  return 'ns_' + levelID + '_' + seed;
};

/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param {function} callback
 * @private
 */
NetSimShardSelectionPanel.prototype.getUserSections_ = function (callback) {
  var memberSectionsRequest = $.ajax({
    dataType: 'json',
    url: '/v2/sections/membership'
  });

  var ownedSectionsRequest = $.ajax({
    dataType: 'json',
    url: '/v2/sections'
  });

  $.when(memberSectionsRequest, ownedSectionsRequest).done(function (result1, result2) {
    var memberSectionData = result1[0];
    var ownedSectionData = result2[0];
    callback(memberSectionData.concat(ownedSectionData));
  });
};

/**
 * Populate the internal cache of shard options, given a set of the current
 * user's sections.
 * @param {Array} sectionList - list of sections this user is a member or
 *        administrator of.  Each section has an id and a name.  May be empty.
 * @param {string} sharedShardSeed - a shard ID present if we reached netsim
 *        via a share link.  We should make sure this shard is an option.
 * @private
 */
NetSimShardSelectionPanel.prototype.buildShardChoiceList_ = function (
    sectionList, sharedShardSeed) {
  this.shardChoices_.length = 0;

  // If we have a shared shard seed, put it first in the list:
  if (sharedShardSeed) {
    var sharedShardID = this.makeShardIDFromSeed_(sharedShardSeed);
    this.shardChoices_.push({
      shardID: sharedShardID,
      displayName: sharedShardSeed
    });
  }

  // Add user's sections to the shard list
  this.shardChoices_ = this.shardChoices_.concat(
      sectionList.map(function (section) {
        return {
          shardID: this.makeShardIDFromSeed_(section.id),
          displayName: section.name
        };
      }.bind(this)));

  // If there still aren't any options, generate a random shard
  if (this.shardChoices_.length === 0) {
    var randomShardID = this.makeShardIDFromSeed_(utils.createUuid());
    this.shardChoices_.push({
      shardID: randomShardID,
      displayName: i18n.myPrivateNetwork()
    });
  }

  // If there's only one possible shard, select it by default
  if (this.shardChoices_.length === 1 && !this.selectedShardID_) {
    this.selectedShardID_ = this.shardChoices_[0].shardID;
  }
};
