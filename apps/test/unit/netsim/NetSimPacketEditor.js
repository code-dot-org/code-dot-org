/** @file Tests for NetSimPacketEditor */
import {assert} from '../../util/reconfiguredChai';

import NetSimTestUtils from '../../util/netsimTestUtils';
import NetSimPacketEditor from '@cdo/apps/netsim/NetSimPacketEditor';
import NetSimGlobals from '@cdo/apps/netsim/NetSimGlobals';
import {EncodingType} from '@cdo/apps/netsim/NetSimConstants';

import {
  asciiToBinary,
  alignDecimal,
  binaryToAB,
  binaryToDecimal,
  binaryToHex,
  formatAB,
  formatBinary,
  formatHex,
} from './DataConverters';

describe('NetSimPacketEditor', function () {
  var editor, rootDiv;

  beforeEach(function () {
    NetSimTestUtils.initializeGlobalsToDefaultValues();
    editor = new NetSimPacketEditor({
      packetSpec: NetSimGlobals.getLevelConfig().clientInitialPacketHeader,
      contentChangeCallback: function () {},
    });
    rootDiv = editor.getRoot();
  });

  it('only renders enabled encodings', function () {
    var message = 'test message';
    var binaryMessage = asciiToBinary(message, 8);
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
    assert.equal(
      formatBinary(binaryMessage, 8),
      rootDiv.find('tr.binary textarea.message').val()
    );
    assert.equal(
      alignDecimal(binaryToDecimal(binaryMessage, 8)),
      rootDiv.find('tr.decimal textarea.message').val()
    );
    assert.equal(
      formatHex(binaryToHex(binaryMessage), 8),
      rootDiv.find('tr.hexadecimal textarea.message').val()
    );
    assert.equal(
      formatAB(binaryToAB(binaryMessage), 8),
      rootDiv.find('tr.a_and_b textarea.message').val()
    );
  });
});
