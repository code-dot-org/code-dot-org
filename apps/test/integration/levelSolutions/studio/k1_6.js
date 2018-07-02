import {TestResults} from '@cdo/apps/constants';

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
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 10000);
      },
      customValidator: function (assert) {
        assert.isFalse(window.Studio.sprite[0].visible, 'sprite is hidden');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      // Move south, east, and northwest, and ensure we end up at 0,0
      description: "Diagonal move is long enough",
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
        '              <block type="studio_moveEastDistance">' +
        '                <title name="SPRITE">0</title>' +
        '                <next>' +
        '                  <block type="studio_moveNorthwestDistance">' +
        '                    <title name="SPRITE">0</title>' +
        '                  </block>' +
        '                </next>' +
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
        }, 10000);
      },
      customValidator: function (assert) {
        assert.equal(window.Studio.sprite[0].x, 0, 'sprite is at the far left');
        assert.equal(window.Studio.sprite[0].y, 0, 'sprite is at the top');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      // Move souteast, west, and north, and ensure we end up at 0,0
      description: "Diagonal move is not too long",
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="VALUE">"visible"</title>' +
        '        <title name="SPRITE">0</title>' +
        '        <next>' +
        '          <block type="studio_moveSoutheastDistance">' +
        '            <title name="SPRITE">0</title>' +
        '            <next>' +
        '              <block type="studio_moveWestDistance">' +
        '                <title name="SPRITE">0</title>' +
        '                <next>' +
        '                  <block type="studio_moveNorthDistance">' +
        '                    <title name="SPRITE">0</title>' +
        '                  </block>' +
        '                </next>' +
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
        }, 10000);
      },
      customValidator: function (assert) {
        assert.equal(window.Studio.sprite[0].x, 0, 'sprite is at the far left');
        assert.equal(window.Studio.sprite[0].y, 0, 'sprite is at the top');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
