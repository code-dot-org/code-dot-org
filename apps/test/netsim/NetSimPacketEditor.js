/** @file Tests for NetSimPacketEditor */
/* global $, describe, beforeEach, it */
var testUtils = require('../util/testUtils');
var netsimTestUtils = require('../util/netsimTestUtils');
var assert = testUtils.assert;

var NetSimPacketEditor = require('@cdo/apps/netsim/NetSimPacketEditor');
var dataConverters = require('@cdo/apps/netsim/dataConverters');
var NetSimGlobals = require('@cdo/apps/netsim/NetSimGlobals');
var EncodingType = require('@cdo/apps/netsim/netsimConstants').EncodingType;

describe("NetSimPacketEditor", function () {
  var editor, rootDiv;

  beforeEach(function () {
    netsimTestUtils.initializeGlobalsToDefaultValues();
    editor = new NetSimPacketEditor({
      packetSpec: NetSimGlobals.getLevelConfig().clientInitialPacketHeader,
      contentChangeCallback: function () {}
    });
    rootDiv = editor.getRoot();
  });

  it ("only renders enabled encodings", function () {
    var message = "test message";
    var binaryMessage = dataConverters.asciiToBinary(message, 8);
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
    assert.equal(binaryMessage, rootDiv.find('tr.binary textarea.message').val());
    assert.equal(dataConverters.binaryToDecimal(message, 8), rootDiv.find('tr.decimal textarea.message').val());
    assert.equal(dataConverters.binaryToHex(message), rootDiv.find('tr.hexadecimal textarea.message').val());
    assert.equal(dataConverters.binaryToAB(message), rootDiv.find('tr.a_and_b textarea.message').val());
  });

});
