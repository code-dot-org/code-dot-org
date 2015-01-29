'use strict';

var _ = require('../utils').getLodash();
var dom = require('../dom');
var markup = require('./NetSimLobby.html');

// TODO (bbuchanan) : Rename the section selector to the instance
//                    selector, update metaphor everywhere.

/**
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimLobby = function (connection) {
  this.connection_ = connection;
  this.connection_.registerChangeCallback(_.bind(this.refreshLobby_, this));
};
module.exports = NetSimLobby;

/**
 * Generate a new NetSimLobby object, putting
 * its markup within the provided element and returning
 * the controller object.
 * @param {DOMElement} The container for the lobby markup
 * @param {NetSimConnection} The connection manager to use
 * @return {NetSimLobby} A new controller for the generated lobby
 * @static
 */
NetSimLobby.createWithin = function (element, connection) {
  // Create a new NetSimLobby
  var controller = new NetSimLobby(connection);
  // TODO: Figure out what parameters to pass here
  element.innerHTML = markup({});
  controller.initialize();
  return controller;
};

/**
 *
 */
NetSimLobby.prototype.initialize = function () {
  this.bindElements_();
  this.refreshSectionList_();
};

/**
 * Grab the DOM elements related to this control -once-
 * and bind them to member variables.
 * Also attach method handlers.
 */
NetSimLobby.prototype.bindElements_ = function () {
  this.sectionSelector_ = document.getElementById('netsim_section_select');
  this.sectionSelector_.addEventListener('change', 
      _.bind(this.onSectionSelectorChange_, this));

  this.lobbyList_ = document.getElementById('netsim_lobby_list');

  this.refreshButton_ = document.getElementById('netsim_refresh_button');
  dom.addClickTouchEvent(this.refreshButton_,
      _.bind(this.refreshLobby_, this));
};

/**
 *
 */
NetSimLobby.prototype.onSectionSelectorChange_ = function () {
  if (this.sectionSelector_.value < 0) {
    // No section selected.  If connected, disconnect.
    if (this.connection_.isConnectedToInstance()) {
      this.connection_.disconnectFromInstance();
      // TODO: How do I hook up refresh?
    }
  } else {
    // Section selected, if it changed, connecct to new instance.
    if (this.connection_.isConnectedToInstance()) {
      this.connection_.disconnectFromInstance();
    }
    
    this.connection_.connectToInstance('demo', this.sectionSelector_.value);
    // TODO: How do I hook up refresh?
  }
};

/**
 * Make an async request against the dashboard API to
 * reload and populate the user sections list.
 */
NetSimLobby.prototype.refreshSectionList_ = function () {
  var self = this;
  var sectionSelector = this.sectionSelector_;
  this.getUserSections_(function (data) {
    $(sectionSelector).empty();

    if (0 === data.length){
      // If we didn't get any sections, we must deny access
      var option = document.createElement('option');
      option.value = -1;
      option.textContent = '-- NOT FOUND --';
      sectionSelector.appendChild(option);
      return;
    } else {// if (data.length > 1) {
      // If we have more than one section, require the user
      // to pick one.
      var option = document.createElement('option');
      option.value = -1;
      option.textContent = '-- PICK ONE --';
      sectionSelector.appendChild(option);
    }

    // Add all sections to the dropdown
    // TODO (bbuchanan) : Put teacher names in sections
    data.forEach(function (section) {
      var option = document.createElement('option');
      option.value = section.id;
      option.textContent = section.name;
      sectionSelector.appendChild(option);
    });

    self.onSectionSelectorChange_();
  });
};

NetSimLobby.prototype.refreshLobby_ = function () {
  var lobbyList = this.lobbyList_;

  if (!this.connection_.isConnectedToInstance()) {
    $(lobbyList).empty();
    return;
  }

  this.connection_.getLobbyData(function (lobbyData) {
    $(lobbyList).empty();

    lobbyData.forEach(function (connection) {
      var item = document.createElement('li');
      item.innerHTML = '[' + connection.id + '] ' + connection.name +
          ' (' + connection.lastPing + ') ' + connection.status;
      lobbyList.appendChild(item);
    });
  }); 
};

/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param callback
 * @private
 */
NetSimLobby.prototype.getUserSections_ = function (callback) {
  // TODO (bbuchanan) : Get owned sections as well, to support teachers.
  // TODO (bbuchanan) : Handle failure case nicely.  Maybe wrap callback
  //                    and nicely pass list to it.
  var userSectionEndpoint = '/v2/sections/membership';
  $.ajax({
    dataType: 'json',
    url: '/v2/sections/membership',
    success: callback
  });
};
