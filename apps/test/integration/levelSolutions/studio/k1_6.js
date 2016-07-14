var testUtils = require('../../../util/testUtils');
var tickWrapper = require('../../../util/tickWrapper');
var TestResults = require('@cdo/apps/constants.js').TestResults;

module.exports = {
  app: "studio",
  skinId: "studio",
  levelFile: "levels",
  levelId: "k1_6",
  timeout: 15000,
  tests: [
    {
      description: "Show and hide sprite",
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="VALUE">"visible"</title>' +
        '        <title name="SPRITE">0</title>' +
        '        <next>' +
        '          <block type="studio_moveSouthDistance">' +
        '            <title name="SPRITE">0</title>' +
        '            <next>' +
        '              <block type="studio_setSprite">' +
        '                <title name="VALUE">"hidden"</title>' +
        '                <title name="SPRITE">0</title>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Studio, 30, function () {
          Studio.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        assert(document.getElementById('sprite0').getAttribute('visibility') === 'hidden',
          'sprite is hidden');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

  ]
};
