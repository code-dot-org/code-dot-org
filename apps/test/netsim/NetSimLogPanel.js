/** @file Tests for NetSimLogPanel */
'use strict';
/* global describe, beforeEach, it */

var assert = require('../util/testUtils').assert;
var NetSimTestUtils = require('../util/netsimTestUtils');
var NetSimLogPanel = require('@cdo/apps/netsim/NetSimLogPanel');
var DataConverters = require('@cdo/apps/netsim/DataConverters');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var EncodingType = require('@cdo/apps/netsim/NetSimConstants').EncodingType;

/** ascii to binary */
function to_b(ascii) {
  return DataConverters.asciiToBinary(ascii, 8);
}

describe("NetSimLogPanel", function () {
  var panel, rootDiv;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    rootDiv = $('<div>');
  });

  it("has default maximum packet size of 50", function () {
    panel = new NetSimLogPanel(rootDiv, {});
    assert.equal(50, panel.maximumLogPackets_);
  });

  it("is open by default", function () {
    panel = new NetSimLogPanel(rootDiv, {});
    assert.isFalse(panel.isMinimized());
  });

  it("can be configured to be closed on creation", function () {
    panel = new NetSimLogPanel(rootDiv, { isMinimized: true });
    assert.isTrue(panel.isMinimized());
  });

  it("renders body on construction", function () {
    var initialHtml = rootDiv.html();
    panel = new NetSimLogPanel(rootDiv, { isMinimized: true });
    var newHtml = rootDiv.html();
    assert.notEqual(initialHtml, newHtml);
    assert(newHtml.length > initialHtml.length);
  });

  describe("logging", function () {
    var scrollArea;
    beforeEach(function () {
      panel = new NetSimLogPanel(rootDiv, {
        packetSpec: NetSimGlobals.getLevelConfig().clientInitialPacketHeader,
        maximumLogPackets: 10
      });

      panel.setEncodings([EncodingType.ASCII]);
      scrollArea = rootDiv.find('.scroll-area');
    });

    it("only renders enabled encodings", function () {
      panel.log(to_b('first-message'), 1);
      panel.setEncodings([EncodingType.ASCII]);

      assert.equal(1, scrollArea.find('.packet:first tr.ascii').length);
      assert.equal(0, scrollArea.find('.packet:first tr.decimal').length);
      assert.equal(0, scrollArea.find('.packet:first tr.hexadecimal').length);
      assert.equal(0, scrollArea.find('.packet:first tr.binary').length);
      assert.equal(0, scrollArea.find('.packet:first tr.a_and_b').length);

      panel.setEncodings([]);

      assert.equal(0, scrollArea.find('.packet:first tr.ascii').length);
      assert.equal(0, scrollArea.find('.packet:first tr.decimal').length);
      assert.equal(0, scrollArea.find('.packet:first tr.hexadecimal').length);
      assert.equal(0, scrollArea.find('.packet:first tr.binary').length);
      assert.equal(0, scrollArea.find('.packet:first tr.a_and_b').length);

      panel.setEncodings([
          EncodingType.ASCII,
          EncodingType.DECIMAL,
          EncodingType.HEXADECIMAL,
          EncodingType.BINARY,
          EncodingType.A_AND_B,
        ]);

      assert.equal(1, scrollArea.find('.packet:first tr.ascii').length);
      assert.equal(1, scrollArea.find('.packet:first tr.decimal').length);
      assert.equal(1, scrollArea.find('.packet:first tr.hexadecimal').length);
      assert.equal(1, scrollArea.find('.packet:first tr.binary').length);
      assert.equal(1, scrollArea.find('.packet:first tr.a_and_b').length);
    });

    it("can log a packet", function () {
      assert.equal(0, panel.packets_.length);
      assert.equal(0, scrollArea.children().length);
      panel.log(to_b("fake-packet-binary"), 1);
      assert.equal(1, panel.packets_.length);
      assert.equal(1, scrollArea.children().length);
    });

    it("puts subsequent packets at the top of the log", function () {
      panel.log(to_b('first-message'), 1);
      panel.log(to_b('second-message'), 2);
      assert.equal(2, scrollArea.children().length);
      assert.equal(to_b('second-message'), panel.packets_[0].packetBinary_);
      assert.equal('second-message',
          scrollArea.find('.packet:first tr.ascii td.message').text());

      panel.log(to_b('third-message'), 3);
      assert.equal(3, scrollArea.children().length);
      assert.equal(to_b('third-message'), panel.packets_[0].packetBinary_);
      assert.equal('third-message',
          scrollArea.find('.packet:first tr.ascii td.message').text());
    });

    it("keeps a limited number of packets", function () {
      // The limit in this test is 10 (see beforeEach for describe("logging"))
      for (var i = 1; i <= 9; i++) {
        panel.log(to_b('packet ' + i), i);
      }
      assert.equal(9, scrollArea.children().length);
      assert.equal('packet 9',
          scrollArea.find('.packet:first tr.ascii td.message').text());
      assert.equal('packet 1',
          scrollArea.find('.packet:last tr.ascii td.message').text());

      // Packet 10 does not cause culling
      panel.log(to_b('packet 10'), 10);
      assert.equal(10, scrollArea.children().length);
      assert.equal('packet 10',
          scrollArea.find('.packet:first tr.ascii td.message').text());
      assert.equal('packet 1',
          scrollArea.find('.packet:last tr.ascii td.message').text());

      // Packet 11 causes packet 1 to drop off the end
      panel.log(to_b('packet 11'), 11);
      assert.equal(10, scrollArea.children().length);
      assert.equal('packet 11',
          scrollArea.find('.packet:first tr.ascii td.message').text());
      assert.equal('packet 2',
          scrollArea.find('.packet:last tr.ascii td.message').text());
    });

    it("ignores duplicate packets by id", function () {
      panel.log(to_b('first-message'), 1);
      panel.log(to_b('first-message again'), 1);

      assert.equal(1, scrollArea.children().length);
      assert.equal('first-message',
          scrollArea.find('.packet:first tr.ascii td.message').text());
    });

  });

});
