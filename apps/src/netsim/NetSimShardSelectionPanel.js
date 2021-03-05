/**
 * @overview Lobby UI component used for name entry and selecting a shard/class
 *           section.
 * @see NetSimLobby for usage.
 */

import $ from 'jquery';
var utils = require('../utils'); // Provides Function.prototype.inherits
var i18n = require('@cdo/netsim/locale');
var markup = require('./NetSimShardSelectionPanel.html.ejs');
var NetSimPanel = require('./NetSimPanel');
import {KeyCodes} from '../constants';
import {getStore} from '../redux';
import {updateQueryParam} from '../code-studio/utils';
import {reload} from '../utils';

/**
 * @type {string}
 * @const
 */
var SELECTOR_NONE_VALUE = '';

/**
 * Generator and controller for message log.
 *
 * @param {jQuery} rootDiv
 *
 * @param {Object} options
 * @param {string} options.displayName
 * @param {Array} options.shardChoices
 * @param {string} options.selectedShardID
 *
 * @param {Object} callbacks
 * @param {function} callbacks.setNameCallback
 * @param {function} callbacks.setShardCallback
 *
 * @constructor
 * @augments NetSimPanel
 */
var NetSimShardSelectionPanel = (module.exports = function(
  rootDiv,
  options,
  callbacks
) {
  /**
   * @type {string}
   * @private
   */
  this.displayName_ = options.displayName;

  /**
   * Shard options for the current user
   * @type {ShardChoice[]}
   * @private
   */
  this.shardChoices_ = utils.valueOr(options.shardChoices, []);

  /**
   * Which shard ID is currently selected
   * @type {string}
   * @private
   */
  this.selectedShardID_ = utils.valueOr(
    options.selectedShardID,
    SELECTOR_NONE_VALUE
  );

  /**
   * @type {function}
   * @private
   */
  this.setNameCallback_ = callbacks.setNameCallback;

  /**
   * @type {function}
   * @private
   */
  this.setShardCallback_ = callbacks.setShardCallback;

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-shard-selection-panel',
    panelTitle: i18n.pickASection(),
    userToggleable: false
  });
});
NetSimShardSelectionPanel.inherits(NetSimPanel);

/**
 * Recreate markup within panel body.
 */
NetSimShardSelectionPanel.prototype.render = function() {
  // Create boilerplate panel markup
  NetSimShardSelectionPanel.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(
    markup({
      displayName: this.displayName_,
      selectedShardID: this.selectedShardID_,
      shardChoices: this.shardChoices_,
      SELECTOR_NONE_VALUE: SELECTOR_NONE_VALUE
    })
  );
  this.getBody().html(newMarkup);

  // Bind handlers
  var nameField = this.getBody().find('#netsim-lobby-name');
  nameField.keyup(this.onNameKeyUp_.bind(this));

  var setNameButton = this.getBody().find('#netsim-lobby-set-name-button');
  setNameButton.click(this.setNameButtonClick_.bind(this));

  var shardSelect = this.getBody().find('#netsim-shard-select');
  shardSelect.change(this.onShardSelectChange_.bind(this));
  shardSelect.keyup(this.onShardSelectKeyUp_.bind(this));

  var setShardButton = this.getBody().find('#netsim-shard-confirm-button');
  setShardButton.click(this.setShardButtonClick_.bind(this));

  // At the end of any render we should focus on the earliest unsatisfied
  // field, or if all fields are satisfied, try connecting to the specified
  // shard.
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
NetSimShardSelectionPanel.prototype.onNameKeyUp_ = function(jQueryEvent) {
  var name = jQueryEvent.target.value;
  var setNameButton = this.getBody().find('#netsim-lobby-set-name-button');
  setNameButton.attr('disabled', name.length === 0);

  if (name.length > 0 && jQueryEvent.which === KeyCodes.ENTER) {
    this.setNameButtonClick_();
  }
};

/** @private */
NetSimShardSelectionPanel.prototype.setNameButtonClick_ = function() {
  this.setNameCallback_(
    this.getBody()
      .find('#netsim-lobby-name')
      .val()
  );
};

/**
 * @param {Node} selectElement
 * @private
 */
NetSimShardSelectionPanel.prototype.updateTeacherSelectedSection_ = function(
  selectElement
) {
  const shardID = selectElement.value;
  if (shardID && getStore().getState().currentUser.userType === 'teacher') {
    const sectionIdSelected = selectElement
      .querySelector(`option[value=${shardID}]`)
      .getAttribute('section-id');

    updateQueryParam('section_id', sectionIdSelected || undefined);
    // If we have a user_id when we switch sections we should get rid of it
    updateQueryParam('user_id', undefined);
    reload();
  }
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimShardSelectionPanel.prototype.onShardSelectChange_ = function(
  jQueryEvent
) {
  var shardID = jQueryEvent.target.value;
  var setShardButton = this.getBody().find('#netsim-shard-confirm-button');
  setShardButton.attr('disabled', !shardID || shardID === SELECTOR_NONE_VALUE);
  this.updateTeacherSelectedSection_(jQueryEvent.target);
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimShardSelectionPanel.prototype.onShardSelectKeyUp_ = function(
  jQueryEvent
) {
  var shardID = jQueryEvent.target.value;
  if (
    shardID &&
    shardID !== SELECTOR_NONE_VALUE &&
    jQueryEvent.which === KeyCodes.ENTER
  ) {
    this.setShardButtonClick_();
    this.updateTeacherSelectedSection_(jQueryEvent.target);
  }
};

/** @private */
NetSimShardSelectionPanel.prototype.setShardButtonClick_ = function() {
  this.setShardCallback_(
    this.getBody()
      .find('#netsim-shard-select')
      .val()
  );
};
