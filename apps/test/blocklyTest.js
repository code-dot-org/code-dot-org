var chai = require('chai');
var expect = chai.expect;

it('uses blockly', function(done) {
  var blockly = require('blockly');
  // locale file requires Blockly as a global
  window.Blockly = blockly;
  require('blockly_locale');
  expect(blockly.Msg.ACTUAL).to.equal("call");
  done();
});
