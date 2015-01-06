var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "studio",
  skinId: "studio",
  levelFile: "levels",
  levelId: "k1_6",
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
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 2000);
      },
      customValidator: function (assert) {
        assert(document.getElementById('sprite0').getAttribute('visibility') === 'hidden');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

  ]
};
