var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var commonMsg = require('@cdo/apps/locale');

var levelDef = {
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  timeoutFailureTick: 200,
  freePlay: true,
  edgeCollisions: true,
  allowSpritesOutsidePlayspace: false,
  spritesHiddenToStart: true,
  customGameType: 'Rocket Height',
};

module.exports = {
  app: "studio",
  skinId: "studio",
  levelDefinition: levelDef,
  tests: [
    {
      timeout: 15000,
      description: "rocket_height = (2 + 4) / 2",
      // make sprite visible, have them say something
      xml: '' +
        '<block type="functional_definition" inline="false">' +
        '  <mutation>' +
        '    <arg name="seconds" type="Number"></arg>' +
        '    <description>Given a Number "seconds," return the height of a rocket traveling at 15 meters per second.</description>' +
        '    <outputtype>Number</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME">rocket-height</title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_dividedby" inline="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_plus" inline="false">' +
        '          <functional_input name="ARG1">' +
        '            <block type="functional_math_number">' +
        '              <title name="NUM">2</title>' +
        '            </block>' +
        '          </functional_input>' +
        '          <functional_input name="ARG2">' +
        '            <block type="functional_math_number">' +
        '              <title name="NUM">4</title>' +
        '            </block>' +
        '          </functional_input>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG2">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">2</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_start_setValue" inline="false" deletable="false" movable="false" editable="false">' +
        '  <functional_input name="VALUE">' +
        '    <block type="functional_pass" id="callout_here">' +
        '      <mutation name="rocket-height"></mutation>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>',
      customValidator: function (assert) {
        // Validate that we use parens correctly. (Otherwise we'd end up with
        // 2 + 4 / 2 = 4).
        var height = Studio.Globals.rocket_height(1);
        assert.equal(height, 3);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: "empty start",
      // make sprite visible, have them say something
      xml: '' +
        '<block type="functional_start_setValue" inline="false" deletable="false" movable="false" editable="false">' +
        '</block>',
      customValidator: function (assert) {
        assert.equal(Studio.message,
          commonMsg.emptyTopLevelBlock({topLevelBlockName: 'start (function)'}));
        return true;
      },
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      }
    },

    {
      description: "empty input inside variable",
      // make sprite visible, have them say something
      xml: '' +
        '<block type="functional_definition" inline="false" editable="false">' +
        '  <mutation>' +
        '    <outputtype>Number</outputtype>' +
        '    <isfunctionalvariable>true</isfunctionalvariable>' +
        '  </mutation>' +
        '  <title name="NAME">foobar</title>' +
           // This variable has no input
        '</block>' +
        '<block type="functional_definition" inline="false">' +
        '  <mutation>' +
        '    <arg name="seconds" type="Number"></arg>' +
        '    <description>Given a Number "seconds," return the height of a rocket traveling at 15 meters per second.</description>' +
        '    <outputtype>Number</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME">rocket-height</title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_dividedby" inline="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_plus" inline="false">' +
        '          <functional_input name="ARG1">' +
        '            <block type="functional_math_number">' +
        '              <title name="NUM">2</title>' +
        '            </block>' +
        '          </functional_input>' +
        '          <functional_input name="ARG2">' +
        '            <block type="functional_call" id="game_title">' +
        '              <mutation name="zzzy"></mutation>' +
        '            </block>' +
        '          </functional_input>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG2">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">2</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_start_setValue" inline="false" deletable="false" movable="false" editable="false">' +
        '  <functional_input name="VALUE">' +
        '    <block type="functional_pass" id="callout_here">' +
        '      <mutation name="rocket-height"></mutation>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>',
      customValidator: function (assert) {
        assert.equal(Studio.message, commonMsg.emptyBlockInVariable({name: 'foobar'}));
        return true;
      },
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      }
    },

    {
      description: "empty block inside function",
      // make sprite visible, have them say something
      xml: '' +
        '<block type="functional_definition" inline="false">' +
        '  <mutation>' +
        '    <arg name="seconds" type="Number"></arg>' +
        '    <description>Given a Number "seconds," return the height of a rocket traveling at 15 meters per second.</description>' +
        '    <outputtype>Number</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME">rocket-height</title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_dividedby" inline="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_plus" inline="false">' +
        '          <functional_input name="ARG1">' +
                    // missing input here
        '          </functional_input>' +
        '          <functional_input name="ARG2">' +
        '            <block type="functional_math_number">' +
        '              <title name="NUM">4</title>' +
        '            </block>' +
        '          </functional_input>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG2">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">2</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_start_setValue" inline="false" deletable="false" movable="false" editable="false">' +
        '  <functional_input name="VALUE">' +
        '    <block type="functional_pass" id="callout_here">' +
        '      <mutation name="rocket-height"></mutation>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>',
      customValidator: function (assert) {
        assert.equal(Studio.message,
          commonMsg.emptyBlockInFunction({name: 'rocket-height'}));
        return true;
      },
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      }
    }
  ]
};
