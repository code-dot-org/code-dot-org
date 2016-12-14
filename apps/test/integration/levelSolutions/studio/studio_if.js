var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;

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
};

module.exports = {
  app: "studio",
  skinId: "studio",
  levelDefinition: levelDef,
  tests: [
    {
      description: "ifActorIsSprite only matches specified sprite",
      xml:'<xml>' +
          '  <block type="when_run">' +
          '    <next>' +
          '      <block type="studio_ifActorIsSprite">' +
          '        <title name="SPRITE">0</title>' +
          '        <title name="VALUE">"witch"</title>' +
          '        <statement name="DO">' +
          '          <block type="studio_changeScore">' +
          '            <title name="VALUE">1</title>' +
          '          </block>' +
          '        </statement>' +
          '        <next>' +
          '          <block type="studio_setSprite">' +
          '            <title name="SPRITE">0</title>' +
          '            <title name="VALUE">"witch"</title>' +
          '            <next>' +
          '              <block type="studio_ifActorIsSprite">' +
          '                <title name="SPRITE">0</title>' +
          '                <title name="VALUE">"witch"</title>' +
          '                <statement name="DO">' +
          '                  <block type="studio_changeScore">' +
          '                    <title name="VALUE">1</title>' +
          '                  </block>' +
          '                </statement>' +
          '              </block>' +
          '            </next>' +
          '          </block>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 3000);
      },
      customValidator: function (assert) {
        assert.equal(Studio.playerScore, 1);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
    },
    {
      description: "ifActorIsEmotion only matches specified emotion",
      xml:'<xml>' +
          '  <block type="when_run">' +
          '    <next>' +
          '      <block type="studio_ifActorHasEmotion">' +
          '        <title name="SPRITE">0</title>' +
          '        <title name="EMOTION">1</title>' +
          '        <statement name="DO">' +
          '          <block type="studio_changeScore">' +
          '            <title name="VALUE">1</title>' +
          '          </block>' +
          '        </statement>' +
          '        <next>' +
          '          <block type="studio_setSpriteEmotion">' +
          '            <title name="SPRITE">0</title>' +
          '            <title name="VALUE">1</title>' +
          '            <next>' +
          '              <block type="studio_ifActorHasEmotion">' +
          '                <title name="SPRITE">0</title>' +
          '                <title name="EMOTION">1</title>' +
          '                <statement name="DO">' +
          '                  <block type="studio_changeScore">' +
          '                    <title name="VALUE">1</title>' +
          '                  </block>' +
          '                </statement>' +
          '              </block>' +
          '            </next>' +
          '          </block>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 3000);
      },
      customValidator: function (assert) {
        assert.equal(Studio.playerScore, 1);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
    },
    {
      description: "ifActorIsXY only matches specified position",
      xml:'<xml>' +
          '  <block type="when_run">' +
          '    <next>' +
          '      <block type="studio_ifActorPosition" inline="true">' +
          '        <title name="SPRITE">0</title>' +
          '        <title name="POSITION">x</title>' +
          '        <title name="OPERATOR">GT</title>' +
          '        <value name="COMPARED_VALUE">' +
          '          <block type="math_number">' +
          '            <title name="NUM">0</title>' +
          '          </block>' +
          '        </value>' +
          '        <statement name="DO">' +
          '          <block type="studio_changeScore">' +
          '            <title name="VALUE">1</title>' +
          '          </block>' +
          '        </statement>' +
          '        <next>' +
          '          <block type="studio_setSpriteXY" inline="true">' +
          '            <value name="SPRITE">' +
          '              <block type="math_number">' +
          '                <title name="NUM">1</title>' +
          '              </block>' +
          '            </value>' +
          '            <value name="XPOS">' +
          '              <block type="math_number">' +
          '                <title name="NUM">200</title>' +
          '              </block>' +
          '            </value>' +
          '            <value name="YPOS">' +
          '              <block type="math_number">' +
          '                <title name="NUM">200</title>' +
          '              </block>' +
          '            </value>' +
          '            <next>' +
          '              <block type="studio_ifActorPosition" inline="true">' +
          '                <title name="SPRITE">0</title>' +
          '                <title name="POSITION">x</title>' +
          '                <title name="OPERATOR">GT</title>' +
          '                <value name="COMPARED_VALUE">' +
          '                  <block type="math_number">' +
          '                    <title name="NUM">0</title>' +
          '                  </block>' +
          '                </value>' +
          '                <statement name="DO">' +
          '                  <block type="studio_changeScore">' +
          '                    <title name="VALUE">1</title>' +
          '                  </block>' +
          '                </statement>' +
          '              </block>' +
          '            </next>' +
          '          </block>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 3000);
      },
      customValidator: function (assert) {
        assert.equal(Studio.playerScore, 1);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
    },
    {
      description: "ifActorIsVisibile only matches specified visibility",
      xml:'<xml>' +
          '  <block type="when_run">' +
          '    <next>' +
          '      <block type="studio_ifActorIsVisible">' +
          '        <title name="SPRITE">0</title>' +
          '        <title name="VISIBILITY">false</title>' +
          '        <statement name="DO">' +
          '          <block type="studio_changeScore">' +
          '            <title name="VALUE">1</title>' +
          '          </block>' +
          '        </statement>' +
          '        <next>' +
          '          <block type="studio_vanish">' +
          '            <title name="SPRITE">0</title>' +
          '            <next>' +
          '              <block type="studio_ifActorIsVisible">' +
          '                <title name="SPRITE">0</title>' +
          '                <title name="VISIBILITY">false</title>' +
          '                <statement name="DO">' +
          '                  <block type="studio_changeScore">' +
          '                    <title name="VALUE">1</title>' +
          '                  </block>' +
          '                </statement>' +
          '              </block>' +
          '            </next>' +
          '          </block>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 3000);
      },
      customValidator: function (assert) {
        assert.equal(Studio.playerScore, 1);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
    },
  ]
};
