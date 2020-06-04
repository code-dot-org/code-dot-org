import {assert} from '../util/deprecatedChai';
import {setupTestBlockly, getStudioAppSingleton} from './util/testBlockly';

describe('hasDuplicateVariablesInForLoops', function() {
  var studioApp;

  // create our environment
  beforeEach(function() {
    setupTestBlockly();
    studioApp = getStudioAppSingleton();

    var artistBlocks = require('@cdo/apps/turtle/blocks');
    artistBlocks.install(Blockly, {skin: 'turtle'});
  });

  afterEach(function() {
    Blockly.mainBlockSpace.getTopBlocks().forEach(function(b) {
      b.dispose();
    });
  });

  it('returns true for nested for loops with the same variable name', function() {
    // for (counter from 1 to 100 by 1) {
    //   for (counter from 1 to 100 by 1) {
    //     moveForward(100);
    //   }
    // }
    studioApp.loadBlocks(
      '<block type="controls_for" inline="true">' +
        '  <title name="VAR">counter</title>' +
        '  <value name="FROM">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="TO">' +
        '    <block type="math_number">' +
        '      <title name="NUM">100</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="BY">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '  <statement name="DO">' +
        '    <block type="controls_for" inline="true">' +
        '      <title name="VAR">counter</title>' +
        '      <value name="FROM">' +
        '        <block type="math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </value>' +
        '      <value name="TO">' +
        '        <block type="math_number">' +
        '          <title name="NUM">100</title>' +
        '        </block>' +
        '      </value>' +
        '      <value name="BY">' +
        '        <block type="math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </value>' +
        '      <statement name="DO">' +
        '        <block type="draw_move" inline="true">' +
        '          <title name="DIR">moveForward</title>' +
        '          <value name="VALUE">' +
        '            <block type="math_number">' +
        '              <title name="NUM">100</title>' +
        '            </block>' +
        '          </value>' +
        '        </block>' +
        '      </statement>' +
        '    </block>' +
        '  </statement>' +
        '</block>'
    );
    assert.equal(studioApp.hasDuplicateVariablesInForLoops(), true);
  });

  it('returns false for nested for loops with different variable names', function() {
    // for (counter from 1 to 100 by 1) {
    //   for (counter from 1 to 100 by 1) {
    //     moveForward(100);
    //   }
    // }
    studioApp.loadBlocks(
      '<block type="controls_for" inline="true">' +
        '  <title name="VAR">counter</title>' +
        '  <value name="FROM">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="TO">' +
        '    <block type="math_number">' +
        '      <title name="NUM">100</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="BY">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '  <statement name="DO">' +
        '    <block type="controls_for" inline="true">' +
        '      <title name="VAR">counter2</title>' +
        '      <value name="FROM">' +
        '        <block type="math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </value>' +
        '      <value name="TO">' +
        '        <block type="math_number">' +
        '          <title name="NUM">100</title>' +
        '        </block>' +
        '      </value>' +
        '      <value name="BY">' +
        '        <block type="math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </value>' +
        '      <statement name="DO">' +
        '        <block type="draw_move" inline="true">' +
        '          <title name="DIR">moveForward</title>' +
        '          <value name="VALUE">' +
        '            <block type="math_number">' +
        '              <title name="NUM">100</title>' +
        '            </block>' +
        '          </value>' +
        '        </block>' +
        '      </statement>' +
        '    </block>' +
        '  </statement>' +
        '</block>'
    );
    assert.equal(studioApp.hasDuplicateVariablesInForLoops(), false);
  });

  it('returns false for siblings with the same variable name', function() {
    // for (counter from 1 to 100 by 1) {
    //   moveForward(100);
    // }
    // for (counter from 1 to 100 by 1) {
    //   moveForward(100);
    // }
    studioApp.loadBlocks(
      '<block type="controls_for" inline="true">' +
        '  <title name="VAR">counter</title>' +
        '  <value name="FROM">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="TO">' +
        '    <block type="math_number">' +
        '      <title name="NUM">100</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="BY">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '  <statement name="DO">' +
        '    <block type="draw_move" inline="true">' +
        '      <title name="DIR">moveForward</title>' +
        '      <value name="VALUE">' +
        '        <block type="math_number">' +
        '          <title name="NUM">100</title>' +
        '        </block>' +
        '      </value>' +
        '    </block>' +
        '  </statement>' +
        '  <next>' +
        '    <block type="controls_for" inline="true">' +
        '      <title name="VAR">counter</title>' +
        '      <value name="FROM">' +
        '        <block type="math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </value>' +
        '      <value name="TO">' +
        '        <block type="math_number">' +
        '          <title name="NUM">100</title>' +
        '        </block>' +
        '      </value>' +
        '      <value name="BY">' +
        '        <block type="math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </value>' +
        '      <statement name="DO">' +
        '        <block type="draw_move" inline="true">' +
        '          <title name="DIR">moveForward</title>' +
        '          <value name="VALUE">' +
        '            <block type="math_number">' +
        '              <title name="NUM">100</title>' +
        '            </block>' +
        '          </value>' +
        '        </block>' +
        '      </statement>' +
        '    </block>' +
        '  </next>' +
        '</block>'
    );
    assert.equal(studioApp.hasDuplicateVariablesInForLoops(), false);
  });

  it('returns false for empty for loops', function() {
    // for (counter from 1 to 10 by 1) {
    // }
    studioApp.loadBlocks(
      '<block type="controls_for" inline="true">' +
        '  <title name="VAR">counter</title>' +
        '  <value name="FROM">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="TO">' +
        '    <block type="math_number">' +
        '      <title name="NUM">10</title>' +
        '    </block>' +
        '  </value>' +
        '  <value name="BY">' +
        '    <block type="math_number">' +
        '      <title name="NUM">1</title>' +
        '    </block>' +
        '  </value>' +
        '</block>'
    );
    assert.equal(studioApp.hasDuplicateVariablesInForLoops(), false);
  });
});
