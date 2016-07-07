/** @file Tests for NetSimRouterLogModal */
'use strict';
import $ from 'jquery';
import {assert} from '../../util/configuredChai';
var NetSimLocalClientNode = require("@cdo/apps/netsim/NetSimLocalClientNode");
var NetSimTestUtils = require('../../util/netsimTestUtils');
var NetSimRouterLogModal = require('@cdo/apps/netsim/NetSimRouterLogModal');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLogEntry = require('@cdo/apps/netsim/NetSimLogEntry');
var DataConverters = require('@cdo/apps/netsim/DataConverters');

var fakeShard = NetSimTestUtils.fakeShard;

describe("NetSimRouterLogModal", function () {

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe("Log Mode", function () {
    var modal, rootDiv, testShard, router, levelConfig;

    beforeEach(function () {
      levelConfig = NetSimGlobals.getLevelConfig();
      testShard = fakeShard();
      rootDiv = $('<div>');

      router = new NetSimRouterNode(testShard, {});
      modal = new NetSimRouterLogModal(rootDiv);
    });

    it("defaults to showing all router logs when not connected to a router", function () {
      assert.isTrue(modal.isAllRouterLogMode_);
    });

    it("defaults to showing one router log when connected to an isolated router", function () {
      levelConfig.connectedRouters = false;
      modal.setRouter(router);
      assert.isFalse(modal.isAllRouterLogMode_);
    });

    it("defaults to showing one router log when connected to a connected router", function () {
      levelConfig.connectedRouters = true;
      modal.setRouter(router);
      assert.isFalse(modal.isAllRouterLogMode_);
    });

    it("detects a local router", function () {
      assert.isFalse(modal.hasLocalRouter_());
      modal.setRouter(router);
      assert.isTrue(modal.hasLocalRouter_());
    });

    it("detects if it can log all routers", function () {
      assert.isTrue(modal.canLogAllRouters_());
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      assert.isTrue(modal.canLogAllRouters_());
      levelConfig.connectedRouters = false;
      assert.isFalse(modal.canLogAllRouters_());
    });

    it("detects if it can switch between modes", function () {
      assert.isFalse(modal.canSetRouterLogMode_());
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      assert.isTrue(modal.canSetRouterLogMode_());
      levelConfig.connectedRouters = false;
      assert.isFalse(modal.canSetRouterLogMode_());
    });

  });

  describe('Traffic filtering modes', function () {
    var modal, rootDiv, testShard, localNode, router, levelConfig;

    beforeEach(function () {
      levelConfig = NetSimGlobals.getLevelConfig();
      testShard = fakeShard();
      rootDiv = $('<div>');
      modal = new NetSimRouterLogModal(rootDiv);

      NetSimRouterNode.create(testShard, function (e, r) {
        router = r;
      });
      assert.isDefined(router, "Failed to create a remote router.");

      NetSimLocalClientNode.create(testShard, "testLocalNode", function (err, node) {
        localNode = node;
      });
      assert.isDefined(localNode, "Made a local node");
    });

    it("defaults to showing all traffic in every case", function () {
      assert.equal('none', modal.currentTrafficFilter_);

      modal.onShardChange(testShard, localNode);
      assert.equal('none', modal.currentTrafficFilter_);

      localNode.connectToRouter(router);
      assert.equal('none', modal.currentTrafficFilter_);
    });

    it("can set traffic filter modes", function () {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      var address = localNode.getAddress();
      assert.equal('none', modal.currentTrafficFilter_);

      modal.setTrafficFilterMode_('with ' + address);
      assert.equal('with ' + address, modal.currentTrafficFilter_);
    });

    it("disconnecting from a router coerces filter mode back to 'none'", function () {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      var address = localNode.getAddress();
      modal.setTrafficFilterMode_('with ' + address);
      assert.equal('with ' + address, modal.currentTrafficFilter_);

      localNode.disconnectRemote();
      modal.setRouter(null); // Normally netsim.js does this
      assert.equal('none', modal.currentTrafficFilter_);
    });
  });

  describe("Partial DOM updates", function () {
    var testShard, rootDiv, modal;

    beforeEach(function () {
      testShard = fakeShard();
      rootDiv = $(document.createElement('div'));
      modal = new NetSimRouterLogModal(rootDiv);
      modal.onShardChange(testShard, null);

      // Start with modal showing
      modal.onShow_();
      assert.equal(0, rootDiv.find('tbody tr').length);
    });

    function insertLog(asciiMessage) {
      NetSimLogEntry.create(
          testShard,
          1,
          DataConverters.asciiToBinary(asciiMessage, 8),
          NetSimLogEntry.LogStatus.SUCCESS,
          function () {});
    }

    it("does nothing when not visible", function () {
      // Hide modal, so it should ignore updates
      modal.onHide_();

      insertLog('a');
      assert.equal(0, rootDiv.find('tbody tr').length);
    });

    it("when visible, adds rows to empty table", function () {
      insertLog('a');
      insertLog('b');
      insertLog('c');
      assert.equal(3, rootDiv.find('tbody tr').length);
    });

    it("does nothing when no new rows are added to empty table", function () {
      modal.renderNewLogEntries_([]);
      assert.equal(0, rootDiv.find('tbody tr').length);
    });

    it("does nothing when no new rows are added to nonempty table", function () {
      // Add some starter rows
      insertLog('a');
      insertLog('b');
      insertLog('c');
      assert.equal(3, rootDiv.find('tbody tr').length);

      // Adding no log entries has no effect.
      modal.renderNewLogEntries_([]);
      assert.equal(3, rootDiv.find('tbody tr').length);
    });

    describe("preserves sorting order", function () {
      beforeEach(function () {
        insertLog('b');
        insertLog('f');
        insertLog('d');
        assert.equal(3, rootDiv.find('tbody tr').length);
        assert.equal('dfb', rootDiv.find('tbody tr td.message').text());

        // Sort by message text ascending
        modal.onSortHeaderClick_('message');
        assert.equal('bdf', rootDiv.find('tbody tr td.message').text());
      });

      it("when inserting at the begnning", function () {
        insertLog('a');
        assert.equal(4, rootDiv.find('tbody tr').length);
        assert.equal('abdf', rootDiv.find('tbody tr td.message').text());
      });

      it("when inserting at the end", function () {
        insertLog('g');
        assert.equal(4, rootDiv.find('tbody tr').length);
        assert.equal('bdfg', rootDiv.find('tbody tr td.message').text());
      });

      it("when inserting in the middle", function () {
        insertLog('c');
        assert.equal(4, rootDiv.find('tbody tr').length);
        assert.equal('bcdf', rootDiv.find('tbody tr td.message').text());
        insertLog('e');
        assert.equal(5, rootDiv.find('tbody tr').length);
        assert.equal('bcdef', rootDiv.find('tbody tr td.message').text());
      });

      it("in reverse sorting order", function () {
        // Second click reverses sort order
        modal.onSortHeaderClick_('message');
        assert.equal('fdb', rootDiv.find('tbody tr td.message').text());

        insertLog('a');
        assert.equal(4, rootDiv.find('tbody tr').length);
        assert.equal('fdba', rootDiv.find('tbody tr td.message').text());
        insertLog('c');
        assert.equal(5, rootDiv.find('tbody tr').length);
        assert.equal('fdcba', rootDiv.find('tbody tr td.message').text());
        insertLog('e');
        assert.equal(6, rootDiv.find('tbody tr').length);
        assert.equal('fedcba', rootDiv.find('tbody tr td.message').text());
        insertLog('g');
        assert.equal(7, rootDiv.find('tbody tr').length);
        assert.equal('gfedcba', rootDiv.find('tbody tr td.message').text());
      });
    });
  });
});
