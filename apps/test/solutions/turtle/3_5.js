var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "3_5",
  tests: [
    {
      description: "Correct solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        '<block type="when_run" movable="false">' +
        '<next><block type="procedures_callnoreturn">' +
        '  <mutation name="draw a house"></mutation>' +
        '</block></next></block>' +

        '<block type="procedures_defnoreturn" deletable="false" movable="false" editable="false">' +
        '  <mutation></mutation>' +
        '  <title name="NAME">draw a square</title>' +
        '  <statement name="STACK">' +
        '    <block type="controls_repeat" deletable="false" movable="false" editable="false">' +
        '      <title name="TIMES">4</title>' +
        '      <statement name="DO">' +
        '        <block type="draw_move" inline="true" deletable="false" movable="false" editable="false">' +
        '          <title name="DIR">moveForward</title>' +
        '          <value name="VALUE">' +
        '            <block type="math_number" deletable="false" movable="false" editable="false">' +
        '              <title name="NUM">100</title>' +
        '            </block>' +
        '          </value>' +
        '        <next><block type="draw_turn" inline="true" deletable="false" movable="false" editable="false">' +
        '          <title name="DIR">turnRight</title>' +
        '          <value name="VALUE">' +
        '            <block type="math_number" deletable="false" movable="false" editable="false">' +
        '              <title name="NUM">90</title>' +
        '            </block>' +
        '          </value>' +
        '        </block></next></block>' +
        '      </statement>' +
        '    </block>' +
        '  </statement>' +
        '</block>' +

        '<block type="procedures_defnoreturn" deletable="false" movable="false" editable="false">' +
        '  <mutation></mutation>' +
        '  <title name="NAME">draw a triangle</title>' +
        '  <statement name="STACK">' +
        '    <block type="controls_repeat" deletable="false" movable="false" editable="false">' +
        '      <title name="TIMES">3</title>' +
        '      <statement name="DO">' +
        '        <block type="draw_move" inline="true" deletable="false" movable="false" editable="false">' +
        '          <title name="DIR">moveForward</title>' +
        '          <value name="VALUE">' +
        '            <block type="math_number" deletable="false" movable="false" editable="false">' +
        '              <title name="NUM">100</title>' +
        '            </block>' +
        '          </value>' +
        '        <next><block type="draw_turn" inline="true" deletable="false" movable="false" editable="false">' +
        '          <title name="DIR">turnRight</title>' +
        '          <value name="VALUE">' +
        '            <block type="math_number" deletable="false" movable="false" editable="false">' +
        '              <title name="NUM">120</title>' +
        '            </block>' +
        '          </value>' +
        '        </block></next></block>' +
        '      </statement>' +
        '    </block>' +
        '  </statement>' +
        '</block>' +

        '<block type="procedures_defnoreturn">' +
        '<mutation/>' +
        '<title name="NAME">draw a house</title>' +
        '<statement name="STACK">' +
        '    <block type="procedures_callnoreturn">' +
        '        <mutation name="draw a square"/>' +
        '        <next>' +
        '            <block type="draw_move" inline="true">' +
        '                <title name="DIR">moveForward</title>' +
        '                <value name="VALUE">' +
        '                    <block type="math_number">' +
        '                        <title name="NUM">100</title>' +
        '                    </block>' +
        '                </value>' +
        '                <next>' +
        '                    <block type="draw_turn" inline="true">' +
        '                        <title name="DIR">turnRight</title>' +
        '                        <value name="VALUE">' +
        '                            <block type="math_number">' +
        '                                <title name="NUM">30</title>' +
        '                            </block>' +
        '                        </value>' +
        '                        <next>' +
        '                            <block type="procedures_callnoreturn">' +
        '                                <mutation name="draw a triangle"/>' +
        '                            </block>' +
        '                        </next>' +
        '                    </block>' +
        '                </next>' +
        '            </block>' +
        '        </next>' +
        '    </block>' +
        '</statement>' +
    '</block>' +
    '</xml>'
    }
  ]
};
