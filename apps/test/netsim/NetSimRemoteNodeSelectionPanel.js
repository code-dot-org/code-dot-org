/** @file Tests for NetSimRemoteNodeSelectionPanel */
/* global $, describe, beforeEach, it */
var testUtils = require('../util/testUtils');
var NetSimTestUtils = require('../util/netsimTestUtils');
var assert = testUtils.assert;

var NetSimRemoteNodeSelectionPanel = require('@cdo/apps/netsim/NetSimRemoteNodeSelectionPanel');
var DashboardUser = require('@cdo/apps/netsim/DashboardUser');

describe("NetSimRemoteNodeSelectionPanel", function () {

  describe("canCurrentUserResetShard", function () {
    var rootDiv, panel;

    beforeEach(function () {
      NetSimTestUtils.initializeGlobalsToDefaultValues();
      rootDiv = $(document.createElement('div'));
      panel = new NetSimRemoteNodeSelectionPanel(rootDiv, {
        nodesOnShard: [],
        incomingConnectionNodes: []
      }, {});
    });

    it ("false if no user detected", function () {
      assert.equal(false, panel.canCurrentUserResetShard());
    });

    describe ("for admin", function () {
      var adminUser;

      beforeEach(function () {
        adminUser = new DashboardUser();
        adminUser.isAdmin = true;
        panel.user_ = adminUser;
      });

      it ("true with no shard ID", function () {
        panel.shardID_ = undefined;
        assert.equal(true, panel.canCurrentUserResetShard());
      });

      it ("true with numeric shard ID", function () {
        panel.shardID_ = 'anyoldshardname_42';
        assert.equal(true, panel.canCurrentUserResetShard());
      });

      it ("true with word shard ID", function () {
        panel.shardID_ = 'anyoldshardname_test';
        assert.equal(true, panel.canCurrentUserResetShard());
      });
    });

    describe ("for teacher", function () {
      var teacherUser;

      beforeEach(function () {
        teacherUser = new DashboardUser();
        teacherUser.isAdmin = false;
        teacherUser.ownedSections = [{id: 42}, {id: 43}];
        panel.user_ = teacherUser;
      });

      it ("true if user owns section", function () {
        panel.shardID_ = 'anyoldshardname_42';
        assert.equal(true, panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_43';
        assert.equal(true, panel.canCurrentUserResetShard());
      });

      it ("false if user does not own section", function () {
        panel.shardID_ = 'anyoldshardname_44';
        assert.equal(false, panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_45';
        assert.equal(false, panel.canCurrentUserResetShard());
      });

      it ("false with word (non-section) shard IDs", function () {
        panel.shardID_ = 'customshard_test';
        assert.equal(false, panel.canCurrentUserResetShard());
      });
    });

    describe ("for student", function () {
      var studentUser;

      beforeEach(function () {
        studentUser = new DashboardUser();
        studentUser.isAdmin = false;
        studentUser.ownedSections = [];
        panel.user_ = studentUser;
      });

      it ("false for numeric (section) shard IDs", function () {
        panel.shardID_ = 'anyoldshardname_42';
        assert.equal(false, panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_43';
        assert.equal(false, panel.canCurrentUserResetShard());

        panel.shardID_ = 'anyoldshardname_44';
        assert.equal(false, panel.canCurrentUserResetShard());

        panel.shardID_ = 'someothershardname_45';
        assert.equal(false, panel.canCurrentUserResetShard());
      });

      it ("false with word (non-section) shard IDs", function () {
        panel.shardID_ = 'customshard_test';
        assert.equal(false, panel.canCurrentUserResetShard());
      });
    });

  });
});
