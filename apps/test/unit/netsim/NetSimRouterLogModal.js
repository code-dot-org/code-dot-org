/** @file Tests for NetSimRouterLogModal */
import $ from 'jquery';
import {assert, expect} from '../../util/deprecatedChai';
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimTestUtils = require('../../util/netsimTestUtils');
var NetSimRouterLogModal = require('@cdo/apps/netsim/NetSimRouterLogModal');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');

var fakeShard = NetSimTestUtils.fakeShard;

describe('NetSimRouterLogModal', function() {
  beforeEach(function() {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
  });

  describe(`Log Mode`, function() {
    var modal, rootDiv, testShard, router, levelConfig;

    beforeEach(function() {
      levelConfig = NetSimGlobals.getLevelConfig();
      testShard = fakeShard();
      rootDiv = $('<div>');

      router = new NetSimRouterNode(testShard, {});
      modal = new NetSimRouterLogModal(rootDiv, {user: {}});
    });

    it('defaults to showing all router logs when not connected to a router', function() {
      assert.isTrue(modal.isAllRouterLogMode_);
    });

    it('defaults to showing one router log when connected to an isolated router', function() {
      levelConfig.connectedRouters = false;
      modal.setRouter(router);
      assert.isFalse(modal.isAllRouterLogMode_);
    });

    it('defaults to showing one router log when connected to a connected router', function() {
      levelConfig.connectedRouters = true;
      modal.setRouter(router);
      assert.isFalse(modal.isAllRouterLogMode_);
    });

    it('detects a local router', function() {
      assert.isFalse(modal.hasLocalRouter_());
      modal.setRouter(router);
      assert.isTrue(modal.hasLocalRouter_());
    });

    it('detects if it can log all routers', function() {
      assert.isTrue(modal.canLogAllRouters_());
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      assert.isTrue(modal.canLogAllRouters_());
      levelConfig.connectedRouters = false;
      assert.isFalse(modal.canLogAllRouters_());
    });

    it('detects if it can switch between modes', function() {
      assert.isFalse(modal.canSetRouterLogMode_());
      modal.setRouter(router);
      levelConfig.connectedRouters = true;
      assert.isTrue(modal.canSetRouterLogMode_());
      levelConfig.connectedRouters = false;
      assert.isFalse(modal.canSetRouterLogMode_());
    });
  });

  describe(`Traffic filtering modes`, function() {
    var modal, rootDiv, testShard, localNode, router;

    beforeEach(function() {
      testShard = fakeShard();
      rootDiv = $('<div>');
      modal = new NetSimRouterLogModal(rootDiv, {user: {}});

      NetSimRouterNode.create(testShard, function(e, r) {
        router = r;
      });
      assert.isDefined(router, 'Failed to create a remote router.');

      NetSimLocalClientNode.create(testShard, 'testLocalNode', function(
        err,
        node
      ) {
        localNode = node;
      });
      assert.isDefined(localNode, 'Made a local node');
    });

    it('defaults to showing all traffic in every case', function() {
      assert.equal('none', modal.currentTrafficFilter_);

      modal.onShardChange(testShard, localNode);
      assert.equal('none', modal.currentTrafficFilter_);

      localNode.connectToRouter(router);
      assert.equal('none', modal.currentTrafficFilter_);
    });

    it('can set traffic filter modes', function() {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      var address = localNode.getAddress();
      assert.equal('none', modal.currentTrafficFilter_);

      modal.setTrafficFilterMode_('with ' + address);
      assert.equal('with ' + address, modal.currentTrafficFilter_);
    });

    it("disconnecting from a router coerces filter mode back to 'none'", function() {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      var address = localNode.getAddress();
      modal.setTrafficFilterMode_('with ' + address);
      assert.equal('with ' + address, modal.currentTrafficFilter_);

      localNode.disconnectRemote();
      modal.setRouter(null); // Normally netsim.js does this
      assert.equal('none', modal.currentTrafficFilter_);
    });

    it('can render the dropdown with no local address', function() {
      expect(() => {
        modal.onShow_();
      }).not.to.throw();
    });

    it('can render the dropdown with a local address', function() {
      modal.onShardChange(testShard, localNode);
      localNode.connectToRouter(router);
      expect(() => {
        modal.onShow_();
      }).not.to.throw();
    });
  });
});
