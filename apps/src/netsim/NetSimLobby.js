/**
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generator and controller for shard lobby/connection controls.
 */

/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 4,
 maxstatements: 200
 */
/* global $ */
'use strict';

var dom = require('../dom');
var NetSimNodeClient = require('./NetSimNodeClient');
var NetSimNodeRouter = require('./NetSimNodeRouter');
var markup = require('./NetSimLobby.html');
var periodicAction = require('./periodicAction');

/**
 * How often the lobby should be auto-refreshed.
 * @type {number}
 * @const
 */
var AUTO_REFRESH_INTERVAL_MS = 5000;
var CLOSED_REFRESH_INTERVAL_MS = 30000;

/**
 * @param {NetSimConnection} connection - The shard connection that this
 *        lobby control will manipulate.
 * @param {DashboardUser} user - The current user, logged in or not.
 * @param {string} [shardID]
 * @constructor
 */
var NetSimLobby = function (connection, user, shardID) {

  /**
   * Shard connection that this lobby control will manipulate.
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges.register(this, this.refreshLobby_);

  /**
   * Current user, logged in or no.
   * @type {DashboardUser}
   * @private
   */
  this.user_ = user;

  /**
   * Query-driven shard ID to use.
   * @type {string}
   * @private
   */
  this.overrideShardID_ = shardID;

  /**
   * Helper for running a regular lobby refresh
   * @type {periodicAction}
   * @private
   */
  this.periodicRefresh_ = periodicAction(this.refreshLobby_.bind(this),
      AUTO_REFRESH_INTERVAL_MS);

  /**
   * Which item in the lobby is currently selected
   * @type {number}
   * @private
   */
  this.selectedID_ = undefined;

  /**
   * Which listItem DOM element is currently selected
   * @type {*}
   * @private
   */
  this.selectedListItem_ = undefined;
};
module.exports = NetSimLobby;

/**
 * Generate a new NetSimLobby object, putting
 * its markup within the provided element and returning
 * the controller object.
 * @param {DOMElement} element The container for the lobby markup
 * @param {NetSimConnection} connection The connection manager to use
 * @param {DashboardUser} user The current user info
 * @param {string} [shardID] A particular shard ID to use, can be omitted which
 *        causes the system to look for user section shards, or generate a
 *        new one.
 * @return {NetSimLobby} A new controller for the generated lobby
 * @static
 */
NetSimLobby.createWithin = function (element, connection, user, shardID) {
  // Create a new NetSimLobby
  var controller = new NetSimLobby(connection, user, shardID);
  element.innerHTML = markup({});
  controller.bindElements_();
  return controller;
};

/**
 * Grab the DOM elements related to this control -once-
 * and bind them to member variables.
 * Also attach method handlers.
 */
NetSimLobby.prototype.bindElements_ = function () {
  this.lobbyOpenDiv_ = document.getElementById('netsim_lobby_open');
  this.lobbyClosedDiv_ = document.getElementById('netsim_lobby_closed');

  this.nameInput_ = $('#netsim_lobby_name');
  this.setNameButton_ = $('#netsim_lobby_set_name_button');
  dom.addClickTouchEvent(this.setNameButton_[0],
      this.setNameButtonClick_.bind(this));

  this.shardSelector_ = document.getElementById('netsim_shard_select');
  $(this.shardSelector_).change(this.onShardSelectorChange_.bind(this));

  this.lobbyList_ = document.getElementById('netsim_lobby_list');

  this.addRouterButton_ = document.getElementById('netsim_lobby_add_router');
  dom.addClickTouchEvent(this.addRouterButton_,
      this.addRouterButtonClick_.bind(this));

  this.connectButton_ = document.getElementById('netsim_lobby_connect');
  dom.addClickTouchEvent(this.connectButton_,
      this.connectButtonClick_.bind(this));

  this.disconnectButton_ = document.getElementById('netsim_lobby_disconnect');
  dom.addClickTouchEvent(this.disconnectButton_,
      this.disconnectButtonClick_.bind(this));

  this.connectionStatusSpan_ = document.getElementById('netsim_lobby_statusbar');

  $('.shardLink').hide();

  if (this.user_.isSignedIn) {
    this.nameInput_.val(this.user_.name);
    this.nameInput_.prop('disabled', true);
    this.setNameButton_.hide();

    this.refreshShardList_();
  } else {
    this.shardSelector_.disabled = true;
  }
};

/**
 * Attach own handlers to run loop events.
 * @param {RunLoop} runLoop
 */
NetSimLobby.prototype.attachToRunLoop = function (runLoop) {
  this.periodicRefresh_.attachToRunLoop(runLoop);
};

NetSimLobby.prototype.setNameButtonClick_ = function () {
  this.nameInput_.prop('disabled', true);
  this.setNameButton_.hide();
  this.shardSelector_.disabled = false;
  this.refreshShardList_();
};

/** Handler for picking a new shard from the dropdown. */
NetSimLobby.prototype.onShardSelectorChange_ = function () {
  if (this.connection_.isConnectedToShard()) {
    this.connection_.disconnectFromShard();
    this.periodicRefresh_.disable();
    this.nameInput_.disabled = false;
  }

  if (this.shardSelector_.value !== '__none') {
    this.nameInput_.disabled = true;
    this.connection_.connectToShard(this.shardSelector_.value,
        this.nameInput_.val());
  }
};

/** Handler for clicking the "Add Router" button. */
NetSimLobby.prototype.addRouterButtonClick_ = function () {
  this.connection_.addRouterToLobby();
};

/** Handler for clicking the "Connect" button. */
NetSimLobby.prototype.connectButtonClick_ = function () {
  if (!this.selectedID_) {
    return;
  }

  this.connection_.connectToRouter(this.selectedID_);
};

/** Handler for clicking the "disconnect" button. */
NetSimLobby.prototype.disconnectButtonClick_ = function () {
  this.connection_.disconnectFromRouter();
};

/**
 * Make an async request against the dashboard API to
 * reload and populate the user sections list.
 */
NetSimLobby.prototype.refreshShardList_ = function () {
  var self = this;
  // TODO (bbuchanan) : Use unique level ID when generating shard ID
  var levelID = 'demo';
  var shardSelector = this.shardSelector_;

  if (this.overrideShardID_ !== undefined) {
    this.useShard(this.overrideShardID_);
    return;
  }

  if (!this.user_.isSignedIn) {
    this.useRandomShard();
    return;
  }

  this.getUserSections_(function (data) {
    if (0 === data.length) {
      this.useRandomShard();
      return;
    }

    $(shardSelector).empty();

    if (data.length > 1) {
      // If we have more than one section, require the user
      // to pick one.
      $('<option>')
          .val('__none')
          .html('-- PICK ONE --')
          .appendTo(shardSelector);
    }

    // Add all shards to the dropdown
    data.forEach(function (section) {
      // TODO (bbuchanan) : Put teacher names in sections
      $('<option>')
          .val('netsim_' + levelID + '_' + section.id)
          .html(section.name)
          .appendTo(shardSelector);
    });

    self.onShardSelectorChange_();
  });
};

function createGuid()
{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

NetSimLobby.prototype.useRandomShard = function () {
  this.randomShardID = 'netsim_' + createGuid();
  this.useShard(this.randomShardID);
};

NetSimLobby.prototype.useShard = function (shardID) {
  $(this.shardSelector_).empty();

  $('<option>')
      .val(shardID)
      .html('My Private Network')
      .appendTo(this.shardSelector_);

  $('.shardLink').
      attr('href', this.buildShareLink(shardID)).
      show();

  this.onShardSelectorChange_();
};

NetSimLobby.prototype.buildShareLink = function (shardID) {
  var baseLocation = document.location.protocol + '//' +
      document.location.host + document.location.pathname;
  return baseLocation + '?s=' + shardID;
};

/**
 * Triggers a full state update based on the connection object's current status.
 * @private
 */
NetSimLobby.prototype.refreshLobby_ = function () {
  var self = this;
  var lobbyList = this.lobbyList_;
  var isOnShard = this.connection_.isConnectedToShard();
  var isInLobby = !this.connection_.isConnectedToRouter();

  if (!isOnShard) {
    this.shardSelector_.value = '__none';
    $(this.addRouterButton_).hide();
  } else {
    $(this.addRouterButton_).show();
  }

  this.periodicRefresh_.setActionInterval(isInLobby ?
      AUTO_REFRESH_INTERVAL_MS : CLOSED_REFRESH_INTERVAL_MS);

  if (isInLobby) {
    // Show the lobby and connection selector
    $(this.lobbyOpenDiv_).show();
    $(this.lobbyClosedDiv_).hide();

    if (!this.connection_.isConnectedToShard()) {
      $(lobbyList).empty();
      $(this.connectButton_).hide();
      return;
    }

    this.connection_.getAllNodes(function (lobbyData) {
      $(lobbyList).empty();
      $(self.connectButton_).show();

      lobbyData.sort(function (a, b) {
        if (a.getDisplayName() > b.getDisplayName()) {
          return 1;
        }
        return -1;
      });

      self.selectedListItem_ = undefined;
      lobbyData.forEach(function (simNode) {
        var item = $('<li>').html(
            simNode.getDisplayName() + ' : ' +
            simNode.getStatus() + ' ' +
            simNode.getStatusDetail());

        // Style rows by row type.
        if (simNode.getNodeType() === NetSimNodeRouter.getNodeType()) {
          item.addClass('router_row');
        } else {
          item.addClass('user_row');
          if (simNode.entityID === self.connection_.myNode.entityID) {
            item.addClass('own_row');
          }
        }

        // Preserve selected item across refresh.
        if (simNode.entityID === self.selectedID_) {
          item.addClass('selected_row');
          self.selectedListItem_ = item;
        }

        dom.addClickTouchEvent(item[0], self.onRowClick_.bind(self, item, simNode));
        item.appendTo(lobbyList);
      });

      self.onSelectionChange();

      self.periodicRefresh_.enable();
    });
  } else {
    // Just show the status line and the disconnect button
    $(this.lobbyClosedDiv_).show();
    $(this.lobbyOpenDiv_).hide();
    $(this.connectionStatusSpan_).html(this.connection_.myNode.getStatus() + ' ' +
        this.connection_.myNode.getStatusDetail());
  }
};

/**
 * @param {*} connectionTarget - Lobby row for clicked item
 * @private
 */
NetSimLobby.prototype.onRowClick_ = function (listItem, connectionTarget) {
  // Can't select user rows (for now)
  if (NetSimNodeClient.getNodeType() === connectionTarget.getNodeType()) {
    return;
  }

  var oldSelectedID = this.selectedID_;
  var oldSelectedListItem = this.selectedListItem_;

  // Deselect old row
  if (oldSelectedListItem) {
    oldSelectedListItem.removeClass('selected_row');
  }
  this.selectedID_ = undefined;
  this.selectedListItem_ = undefined;

  // If we clicked on a different row, select the new row
  if (connectionTarget.entityID !== oldSelectedID) {
    this.selectedID_ = connectionTarget.entityID;
    this.selectedListItem_ = listItem;
    this.selectedListItem_.addClass('selected_row');
  }

  this.onSelectionChange();
};

/** Handler for selecting/deselcting a row in the lobby listing. */
NetSimLobby.prototype.onSelectionChange = function () {
  this.connectButton_.disabled = (this.selectedListItem_ === undefined);
};

/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param callback
 * @private
 */
NetSimLobby.prototype.getUserSections_ = function (callback) {
  // TODO (bbuchanan) : Get owned sections as well, to support teachers.
  // TODO (bbuchanan): Wrap this away into a shared library for the v2/sections api
  $.ajax({
    dataType: 'json',
    url: '/v2/sections/membership',
    success: callback
  });
};
