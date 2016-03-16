/** @file Tests for NetSimPacketEditor */
'use strict';
/* global describe, beforeEach, it */

var assert = require('../util/testUtils').assert;
var NetSimTestUtils = require('../util/netsimTestUtils');
var NetSimPacketEditor = require('@cdo/apps/netsim/NetSimPacketEditor');
var DataConverters = require('@cdo/apps/netsim/DataConverters');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var EncodingType = require('@cdo/apps/netsim/NetSimConstants').EncodingType;

describe("NetSimPacketEditor", function () {
  var editor, rootDiv;

  var alignDecimal = DataConverters.alignDecimal;
  var binaryToAB = DataConverters.binaryToAB;
  var binaryToDecimal = DataConverters.binaryToDecimal;
  var binaryToHex = DataConverters.binaryToHex;
  var formatAB = DataConverters.formatAB;
  var formatBinary = DataConverters.formatBinary;
  var formatHex = DataConverters.formatHex;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    editor = new NetSimPacketEditor({
      packetSpec: NetSimGlobals.getLevelConfig().clientInitialPacketHeader,
      contentChangeCallback: function () {}
    });
    rootDiv = editor.getRoot();
  });

  it("only renders enabled encodings", function () {
    var message = "test message";
    var binaryMessage = DataConverters.asciiToBinary(message, 8);
    editor.message = binaryMessage;

    editor.setEncodings([EncodingType.ASCII]);

    assert.equal(1, rootDiv.find('tr.ascii').length);
    assert.equal(0, rootDiv.find('tr.decimal').length);
    assert.equal(0, rootDiv.find('tr.hexadecimal').length);
    assert.equal(0, rootDiv.find('tr.binary').length);
    assert.equal(0, rootDiv.find('tr.a_and_b').length);

    editor.setEncodings([]);

    assert.equal(0, rootDiv.find('tr.ascii').length);
    assert.equal(0, rootDiv.find('tr.decimal').length);
    assert.equal(0, rootDiv.find('tr.hexadecimal').length);
    assert.equal(0, rootDiv.find('tr.binary').length);
    assert.equal(0, rootDiv.find('tr.a_and_b').length);

    editor.setEncodings([
        EncodingType.ASCII,
        EncodingType.DECIMAL,
        EncodingType.HEXADECIMAL,
        EncodingType.BINARY,
        EncodingType.A_AND_B,
      ]);

    assert.equal(1, rootDiv.find('tr.ascii').length);
    assert.equal(1, rootDiv.find('tr.decimal').length);
    assert.equal(1, rootDiv.find('tr.hexadecimal').length);
    assert.equal(1, rootDiv.find('tr.binary').length);
    assert.equal(1, rootDiv.find('tr.a_and_b').length);

    assert.equal(message, rootDiv.find('tr.ascii textarea.message').val());
    assert.equal(formatBinary(binaryMessage, 8), rootDiv.find('tr.binary textarea.message').val());
    assert.equal(alignDecimal(binaryToDecimal(binaryMessage, 8)), rootDiv.find('tr.decimal textarea.message').val());
    assert.equal(formatHex(binaryToHex(binaryMessage), 8), rootDiv.find('tr.hexadecimal textarea.message').val());
    assert.equal(formatAB(binaryToAB(binaryMessage), 8), rootDiv.find('tr.a_and_b textarea.message').val());
  });

});
