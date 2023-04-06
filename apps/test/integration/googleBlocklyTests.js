import {assert} from '../util/reconfiguredChai';
import {setupTestGoogleBlockly} from './util/testGoogleBlockly';

describe('test google blockly', function () {
  beforeEach(function () {
    setupTestGoogleBlockly();
  });

  it('can confirm Blockly version is google', function () {
    assert(Blockly.version === 'Google');
  });
});
