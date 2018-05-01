import {TestResults} from '@cdo/apps/constants';

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "5_5",
  tests: [
    {
      description: "Free play level with infinite loop",
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      runBeforeClick: function () {
        // This is a free-play level: click Finish when drawing is done.
        addEventListener('artistDrawingComplete', () => $('#finishButton').click());
      },
      xml:
        '<xml>' +
        '    <block type="when_run" deletable="false" movable="false">' +
        '      <next>' +
        '        <block type="controls_for_counter" inline="true">' +
        '          <mutation counter="counter"></mutation>' +
        '          <value name="FROM">' +
        '            <block type="math_number">' +
        '              <title name="NUM">4</title>' +
        '              </block>' +
        '              </value>' +
        '              <value name="TO">' +
        '              <block type="math_number">' +
        '              <title name="NUM">8</title>' +
        '          </block>' +
        '        </value>' +
        '        <value name="BY">' +
        '          <block type="math_number">' +
        '            <title name="NUM">0</title>' +
        '          </block>' +
        '        </value>' +
        '        <statement name="DO">' +
        '          <block type="draw_move" inline="true">' +
        '            <title name="DIR">moveForward</title>' +
        '            <value name="VALUE">' +
        '              <block type="math_number">' +
        '                <title name="NUM">100</title>' +
        '              </block>' +
        '            </value>' +
        '          </block>' +
        '        </statement>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>'
    }
  ]
};
