var tickWrapper = require('../../util/tickWrapper');
import {TestResults} from '@cdo/apps/constants';
var Direction = require('@cdo/apps/studio/constants.js').Direction;
var blockUtils = require('@cdo/apps/block_utils');

var commonMsg = require('@cdo/locale');

module.exports = {
  app: "studio",
  skinId: "studio",
  levelFile: "levels",
  levelId: "sandbox", // This is the studio freeplay level for course 2
  tests: [
    {
      description: "Expected solution.",
      xml: '',
      runBeforeClick: function (assert) {
        // room to add tests here

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 100);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "Fireball",
      xml: '<xml>' +
          ' <block type="when_run" deletable="false">' +
          '   <next>' +
          '     <block type="studio_setSprite">' +
          '       <title name="SPRITE">0</title>' +
          '       <title name="VALUE">"witch"</title>' +
          '       <next>' +
          '         <block type="studio_moveDistance">' +
          '           <title name="SPRITE">0</title>' +
          '           <title name="DIR">4</title>' +
          '           <title name="DISTANCE">200</title>' +
          '           <next>' +
          '             <block type="studio_moveDistance">' +
          '               <title name="SPRITE">0</title>' +
          '               <title name="DIR">2</title>' +
          '               <title name="DISTANCE">100</title>' +
          '               <next>' +
          '                 <block type="studio_throw">' +
          '                   <title name="SPRITE">0</title>' +
          '                   <title name="VALUE">"red_fireball"</title>' +
          '                   <title name="DIR">8</title>' +
          '                   <next>' +
          '                     <block type="studio_throw">' +
          '                       <title name="SPRITE">0</title>' +
          '                       <title name="VALUE">"blue_fireball"</title>' +
          '                       <title name="DIR">2</title>' +
          '                       <next>' +
          '                         <block type="studio_throw">' +
          '                           <title name="SPRITE">0</title>' +
          '                           <title name="VALUE">"purple_fireball"</title>' +
          '                           <title name="DIR">1</title>' +
          '                           <next>' +
          '                             <block type="studio_throw">' +
          '                               <title name="SPRITE">0</title>' +
          '                               <title name="VALUE">random</title>' +
          '                               <title name="DIR">4</title>' +
          '                             </block>' +
          '                           </next>' +
          '                         </block>' +
          '                       </next>' +
          '                     </block>' +
          '                   </next>' +
          '                 </block>' +
          '               </next>' +
          '             </block>' +
          '           </next>' +
          '         </block>' +
          '       </next>' +
          '     </block>' +
          '   </next>' +
          ' </block>' +
          '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 1000);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "Fireball collision",
      // actor 1 throws a fireball to the right. it hits actor 2 and bounces back
      // to the left. when it hits actor 2 it disappears
      // todo - beautify
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">1</title>' +
        '            <title name="VALUE">"witch"</title>' +
        '            <next>' +
        '              <block type="studio_throw">' +
        '                <title name="SPRITE">0</title>' +
        '                <title name="VALUE">"blue_fireball"</title>' +
        '                <title name="DIR">2</title>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">1</title>' +
        '    <title name="SPRITE2">blue_fireball</title>' +
        '    <next>' +
        '      <block type="studio_makeProjectile">' +
        '        <title name="VALUE">"blue_fireball"</title>' +
        '        <title name="ACTION">"bounce"</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">0</title>' +
        '    <title name="SPRITE2">blue_fireball</title>' +
        '    <next>' +
        '      <block type="studio_makeProjectile">' +
        '        <title name="VALUE">"blue_fireball"</title>' +
        '        <title name="ACTION">"disappear"</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 5, function () {
          assert(Studio.projectiles.length === 1);
          assert(Studio.projectiles[0].dir === Direction.EAST);
          var proj = document.getElementById('studioanimation_clippath_20').nextSibling;
          assert(proj.getAttribute('xlink:href').indexOf('/media/skins/studio/blue_fireball.png') > -1,
            "We have the right image: " + proj.getAttribute('xlink:href'));
          assert(proj.getAttribute('visibility') !== 'hidden',
            "The image isn't hidden");
        });
        // our fireball should collide at tick 24, so by 25 we should be finished
        tickWrapper.runOnAppTick(Studio, 25, function () {
          assert(Studio.projectiles[0].dir === Direction.WEST);
        });
        // we should have hit actor 1 and disappeared
        tickWrapper.runOnAppTick(Studio, 50, function () {
          assert(Studio.projectiles.length === 0);
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "Fireball multiple collision",
      // actor 1 throws a fireball to the right. it hits actor 2 and bounces back
      // to the left. when it hits actor 2 it bounces back to the right, etc.
      // todo - beautify
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">1</title>' +
        '            <title name="VALUE">"witch"</title>' +
        '            <next>' +
        '              <block type="studio_throw">' +
        '                <title name="SPRITE">0</title>' +
        '                <title name="VALUE">"blue_fireball"</title>' +
        '                <title name="DIR">2</title>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">1</title>' +
        '    <title name="SPRITE2">blue_fireball</title>' +
        '    <next>' +
        '      <block type="studio_makeProjectile">' +
        '        <title name="VALUE">"blue_fireball"</title>' +
        '        <title name="ACTION">"bounce"</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">0</title>' +
        '    <title name="SPRITE2">blue_fireball</title>' +
        '    <next>' +
        '      <block type="studio_makeProjectile">' +
        '        <title name="VALUE">"blue_fireball"</title>' +
        '        <title name="ACTION">"bounce"</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 5, function () {
          assert(Studio.projectiles.length === 1);
          assert(Studio.projectiles[0].dir === Direction.EAST);
        });
        // our fireball should collide at tick 24, so by 25 we should be finished
        tickWrapper.runOnAppTick(Studio, 25, function () {
          assert(Studio.projectiles[0].dir === Direction.WEST);
        });
        // we should have hit actor 1 and started east again...
        tickWrapper.runOnAppTick(Studio, 50, function () {
          assert(Studio.projectiles[0].dir === Direction.EAST);
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "Throw hearts",
      xml: '<xml>' +
        ' <block type="when_run" deletable="false">' +
        '   <next>' +
        '     <block type="studio_setSprite">' +
        '       <title name="SPRITE">0</title>' +
        '       <title name="VALUE">"witch"</title>' +
        '       <next>' +
        '         <block type="studio_moveDistance">' +
        '           <title name="SPRITE">0</title>' +
        '           <title name="DIR">4</title>' +
        '           <title name="DISTANCE">200</title>' +
        '           <next>' +
        '             <block type="studio_moveDistance">' +
        '               <title name="SPRITE">0</title>' +
        '               <title name="DIR">2</title>' +
        '               <title name="DISTANCE">100</title>' +
        '               <next>' +
        '                 <block type="studio_throw">' +
        '                   <title name="SPRITE">0</title>' +
        '                   <title name="VALUE">"red_hearts"</title>' +
        '                   <title name="DIR">8</title>' +
        '                   <next>' +
        '                     <block type="studio_throw">' +
        '                       <title name="SPRITE">0</title>' +
        '                       <title name="VALUE">"yellow_hearts"</title>' +
        '                       <title name="DIR">2</title>' +
        '                       <next>' +
        '                         <block type="studio_throw">' +
        '                           <title name="SPRITE">0</title>' +
        '                           <title name="VALUE">"purple_hearts"</title>' +
        '                           <title name="DIR">1</title>' +
        '                           <next>' +
        '                             <block type="studio_throw">' +
        '                               <title name="SPRITE">0</title>' +
        '                               <title name="VALUE">random</title>' +
        '                               <title name="DIR">4</title>' +
        '                             </block>' +
        '                           </next>' +
        '                         </block>' +
        '                       </next>' +
        '                     </block>' +
        '                   </next>' +
        '                 </block>' +
        '               </next>' +
        '             </block>' +
        '           </next>' +
        '         </block>' +
        '       </next>' +
        '     </block>' +
        '   </next>' +
        ' </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 1000);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "heart collision",
      // a witch throws a heart to the right. when it hits the cat, we should
      // score a point
      xml: '<xml>' +
      '  <block type="when_run" deletable="false">' +
      '    <next>' +
      '      <block type="studio_setSprite">' +
      '        <title name="SPRITE">0</title>' +
      '        <title name="VALUE">"witch"</title>' +
      '        <next>' +
      '          <block type="studio_setSprite">' +
      '            <title name="SPRITE">1</title>' +
      '            <title name="VALUE">"cat"</title>' +
      '            <next>' +
      '              <block type="studio_throw">' +
      '                <title name="SPRITE">0</title>' +
      '                <title name="VALUE">"yellow_hearts"</title>' +
      '                <title name="DIR">2</title>' +
      '              </block>' +
      '            </next>' +
      '          </block>' +
      '        </next>' +
      '      </block>' +
      '    </next>' +
      '  </block>' +
      '  <block type="studio_whenSpriteCollided">' +
      '    <title name="SPRITE1">1</title>' +
      '    <title name="SPRITE2">yellow_hearts</title>' +
      '    <next>' +
      '      <block type="studio_changeScore"><title name="VALUE">1</title></block>' +
      '    </next>' +
      '  </block>' +
      '</xml>',
      runBeforeClick: function (assert) {
        // our fireball should collide at tick 24, so by 25 we should be finished
        tickWrapper.runOnAppTick(Studio, 25, function () {
          assert(Studio.playerScore === 1, "Scored a point after colliding");
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: 'projectile from hidden sprite',
      // On start set actor 1 to be a witch, then hidden, then try firing a
      // fireball
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">0</title>' +
        '            <title name="VALUE">"hidden"</title>' +
        '            <next>' +
        '              <block type="studio_throw">' +
        '                <title name="SPRITE">0</title>' +
        '                <title name="VALUE">"blue_fireball"</title>' +
        '                <title name="DIR">4</title>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 5, function () {
          assert(Studio.projectiles.length === 0, "No projectile for hidden sprite");
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'collide with hidden actor',
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">1</title>' +
        '            <title name="VALUE">"hidden"</title>' +
        '            <next>' +
        '              <block type="studio_moveDistance">' +
        '                <title name="SPRITE">0</title>' +
        '                <title name="DIR">2</title>' +
        '                <title name="DISTANCE">200</title>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">0</title>' +
        '    <title name="SPRITE2">1</title>' +
        '    <next>' +
        '      <block type="studio_changeScore">' +
        '        <title name="VALUE">1</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        assert(Studio.sprite[0].visible === false, "Actor 1 starts out hidden");
        var visibility = Studio.sprite[0].getLegacyElement().getAttribute('visibility');
        assert(visibility === 'hidden', 'Actor 1 html element is not visible');
        tickWrapper.runOnAppTick(Studio, 50, function () {
          assert(Studio.sprite[0].x === 250, "Actor 1 finished moving");
          assert(Studio.sprite[1].x === 250, "Actor 2 is in the same place");
          assert(Studio.playerScore === 0, "Didn't score any points for colliding");
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'collision with any actor',
      timeout: 12000,
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">1</title>' +
        '            <title name="VALUE">"witch"</title>' +
        '            <next>' +
        '              <block type="studio_setSprite">' +
        '                <title name="SPRITE">2</title>' +
        '                <title name="VALUE">"witch"</title>' +
        '                <next>' +
        '                  <block type="studio_moveDistance">' +
        '                    <title name="SPRITE">0</title>' +
        '                    <title name="DIR">2</title>' +
        '                    <title name="DISTANCE">200</title>' +
        '                    <next>' +
        '                      <block type="studio_moveDistance">' +
        '                        <title name="SPRITE">0</title>' +
        '                        <title name="DIR">8</title>' +
        '                        <title name="DISTANCE">200</title>' +
        '                        <next>' +
        '                          <block type="studio_moveDistance">' +
        '                            <title name="SPRITE">0</title>' +
        '                            <title name="DIR">4</title>' +
        '                            <title name="DISTANCE">200</title>' +
        '                          </block>' +
        '                        </next>' +
        '                      </block>' +
        '                    </next>' +
        '                  </block>' +
        '                </next>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">0</title>' +
        '    <title name="SPRITE2">any_actor</title>' +
        '    <next>' +
        '      <block type="studio_changeScore">' +
        '        <title name="VALUE">1</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">0</title>' +
        '    <title name="SPRITE2">2</title>' +
        '    <next>' +
        '      <block type="studio_saySprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="TEXT">hello actor 3</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 22, function () {
          assert(Studio.playerScore === 1, 'score incremented');
          assert(Studio.sayComplete === 0, 'nothing was said yet');
        });
        tickWrapper.runOnAppTick(Studio, 200, function () {
          assert(Studio.playerScore === 2, 'score incremented again');
          assert(Studio.sayComplete === 1, 'something was said');
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'collision with any actor - bidirectional',
      // two actors, both scoring points when the collide with any actor. as
      // a result, we should have two points after collision
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">1</title>' +
        '            <title name="VALUE">"witch"</title>' +
        '            <next>' +
        '              <block type="studio_moveDistance">' +
        '                <title name="SPRITE">0</title>' +
        '                <title name="DIR">2</title>' +
        '                <title name="DISTANCE">200</title>' +
        '                <next>' +
        '                  <block type="studio_moveDistance">' +
        '                    <title name="SPRITE">0</title>' +
        '                    <title name="DIR">8</title>' +
        '                    <title name="DISTANCE">200</title>' +
        '                  </block>' +
        '                </next>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">0</title>' +
        '    <title name="SPRITE2">any_actor</title>' +
        '    <next>' +
        '      <block type="studio_changeScore">' +
        '        <title name="VALUE">1</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">1</title>' +
        '    <title name="SPRITE2">any_actor</title>' +
        '    <next>' +
        '      <block type="studio_changeScore">' +
        '        <title name="VALUE">1</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 22, function () {
          assert(Studio.playerScore === 2, 'score incremented');
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'collision with any edge',
      timeout: 12000,
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">2</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_moveDistance">' +
        '            <title name="SPRITE">2</title>' +
        '            <title name="DIR">8</title>' +
        '            <title name="DISTANCE">400</title>' +
        '            <next>' +
        '              <block type="studio_moveDistance">' +
        '                <title name="SPRITE">2</title>' +
        '                <title name="DIR">2</title>' +
        '                <title name="DISTANCE">400</title>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">2</title>' +
        '    <title name="SPRITE2">right</title>' +
        '    <next>' +
        '      <block type="studio_saySprite">' +
        '        <title name="SPRITE">2</title>' +
        '        <title name="TEXT">hello right edge</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">2</title>' +
        '    <title name="SPRITE2">any_edge</title>' +
        '    <next>' +
        '      <block type="studio_changeScore">' +
        '        <title name="VALUE">1</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 22, function () {
          assert(Studio.playerScore === 1, 'score incremented');
          assert(Studio.sayComplete === 0, 'nothing was said yet');
        });
        tickWrapper.runOnAppTick(Studio, 180, function () {
          assert(Studio.playerScore === 2, 'score incremented again');
          assert(Studio.sayComplete === 1, 'something was said');
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'collision with any projectile',
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">0</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">1</title>' +
        '            <title name="VALUE">"witch"</title>' +
        '            <next>' +
        '              <block type="studio_throw">' +
        '                <title name="SPRITE">0</title>' +
        '                <title name="VALUE">"red_fireball"</title>' +
        '                <title name="DIR">2</title>' +
        '                <next>' +
        '                  <block type="studio_throw">' +
        '                    <title name="SPRITE">0</title>' +
        '                    <title name="VALUE">"yellow_hearts"</title>' +
        '                    <title name="DIR">2</title>' +
        '                  </block>' +
        '                </next>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">1</title>' +
        '    <title name="SPRITE2">any_projectile</title>' +
        '    <next>' +
        '      <block type="studio_changeScore">' +
        '        <title name="VALUE">1</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">1</title>' +
        '    <title name="SPRITE2">yellow_hearts</title>' +
        '    <next>' +
        '      <block type="studio_saySprite">' +
        '        <title name="SPRITE">1</title>' +
        '        <title name="TEXT">ive been yellow hearted</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 24, function () {
          assert(Studio.playerScore === 1, 'score incremented');
          assert(Studio.sayComplete === 0, 'nothing was said yet');
        });
        tickWrapper.runOnAppTick(Studio, 130, function () {
          assert(Studio.playerScore === 2, 'score incremented again');
          assert(Studio.sayComplete === 1, 'something was said');
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'collision with anything',
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setSprite">' +
        '        <title name="SPRITE">2</title>' +
        '        <title name="VALUE">"witch"</title>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">3</title>' +
        '            <title name="VALUE">"witch"</title>' +
        '            <next>' +
        '              <block type="studio_throw">' +
        '                <title name="SPRITE">3</title>' +
        '                <title name="VALUE">"purple_fireball"</title>' +
        '                <title name="DIR">8</title>' +
        '                <next>' +
        '                  <block type="studio_moveDistance">' +
        '                    <title name="SPRITE">2</title>' +
        '                    <title name="DIR">2</title>' +
        '                    <title name="DISTANCE">400</title>' +
        '                  </block>' +
        '                </next>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '  <block type="studio_whenSpriteCollided">' +
        '    <title name="SPRITE1">2</title>' +
        '    <title name="SPRITE2">anything</title>' +
        '    <next>' +
        '      <block type="studio_changeScore">' +
        '        <title name="VALUE">1</title>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 19, function () {
          assert(Studio.playerScore === 1, 'one point for fireball collision');
        });
        tickWrapper.runOnAppTick(Studio, 38, function () {
          assert(Studio.playerScore === 2, 'second point for actor collision');
        });
        tickWrapper.runOnAppTick(Studio, 66, function () {
          assert(Studio.playerScore === 3, 'third point for edge collision');
          Studio.onPuzzleComplete();
        });

        tickWrapper.runOnAppTick(Studio, 100, function () {
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'random background/avatar',
      xml: '<xml>' +
        blockUtils.blockWithNext('when_run', {},
          blockUtils.blockWithNext('studio_setSprite', {
            SPRITE: 0,
            VALUE: 'random'
          },
          blockUtils.blockWithNext('studio_setBackground', {
            VALUE: 'random'
          },
          '<block type="studio_setSpriteParams" inline="true"><title name="VALUE">random</title><value name="SPRITE"><block type="math_number"><title name="NUM">1</title></block></value></block>'
          )
        )
        ) + '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 5, function () {
          var sprite = Studio.sprite[0].getLegacyElement();
          var vis = sprite.getAttribute('visibility');
          assert(sprite.getAttribute('visibility') === 'visible', 'vis: ' + vis);
          assert(sprite.getAttribute('xlink:href') !== undefined);

          var background = document.getElementById('background');
          assert(background.getAttribute('xlink:href') !== undefined);

        });
        tickWrapper.runOnAppTick(Studio, 6, function () {
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'unnamed function',
      xml: '<xml>' +
        '<block type="functional_definition" inline="false" editable="false">' +
        '  <mutation>' +
        '    <arg name="x" type="Number"></arg>' +
        '    <outputtype>Number</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME"></title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_plus" inline="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_parameters_get">' +
        '          <mutation>' +
        '            <outputtype>Number</outputtype>' +
        '          </mutation>' +
        '          <title name="VAR">x</title>' +
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
      '</xml>',
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTION_NAME
      },
      customValidator: function (assert) {
        assert.equal(Studio.message, commonMsg.unnamedFunction());
        return true;
      },
    },
    {
      description: "Set and read score var",
      xml: '<xml>' +
        '  <block type="when_run" deletable="false">' +
        '    <next>' +
        '      <block type="studio_setScore" inline="false">' +
        '        <value name="VALUE">' +
        '          <block type="math_number">' +
        '            <title name="NUM">50</title>' +
        '          </block>' +
        '        </value>' +
        '        <next>' +
        '          <block type="studio_setSprite">' +
        '            <title name="SPRITE">0</title>' +
        '            <title name="VALUE">"dog"</title>' +
        '            <next>' +
        '              <block type="studio_moveDistanceParams" inline="true">' +
        '                <title name="SPRITE">0</title>' +
        '                <title name="DIR">4</title>' +
        '                <value name="DISTANCE">' +
        '                  <block type="studio_getScore"/>' +
        '                </value>' +
        '              </block>' +
        '            </next>' +
        '          </block>' +
        '        </next>' +
        '      </block>' +
        '    </next>' +
        '  </block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        tickWrapper.runOnAppTick(Studio, 50, function () {
          assert(Studio.sprite[0].y === 50, "Actor 1 moved by score amount");
          assert(Studio.playerScore === 50, "Score set to 50");
          Studio.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
