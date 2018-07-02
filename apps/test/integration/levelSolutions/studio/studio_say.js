import {TestResults} from '@cdo/apps/constants';


// Test saySprite

function spriteTalking(spriteIndex) {
  var speechBubble = document.getElementById('speechBubble' + spriteIndex);
  return speechBubble.getAttribute('visibility') !== 'hidden';
}

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
  spritesHiddenToStart: true
};

module.exports = {
  app: "studio",
  skinId: "studio",
  levelDefinition: levelDef,
  tests: [
    {
      description: "saySprite with visible actor",
      // make sprite visible, have them say something
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_saySprite">' +
        '            <title name="SPRITE">0</title>' +
        '            <title name="TEXT">type here</title>' +
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
        assert(spriteTalking(0) || Studio.sayComplete === 1, "Actor is talking");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "saySprite with non-visible actor",
      // say something having never made sprite visible
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_saySprite">' +
        '        <title name="SPRITE">1</title>' +
        '        <title name="TEXT">type here</title>' +
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
        assert(spriteTalking(1) === false, "Not talking");
        assert(Studio.sayComplete === 0, "Nothing said");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "saySprite after vanishing actor",
      // say something having never made sprite visible
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">1</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_vanish">' +
        '            <title name="SPRITE">1</title>' +
        '            <next>' +
        '              <block type="studio_saySprite">' +
        '                <title name="SPRITE">1</title>' +
        '                <title name="TEXT">type here</title>' +
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
        assert(spriteTalking(1) === false, "Not talking");
        assert(Studio.sayComplete === 0, "Nothing said");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    }
  ]
};
