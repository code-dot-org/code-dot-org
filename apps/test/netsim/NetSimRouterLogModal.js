/** @file Tests for NetSimRouterLogModal */
/* global $, describe, beforeEach, it */
var testUtils = require('../util/testUtils');
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assert = testUtils.assert;

var NetSimRouterLogModal = require('@cdo/apps/netsim/NetSimRouterLogModal');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');

describe ("NetSimRouterLogModal", function () {

  describe ("Log Mode", function () {
    var modal, rootDiv, testShard, router, levelConfig;

    beforeEach(function () {
      NetSimTestUtils.initializeGlobalsToDefaultValues();
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
});
