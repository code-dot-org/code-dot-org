/** @file Tests for NetSimRemoteNodeSelectionPanel */
'use strict';
/* global describe, beforeEach, it */

var assert = require('../util/testUtils').assert;
var NetSimTestUtils = require('../util/netsimTestUtils');
var NetSimRemoteNodeSelectionPanel = require('@cdo/apps/netsim/NetSimRemoteNodeSelectionPanel');
var NetSimClientNode = require('@cdo/apps/netsim/NetSimClientNode');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimRouterNode = require('@cdo/apps/netsim/NetSimRouterNode');
var DashboardUser = require('@cdo/apps/netsim/DashboardUser');

describe("NetSimRemoteNodeSelectionPanel", function () {
  var rootDiv, emptyCallbacks;

  function makeRouters(routerCount) {
    var nodes = [];
    for (var i = 0; i < routerCount; i++) {
      nodes.push(new NetSimRouterNode());
    }
    return nodes;
  }

  function makeClients(routerCount) {
    var nodes = [];
    for (var i = 0; i < routerCount; i++) {
      nodes.push(new NetSimClientNode());
    }
    return nodes;
  }

  function panelWithNodes(clients) {
    return new NetSimRemoteNodeSelectionPanel(rootDiv, {
      nodesOnShard: clients,
      incomingConnectionNodes: []
    }, emptyCallbacks);
  }

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    rootDiv = $(document.createElement('div'));
    emptyCallbacks = {
      addRouterCallback: function () {},
      cancelButtonCallback: function () {},
      joinButtonCallback: function () {},
      resetShardCallback: function () {}
    };
  });

  describe("canAddRouter", function () {
    var MAX_ROUTERS;

    beforeEach(function () {
      NetSimGlobals.getLevelConfig().showAddRouterButton = true;
      MAX_ROUTERS = NetSimGlobals.getGlobalMaxRouters();
    });

    it("true in empty shard (with default test setup)", function () {
      var panel = panelWithNodes([]);
      assert.isTrue(panel.canAddRouter());
    });

    it("false if level.showAddRouterButton is false", function () {
      NetSimGlobals.getLevelConfig().showAddRouterButton = false;
      var panel = panelWithNodes([]);
      assert.isFalse(panel.canAddRouter());
    });

    it("false with an outgoing connection request", function () {
      var nodes = makeClients(3);
      var panel = new NetSimRemoteNodeSelectionPanel(rootDiv, {
        nodesOnShard: nodes,
        remoteNode: nodes[0],
        incomingConnectionNodes: []
      }, emptyCallbacks);
      assert.isFalse(panel.canAddRouter());
    });

    // A single-part address imposes no limit on the number of addressable
    // routers, so the global limit is used.
    describe("with address format 'X'", function () {
      beforeEach(function () {
        NetSimGlobals.getLevelConfig().addressFormat = '1';
      });

      it("true if current router count is below the global limit", function () {
        var panel = panelWithNodes(makeRouters(MAX_ROUTERS - 1));
        assert.isTrue(panel.canAddRouter());
      });

      it("false if current router count is at/beyond the global limit", function () {
        var panel = panelWithNodes(makeRouters(MAX_ROUTERS));
        assert.isFalse(panel.canAddRouter());
      });

      it("true if current client count is at/beyond the global router limit", function () {
        var panel = panelWithNodes(makeClients(MAX_ROUTERS));
        assert.isTrue(panel.canAddRouter());
      });

    });

    // The two-bit router part imposes a limit of four addressable routers.
    describe("with address format '2.X'", function () {
      beforeEach(function () {
        NetSimGlobals.getLevelConfig().addressFormat = '2.1';
      });

      it("true if current router count is below the addressable space of 4", function () {
        var panel = panelWithNodes(makeRouters(3));
        assert.isTrue(panel.canAddRouter());
      });

      it("true if current router count is at/above the addressable space of 4", function () {
        var panel = panelWithNodes(makeRouters(4));
        assert.isFalse(panel.canAddRouter());
      });
    });

    // The four-bit router part imposes a limit of sixteen addressable routers.
    describe("with address format 'X.X.4.X'", function () {
      beforeEach(function () {
        NetSimGlobals.getLevelConfig().addressFormat = '1.1.4.1';
      });

      it("true if current router count is below the addressable space of 16", function () {
        var panel = panelWithNodes(makeRouters(15));
        assert.isTrue(panel.canAddRouter());
      });

      it("true if current router count is at/above the addressable space of 16", function () {
        var panel = panelWithNodes(makeRouters(16));
        assert.isFalse(panel.canAddRouter());
      });
    });

    // The eight-bit router part imposes a limit of 256 addressable routers.
    // However, this is larger than our global router maximum, so we are still
    // limited by the global maximum.
    describe("with address format '8.X'", function () {
      beforeEach(function () {
        NetSimGlobals.getLevelConfig().addressFormat = '8.1';
      });

      it("true if current router count is below the global maximum", function () {
        assert(MAX_ROUTERS < 256);
        var panel = panelWithNodes(makeRouters(MAX_ROUTERS - 1));
        assert.isTrue(panel.canAddRouter());
      });

      it("true if current router count is at/above the global maximum", function () {
        assert(MAX_ROUTERS < 256);
        var panel = panelWithNodes(makeRouters(MAX_ROUTERS));
        assert.isFalse(panel.canAddRouter());
      });
    });
  });

  describe("canCurrentUserResetShard", function () {
    var panel;

    beforeEach(function () {
      panel = panelWithNodes([]);
    });

    it("false if no user detected", function () {
      assert.isFalse(panel.canCurrentUserResetShard());
    });

    describe("for admin", function () {
      var adminUser;

      beforeEach(function () {
        adminUser = new DashboardUser();
        adminUser.isAdmin = true;
        panel.user_ = adminUser;
      });

      it("true with no shard ID", function () {
        panel.shardID_ = undefined;
        assert.isTrue(panel.canCurrentUserResetShard());
      });

      it("true with numeric shard ID", function () {
        panel.shardID_ = 'anyoldshardname_42';
        assert.isTrue(panel.canCurrentUserResetShard());
      });

      it("true with word shard ID", function () {
        panel.shardID_ = 'anyoldshardname_test';
        assert.isTrue(panel.canCurrentUserResetShard());
      });
    });

    describe("for teacher", function () {
      var teacherUser;

      beforeEach(function () {
        teacherUser = new DashboardUser();
        teacherUser.isAdmin = false;
        teacherUser.ownedSections = [{id: 42}, {id: 43}];
        panel.user_ = teacherUser;
      });

      it("true if user owns section", function () {
        panel.shardID_ = 'anyoldshardname_42';
        assert.isTrue(panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_43';
        assert.isTrue(panel.canCurrentUserResetShard());
      });

      it("false if user does not own section", function () {
        panel.shardID_ = 'anyoldshardname_44';
        assert.isFalse(panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_45';
        assert.isFalse(panel.canCurrentUserResetShard());
      });

      it("false with word (non-section) shard IDs", function () {
        panel.shardID_ = 'customshard_test';
        assert.isFalse(panel.canCurrentUserResetShard());
      });
    });

    describe("for student", function () {
      var studentUser;

      beforeEach(function () {
        studentUser = new DashboardUser();
        studentUser.isAdmin = false;
        studentUser.ownedSections = [];
        panel.user_ = studentUser;
      });

      it("false for numeric (section) shard IDs", function () {
        panel.shardID_ = 'anyoldshardname_42';
        assert.isFalse(panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_43';
        assert.isFalse(panel.canCurrentUserResetShard());

        panel.shardID_ = 'anyoldshardname_44';
        assert.isFalse(panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_45';
        assert.isFalse(panel.canCurrentUserResetShard());
      });

      it("false with word (non-section) shard IDs", function () {
        panel.shardID_ = 'customshard_test';
        assert.isFalse(panel.canCurrentUserResetShard());
      });
    });

  });
});
