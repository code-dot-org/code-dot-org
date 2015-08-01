/** @file Tests for NetSimLogPanel */
/* global $, describe, beforeEach, it */
var testUtils = require('../util/testUtils');
var netsimTestUtils = require('../util/netsimTestUtils');
var assert = testUtils.assert;

var NetSimLogPanel = require('@cdo/apps/netsim/NetSimLogPanel');
var dataConverters = require('@cdo/apps/netsim/dataConverters');
var netsimGlobals = require('@cdo/apps/netsim/netsimGlobals');

/** binary to ascii */
function to_a(binary) {
  return dataConverters.binaryToAscii(binary, 8);
}

/** ascii to binary */
function to_b(ascii) {
  return dataConverters.asciiToBinary(ascii, 8);
}

describe("NetSimLogPanel", function () {
  var panel, rootDiv;

  beforeEach(function () {
    netsimTestUtils.initializeGlobalsToDefaultValues();
    rootDiv = $('<div>');
  });

  it ("is open by default", function () {
    panel = new NetSimLogPanel(rootDiv, {});
    assert.equal(false, panel.isMinimized());
  });

  it ("can be configured to be closed on creation", function () {
    panel = new NetSimLogPanel(rootDiv, { isMinimized: true });
    assert.equal(true, panel.isMinimized());
  });

  it ("renders body on construction", function () {
    var initialHtml = rootDiv.html();
    panel = new NetSimLogPanel(rootDiv, { isMinimized: true });
    var newHtml = rootDiv.html();
    assert.notEqual(initialHtml, newHtml);
    assert(newHtml.length > initialHtml.length);
  });

  describe ("logging", function () {
    var scrollArea;
    beforeEach(function () {
      panel = new NetSimLogPanel(rootDiv, {
        packetSpec: netsimGlobals.getLevelConfig().clientInitialPacketHeader
      });
      scrollArea = rootDiv.find('.scroll-area');
    });

    it ("can log a packet", function () {
      assert.equal(0, panel.packets_.length);
      assert.equal(0, scrollArea.children().length);
      panel.log(to_b("fake-packet-binary"));
      assert.equal(1, panel.packets_.length);
      assert.equal(1, scrollArea.children().length);
    });

    it ("puts subsequent packets at the top of the log", function () {
      panel.log(to_b('first-message'));
      panel.log(to_b('second-message'));
      assert.equal(2, scrollArea.children().length);
      assert.equal(to_b('second-message'), panel.packets_[0].packetBinary_);
      assert.equal('second-message',
          scrollArea.find('.packet:first tr.ascii td.message').text());

      panel.log(to_b('third-message'));
      assert.equal(3, scrollArea.children().length);
      assert.equal(to_b('third-message'), panel.packets_[0].packetBinary_);
      assert.equal('third-message',
          scrollArea.find('.packet:first tr.ascii td.message').text());
    });

    it ("keeps the 100 most recent packets", function () {
      for (var i = 1; i <= 99; i++) {
        panel.log(to_b('packet ' + i));
      }
      assert.equal(99, scrollArea.children().length);
      assert.equal('packet 99',
          scrollArea.find('.packet:first tr.ascii td.message').text());
      assert.equal('packet 1',
          scrollArea.find('.packet:last tr.ascii td.message').text());

      // Packet 100 does not cause culling
      panel.log(to_b('packet 100'));
      assert.equal(100, scrollArea.children().length);
      assert.equal('packet 100',
          scrollArea.find('.packet:first tr.ascii td.message').text());
      assert.equal('packet 1',
          scrollArea.find('.packet:last tr.ascii td.message').text());

      // Packet 101 causes packet 1 to drop off the end
      panel.log(to_b('packet 101'));
      assert.equal(100, scrollArea.children().length);
      assert.equal('packet 101',
          scrollArea.find('.packet:first tr.ascii td.message').text());
      assert.equal('packet 2',
          scrollArea.find('.packet:last tr.ascii td.message').text());
    });
  });

});
