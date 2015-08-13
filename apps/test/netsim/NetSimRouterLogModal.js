/** @file Tests for NetSimRouterLogModal */
/* global $, describe, beforeEach, it */
var testUtils = require('../util/testUtils');
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assert = testUtils.assert;

var NetSimRouterLogModal = require('@cdo/apps/netsim/NetSimRouterLogModal');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimLogEntry = require('@cdo/apps/netsim/NetSimLogEntry');
var DataConverters = require('@cdo/apps/netsim/DataConverters');

describe ("NetSimRouterLogModal", function () {

  beforeEach (function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe ("Log Mode", function () {
    var modal, rootDiv, testShard, router, levelConfig;

    beforeEach(function () {
      levelConfig = NetSimGlobals.getLevelConfig();
      testShard = fakeShard();
      rootDiv = $('<div>');

      router = new NetSimRouterNode(testShard, {});
      modal = new NetSimRouterLogModal(rootDiv);
    });

    it ("defaults to logging all if it can", function () {
      assert.equal(true, modal.isAllRouterLogMode_);
    });

    it ("defaults to logging one if it has to", function () {
      levelConfig.connectedRouters = false;
      modal.setRouter(router);
      assert.equal(false, modal.isAllRouterLogMode_);
    });

    it ("detects a local router", function () {
      assert.equal(false, modal.hasLocalRouter_());
      modal.setRouter(router);
      assert.equal(true, modal.hasLocalRouter_());
    });

    it ("detects if it can log all routers", function () {
      assert.equal(true, modal.canLogAllRouters_());
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      assert.equal(true, modal.canLogAllRouters_());
      levelConfig.connectedRouters = false;
      assert.equal(false, modal.canLogAllRouters_());
    });

    it ("detects if it can switch between modes", function () {
      assert.equal(false, modal.canToggleRouterLogMode_());
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      assert.equal(true, modal.canToggleRouterLogMode_());
      levelConfig.connectedRouters = false;
      assert.equal(false, modal.canToggleRouterLogMode_());
    });

  });

  describe ("Partial DOM updates", function () {
    var testShard, rootDiv, modal;

    beforeEach (function () {
      testShard = fakeShard();
      rootDiv = $(document.createElement('div'));
      modal = new NetSimRouterLogModal(rootDiv);
      modal.setShard(testShard);

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

    it ("does nothing when not visible", function () {
      // Hide modal, so it should ignore updates
      modal.onHide_();

      insertLog('a');
      assert.equal(0, rootDiv.find('tbody tr').length);
    });

    it ("when visible, adds rows to empty table", function () {
      insertLog('a');
      insertLog('b');
      insertLog('c');
      assert.equal(3, rootDiv.find('tbody tr').length);
    });

    it ("does nothing when no new rows are added to empty table", function () {
      modal.renderNewLogEntries_([]);
      assert.equal(0, rootDiv.find('tbody tr').length);
    });

    it ("does nothing when no new rows are added to nonempty table", function () {
      // Add some starter rows
      insertLog('a');
      insertLog('b');
      insertLog('c');
      assert.equal(3, rootDiv.find('tbody tr').length);

      // Adding no log entries has no effect.
      modal.renderNewLogEntries_([]);
      assert.equal(3, rootDiv.find('tbody tr').length);
    });

    describe ("preserves sorting order", function () {
      beforeEach (function () {
        insertLog('b');
        insertLog('f');
        insertLog('d');
        assert.equal(3, rootDiv.find('tbody tr').length);
        assert.equal('dfb', rootDiv.find('tbody tr td.message').text());

        // Sort by message text ascending
        modal.onSortHeaderClick_('message');
        assert.equal('bdf', rootDiv.find('tbody tr td.message').text());
      });

      it ("when inserting at the begnning", function () {
        insertLog('a');
        assert.equal(4, rootDiv.find('tbody tr').length);
        assert.equal('abdf', rootDiv.find('tbody tr td.message').text());
      });

      it ("when inserting at the end", function () {
        insertLog('g');
        assert.equal(4, rootDiv.find('tbody tr').length);
        assert.equal('bdfg', rootDiv.find('tbody tr td.message').text());
      });

      it ("when inserting in the middle", function () {
        insertLog('c');
        assert.equal(4, rootDiv.find('tbody tr').length);
        assert.equal('bcdf', rootDiv.find('tbody tr td.message').text());
        insertLog('e');
        assert.equal(5, rootDiv.find('tbody tr').length);
        assert.equal('bcdef', rootDiv.find('tbody tr td.message').text());
      });

      it ("in reverse sorting order", function () {
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
