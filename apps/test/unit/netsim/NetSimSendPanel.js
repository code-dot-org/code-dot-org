/** @file Tests for NetSimLogPanel */
import $ from 'jquery';
import {assert} from '../../util/configuredChai';
import {KeyCodes} from '@cdo/apps/constants';
var NetSimTestUtils = require('../../util/netsimTestUtils');
var NetSimSendPanel = require('@cdo/apps/netsim/NetSimSendPanel');
var NetSimLocalClientNode = require('@cdo/apps/netsim/NetSimLocalClientNode');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var NetSimConstants = require('@cdo/apps/netsim/NetSimConstants');
var MessageGranularity = NetSimConstants.MessageGranularity;

/**
 * Simulate an enter key press when the given element is in focus.
 * @param {jQuery} jQueryElement
 */
function simulateEnterKeyPress(jQueryElement) {
  var e = $.Event('keydown');
  e.which = KeyCodes.ENTER;
  e.keyCode = KeyCodes.ENTER;
  jQueryElement.trigger(e);
}

describe("NetSimSendPanel", function () {
  var testShard, localNode, remoteNode;
  var panel, rootDiv, stubNetSim;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    NetSimGlobals.getLevelConfig().defaultEnabledEncodings = ['binary'];

    testShard = NetSimTestUtils.fakeShard();
    NetSimLocalClientNode.create(testShard, 'Local Lois', function (_, node) {
      localNode = node;
    });
    NetSimLocalClientNode.create(testShard, 'Remote Ralph', function (_, node) {
      remoteNode = node;
    });
    assert(localNode && remoteNode, "Created test nodes");

    localNode.connectToClient(remoteNode, function () {});
    remoteNode.connectToClient(localNode, function () {});

    rootDiv = $('<div>');
    stubNetSim = {
      animateSetWireState: function () {},
      myNode: localNode,
      runLoop_: {
        tick: {
          register: function () {}
        }
      },
      updateLayout: function () {}
    };
  });

  describe("in single-bit mode", function () {
    beforeEach(function () {
      NetSimGlobals.getLevelConfig().messageGranularity = MessageGranularity.BITS;
      panel = new NetSimSendPanel(rootDiv, NetSimGlobals.getLevelConfig(), stubNetSim);
    });

    it("sends a single bit on 'Set Wire' button click", function () {
      panel.packets_[0].setPacketBinary('1000');
      panel.getBody().find('#set-wire-button').click();
      assert.equal('000', panel.packets_[0].getPacketBinary());
    });

    it("sends a single bit on pressing enter", function () {
      panel.packets_[0].setPacketBinary('1000');
      simulateEnterKeyPress(rootDiv.find('textarea.message'));
      assert.equal('000', panel.packets_[0].getPacketBinary());
    });
  });

  describe("in packet mode", function () {
    beforeEach(function () {
      NetSimGlobals.getLevelConfig().messageGranularity = MessageGranularity.PACKETS;
      panel = new NetSimSendPanel(rootDiv, NetSimGlobals.getLevelConfig(), stubNetSim);
    });

    it("sends all packets on 'Send' button click", function () {
      panel.packets_[0].setPacketBinary('1000');
      panel.getBody().find('#send-button').click();
      panel.tick({time:0});
      assert.equal('', panel.packets_[0].getPacketBinary());
    });

    it("sends all packets on pressing enter", function () {
      panel.packets_[0].setPacketBinary('1000');
      simulateEnterKeyPress(rootDiv.find('textarea.message'));
      panel.tick({time:0});
      assert.equal('', panel.packets_[0].getPacketBinary());
    });
  });
});
