import {TestResults} from '@cdo/apps/constants';


// Test edge collisions
// Start with a sprite in the top left and a srpite in the lower right.


// https://www.pivotaltracker.com/story/show/76304652
// todo - seems like this passes even if edgeCollisions is false (default). i
// think we should either name it differently to make it clear it only toggles
// what's in the dropdown, or change the behavior so that we don't even detect
// edge collisions if false

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
  allowSpritesOutsidePlayspace: false
};

module.exports = {
  app: "studio",
  skinId: "studio",
  levelDefinition: levelDef,
  tests: [
    {
      description: "Score 4 points as sprites hit each edge",
      // On start have top left sprite go up and left.  Have bottom right go
      // left and down. All edges should be hit.  On each edge hit, score a point
      xml: '<xml>' +
          '<block type="when_run" deletable="false">' +
          '<next><block type="studio_moveDistance">' +
            '<title name="SPRITE">0</title>' +
            '<title name="DIR">1</title>' +
            '<title name="DISTANCE">100</title>' +
          '<next><block type="studio_moveDistance">' +
            '<title name="SPRITE">0</title>' +
            '<title name="DIR">8</title>' +
            '<title name="DISTANCE">100</title>' +
          '<next><block type="studio_moveDistance">' +
            '<title name="SPRITE">1</title>' +
            '<title name="DIR">2</title>' +
            '<title name="DISTANCE">100</title>' +
          '<next><block type="studio_moveDistance">' +
            '<title name="SPRITE">1</title>' +
            '<title name="DIR">4</title>' +
            '<title name="DISTANCE">100</title>' +
          '</block></next></block></next></block></next></block></next></block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">0</title>' +
            '<title name="SPRITE2">left</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">0</title>' +
            '<title name="SPRITE2">top</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">1</title>' +
            '<title name="SPRITE2">bottom</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">1</title>' +
            '<title name="SPRITE2">right</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 3000);
      },
      customValidator: function (assert) {
        assert(Studio.playerScore === 4, 'actual player score is ' + Studio.playerScore);

        // make sure sprites didn't go outside playspace
        assert(Studio.sprite[0].x === 0);
        assert(Studio.sprite[0].y === 0);
        // 300 is the max value for top/left given a 100x100 sprite
        assert(Studio.sprite[1].x === 300);
        assert(Studio.sprite[1].y === 300);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: 'Edge collide from move pixels fires multiple times',
      // Constantly repeat move left 25 pixels, then move right 25 pixels
      // each attempt to move out should cause a collide and score us a point
      xml: '<xml>' +
        '<block type="when_run" deletable="false">' +
          '<next><block type="studio_moveDistance">' +
            '<title name="SPRITE">0</title>' +
            '<title name="DIR">8</title>' +
            '<title name="DISTANCE">100</title>' +
          '</block></next>' +
        '</block>' +
        '<block type="studio_repeatForever">' +
          '<statement name="DO">' +
            '<block type="studio_moveDistance">' +
              '<title name="SPRITE">0</title>' +
              '<title name="DIR">8</title>' +
              '<title name="DISTANCE">25</title>' +
              '<next><block type="studio_moveDistance">' +
                '<title name="SPRITE">0</title>' +
                '<title name="DIR">2</title>' +
                '<title name="DISTANCE">25</title>' +
              '</block></next>' +
            '</block>' +
          '</statement>' +
        '</block>' +
        '<block type="studio_whenSpriteCollided">' +
          '<title name="SPRITE1">0</title>' +
          '<title name="SPRITE2">left</title>' +
        '<next><block type="studio_changeScore">' +
          '<title name="VALUE">1</title>' +
        '</block></next></block>' +
      '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 2000);
      },
      customValidator: function (assert) {
        // make sure we've scored multiple points
        assert(Studio.playerScore > 1, 'actual player score is ' + Studio.playerScore);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: 'Edge collide from move without pixels fires multiple times',
      // Same as previous test, but using studio_move instead of studio_moveDistance
      xml: '<xml>' +
        '<block type="when_run" deletable="false">' +
          '<next><block type="studio_moveDistance">' +
            '<title name="SPRITE">0</title>' +
            '<title name="DIR">8</title>' +
            '<title name="DISTANCE">100</title>' +
          '</block></next>' +
        '</block>' +
        '<block type="studio_repeatForever">' +
          '<statement name="DO">' +
            '<block type="studio_move">' +
              '<title name="SPRITE">0</title>' +
              '<title name="DIR">8</title>' +
              '<next><block type="studio_wait">' +
                '<title name="VALUE">500</title>' +
                '<next><block type="studio_move">' +
                  '<title name="SPRITE">0</title>' +
                  '<title name="DIR">2</title>' +
                '</block></next>' +
              '</block></next>' +
            '</block>' +
          '</statement>' +
        '</block>' +
        '<block type="studio_whenSpriteCollided">' +
          '<title name="SPRITE1">0</title>' +
          '<title name="SPRITE2">left</title>' +
        '<next><block type="studio_changeScore">' +
          '<title name="VALUE">1</title>' +
        '</block></next></block>' +
      '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 2000);
      },
      customValidator: function (assert) {
        // make sure we've scored multiple points
        assert(Studio.playerScore > 1, 'actual player score is ' + Studio.playerScore);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "Move with unspecified distance",
      // On start have top left sprite go up and left.  Have bottom right go
      // left and down. All edges should be hit.  On each edge hit, score a point
      xml: '<xml>' +
          '<block type="when_run" deletable="false">' +
          '<next><block type="controls_repeat">' +
            '<title name="TIMES">20</title>' +
            '<statement name="DO">' +
              '<block type="studio_move">' +
                '<title name="SPRITE">0</title>' +
                '<title name="DIR">1</title>' +
              '<next><block type="studio_move">' +
                '<title name="SPRITE">0</title>' +
                '<title name="DIR">8</title>' +
              '<next><block type="studio_move">' +
                '<title name="SPRITE">1</title>' +
                '<title name="DIR">2</title>' +
              '<next><block type="studio_move">' +
                '<title name="SPRITE">1</title>' +
                '<title name="DIR">4</title>' +
              '</block></next></block></next></block></next></block>' +
            '</statement>' +
          '</block></next></block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">0</title>' +
            '<title name="SPRITE2">left</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">0</title>' +
            '<title name="SPRITE2">top</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">1</title>' +
            '<title name="SPRITE2">bottom</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +

          '<block type="studio_whenSpriteCollided" deletable="false">' +
            '<title name="SPRITE1">1</title>' +
            '<title name="SPRITE2">right</title>' +
            '<next><block type="studio_changeScore">' +
              '<title name="VALUE">1</title>' +
            '</block></next>' +
          '</block>' +
        '</xml>',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Studio.onPuzzleComplete();
        }, 2000);
      },
      customValidator: function (assert) {
        // make sure we've scored all four points
        assert(Studio.playerScore === 4, 'actual player score is ' + Studio.playerScore);

        // make sure sprites didn't go outside playspace
        assert(Studio.sprite[0].x === 0);
        assert(Studio.sprite[0].y === 0);
        // 300 is the max value for top/left given a 100x100 sprite
        assert(Studio.sprite[1].x === 300);
        assert(Studio.sprite[1].y === 300);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    }
  ]
};
