import {assert} from '../util/deprecatedChai';
import {setupTestBlockly, getStudioAppSingleton} from './util/testBlockly';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';

describe('functional_cond_number', function() {
  var studioApp;

  // create our environment
  beforeEach(function() {
    setupTestBlockly();
    studioApp = getStudioAppSingleton();

    var sharedFunctionalBlocks = require('@cdo/apps/sharedFunctionalBlocks');
    sharedFunctionalBlocks.install(Blockly, Blockly.JavaScript, null);

    studioApp.loadBlocks(
      '<xml><block type="functional_cond_number"></block></xml>'
    );
    assert(Blockly.mainBlockSpace.getAllBlocks().length === 1);
  });

  function validatePairs(block, expected) {
    assert.deepEqual(block.pairs_, expected);

    var max = expected.slice(-1)[0];

    // Go through all values (and one beyond) and make sure that we have
    // inputs for the expected pairs, and dont for the others
    for (var i = 0; i <= max + 1; i++) {
      if (expected.indexOf(i) === -1) {
        assert(block.getInput('COND' + i) === null);
        assert(block.getInput('VALUE' + i) === null);
      } else {
        assert(block.getInput('COND' + i) !== null);
        assert(block.getInput('VALUE' + i) !== null);
      }
    }

    // Ensure that our little rects that mark input type are properly up to
    // date (i.e. that we've removed any corresponding to removed rows).
    var numRects = block.svg_
      .getRootElement()
      .querySelectorAll('rect[width="30"]').length;
    var expectedNumRects = block.pairs_.length * 2 + 1;
    assert(
      numRects === expectedNumRects,
      '\nGot: ' + numRects + '\nExpected: ' + expectedNumRects
    );
  }

  it('it can addConditionalRow multiple times', function() {
    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond_number');
    validatePairs(block, [0]);

    block.addConditionalRow();
    validatePairs(block, [0, 1]);

    block.addConditionalRow();
    validatePairs(block, [0, 1, 2]);
  });

  it('can remove a row at the end', function() {
    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond_number');
    block.addConditionalRow();
    block.addConditionalRow();
    validatePairs(block, [0, 1, 2]);

    block.removeConditionalRow(2);
    validatePairs(block, [0, 1]);
  });

  it('can remove a row in the middle', function() {
    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond_number');
    block.addConditionalRow();
    block.addConditionalRow();
    validatePairs(block, [0, 1, 2]);

    block.removeConditionalRow(1);
    validatePairs(block, [0, 2]);
  });

  it('can add a row after removing one', function() {
    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond_number');
    block.addConditionalRow();
    block.addConditionalRow();
    validatePairs(block, [0, 1, 2]);

    block.removeConditionalRow(1);
    validatePairs(block, [0, 2]);

    block.addConditionalRow();
    validatePairs(block, [0, 2, 3]);
  });

  it("can't remove the last row", function() {
    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond_number');
    validatePairs(block, [0]);

    block.removeConditionalRow(0);
    validatePairs(block, [0]);
  });

  it('can copy/paste with sparse pairs', function() {
    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    assert(block.type === 'functional_cond_number');
    block.addConditionalRow();
    block.addConditionalRow();
    validatePairs(block, [0, 1, 2]);

    block.removeConditionalRow(1);
    validatePairs(block, [0, 2]);

    var xml = document.createElement('xml');
    xml.appendChild(Blockly.Xml.blockToDom(block));
    Blockly.mainBlockSpace.paste(xml);

    assert(Blockly.mainBlockSpace.getAllBlocks().length === 2);
    var pasted = Blockly.mainBlockSpace.getAllBlocks()[1];
    validatePairs(pasted, [0, 2]);
  });

  it('generates valid code', function() {
    // Replace block with a more complex one
    var block = Blockly.mainBlockSpace.getAllBlocks()[0];
    block.dispose();
    studioApp.loadBlocks(
      '<xml><block type="functional_cond_number" inline="false"><mutation pairs="0,3"></mutation><functional_input name="COND0"><block type="functional_less_than" inline="false"><functional_input name="ARG1"><block type="functional_math_number"><title name="NUM">3</title></block></functional_input><functional_input name="ARG2"><block type="functional_math_number"><title name="NUM">0</title></block></functional_input></block></functional_input><functional_input name="VALUE0"><block type="functional_math_number"><title name="NUM">1</title></block></functional_input><functional_input name="COND3"><block type="functional_logical_not" inline="false"><functional_input name="ARG1"><block type="functional_boolean"><title name="VAL">true</title></block></functional_input></block></functional_input><functional_input name="VALUE3"><block type="functional_math_number"><title name="NUM">2</title></block></functional_input><functional_input name="DEFAULT"><block type="functional_math_number"><title name="NUM">3</title></block></functional_input></block></xml>'
    );
    block = Blockly.mainBlockSpace.getAllBlocks()[0];

    var code = Blockly.JavaScript.blockToCode(block);

    // Generated code should look something like this:
    // (function () {
    //   if (  (  3 <   0)) { return   1; }
    //   else if (  !(  true)) { return   2; }
    //   else { return   3; }
    // })()

    var result = CustomMarshalingInterpreter.evalWith(
      'return ' + code,
      {},
      {legacy: true}
    );
    assert(result === 3);
  });
});
