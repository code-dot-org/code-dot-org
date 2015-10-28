/*jshint multistr: true */

var msg = require('./locale');
var utils = require('../utils');
var blockUtils = require('../block_utils');
var constants = require('./constants');
var Direction = constants.Direction;
var Emotions = constants.Emotions;
var tb = blockUtils.createToolbox;
var blockOfType = blockUtils.blockOfType;
var createCategory = blockUtils.createCategory;

/**
 * Constructs a required block definition to match "Say [sprite] [text]" blocks
 * @param options (all optional):
 *          sprite (string): zero-indexed string ID of sprite, e.g., "1"
 *          notDefaultText (boolean): require changing the text from the default
 *          requiredText (string): text must change from default. we show
 *            requiredText in feedback blocks
 * @returns test definition suitable for feedback.js::getMissingRequiredBlocks
 *          required block processing
 */
function saySpriteRequiredBlock(options) {
  var titles = {};
  if (options.sprite) {
    titles.SPRITE = options.sprite;
  }
  if (options.requiredText) {
    titles.TEXT = options.requiredText;
  }
  if (options.notDefaultText) {
    titles.TEXT = msg.helloWorld();
  }

  return [
    {
      test: function (block) {
        if (block.type !== 'studio_saySprite') {
          return false;
        }
        if (options.sprite && block.getTitleValue("SPRITE") !== options.sprite) {
          return false;
        }
        if ((options.notDefaultText || options.requiredText) && block.getTitleValue("TEXT") === msg.defaultSayText()) {
          return false;
        }

        return true;
      },
      type: 'studio_saySprite',
      titles: titles
    }
  ];
}

/**
 * Constructs a required block definition to match "move [sprite] [dir]" blocks
 * @param {string} [options.sprite] zero-indexed string ID of sprite, e.g., "1"
 * @param {string} [options.dir] string of Direction constant. We show
 *        the direction in feedback blocks
 * @returns {Array} test definition suitable for getMissingRequiredBlocks
 *          required block processing
 * @see FeedbackUtils#getMissingRequiredBlocks
 */
function moveRequiredBlock(options) {
  var titles = {};
  if (options.sprite) {
    titles.SPRITE = options.sprite;
  }
  if (options.dir) {
    titles.DIR = options.dir;
  }

  return [
    {
      test: function (block) {
        if (block.type !== 'studio_move') {
          return false;
        }
        if (options.sprite && block.getTitleValue("SPRITE") !== options.sprite) {
          return false;
        }
        if (options.dir && block.getTitleValue("DIR") !== options.dir) {
          return false;
        }

        return true;
      },
      type: 'studio_move',
      titles: titles
    }
  ];
}

function moveNorthRequiredBlock() {
  return moveRequiredBlock({ dir: '1' });
}

function moveSouthRequiredBlock() {
  return moveRequiredBlock({ dir: '4' });
}

function moveEastRequiredBlock() {
  return moveRequiredBlock({ dir: '2' });
}

function moveWestRequiredBlock() {
  return moveRequiredBlock({ dir: '8' });
}

/**
 * Hoc2015 blockly helpers. We base hoc2015 blockly levels off of hoc2015 droplet
 * levels, marking them as editCode=false and overriding the startBlocks,
 * requiredBlocks and toolboxes as appropriate for the blockly progression
 */

var hocMoveNSEW = '<block type="studio_move"><title name="DIR">1</title></block> \
  <block type="studio_move"><title name="DIR">4</title></block> \
  <block type="studio_move"><title name="DIR">8</title></block> \
  <block type="studio_move"><title name="DIR">2</title></block>';

var hocMoveNS = '<block type="studio_move"><title name="DIR">1</title></block> \
  <block type="studio_move"><title name="DIR">4</title></block>';

var whenRunMoveEast = '<block type="when_run"><next> \
  <block type="studio_move"><title name="DIR">2</title></block></next> \
  </block>';

var whenRunMoveSouth = '<block type="when_run"><next> \
  <block type="studio_move"><title name="DIR">4</title></block></next> \
  </block>';

var whenUpDown = '<block type="studio_whenUp" deletable="false" x="20" y="20"></block> \
  <block type="studio_whenDown" deletable="false" x="20" y="150"></block>';

var whenUpDownLeftRight = '<block type="studio_whenUp" deletable="false" x="20" y="20"></block> \
  <block type="studio_whenDown" deletable="false" x="20" y="150"></block> \
  <block type="studio_whenLeft" deletable="false" x="20" y="280"></block> \
  <block type="studio_whenRight" deletable="false" x="20" y="410"></block>';

/**
 * K1 helpers. We base k1 levels off of existing non-k1 levels, marking them as isK1 and
 * overriding the requiredBlocks and toolboxes as appropriate for the k1 progression
 */

var moveDistanceNSEW = blockOfType('studio_moveNorthDistance') +
  blockOfType('studio_moveEastDistance') +
  blockOfType('studio_moveSouthDistance') +
  blockOfType('studio_moveWestDistance');

var moveNSEW = blockOfType('studio_moveNorth') +
  blockOfType('studio_moveEast') +
  blockOfType('studio_moveSouth') +
  blockOfType('studio_moveWest');

function whenMoveBlocks(yOffset) {
  return '<block type="studio_whenLeft" deletable="false" x="20" y="' + (20 + yOffset).toString() + '"> \
   <next><block type="studio_moveWest"></block> \
   </next></block> \
 <block type="studio_whenRight" deletable="false" x="20" y="'+ (150 + yOffset).toString() +'"> \
   <next><block type="studio_moveEast"></block> \
   </next></block> \
 <block type="studio_whenUp" deletable="false" x="20" y="' + (280 + yOffset).toString() + '"> \
   <next><block type="studio_moveNorth"></block> \
   </next></block> \
 <block type="studio_whenDown" deletable="false" x="20" y="' + (410 + yOffset).toString() + '"> \
   <next><block type="studio_moveSouth"></block> \
   </next></block>';
}

function foreverUpAndDownBlocks(yPosition) {
  return '<block type="studio_repeatForever" deletable="false" x="20" y="' + yPosition + '"> \
      <statement name="DO"><block type="studio_moveDistance"> \
        <title name="SPRITE">1</title> \
        <title name="DISTANCE">400</title> \
        <next><block type="studio_moveDistance"> \
          <title name="SPRITE">1</title> \
          <title name="DISTANCE">400</title> \
          <title name="DIR">4</title></block> \
        </next></block> \
      </statement></block>';
}

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

// Base config for levels created via levelbuilder
levels.custom = {
  'ideal': Infinity,
  'requiredBlocks': [],
  'scale': {
    'snapRadius': 2
  },
  'startBlocks': ''
};

// Can you make this dog say "hello world"
levels.dog_hello = {
  'ideal': 2,
  'requiredBlocks': [
    saySpriteRequiredBlock({
      notDefaultText: true
    }),
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'goal': {
    successCondition: function () {
      return (Studio.sayComplete > 0);
    }
  },
  'timeoutFailureTick': 100,
  'toolbox':
    tb(blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_1 = utils.extend(levels.dog_hello,  {
  'isK1': true,
  'toolbox': tb(blockOfType('studio_saySprite'))
});
levels.c2_1 = utils.extend(levels.dog_hello);
levels.c3_story_1 = utils.extend(levels.dog_hello);
levels.playlab_1 = utils.extend(levels.dog_hello, {
  background: 'winter',
  timeoutFailureTick: null,
  timeoutAfterWhenRun: true,
  firstSpriteIndex: 2, // penguin
  goal: {
    successCondition: function () {
      return Studio.allWhenRunBlocksComplete() && Studio.sayComplete > 0;
    }
  },
  // difference is we say hello instead of hello world
  requiredBlocks: [
    saySpriteRequiredBlock({
      requiredText: msg.hello()
    }),
  ]
});

// Can you make the dog say something and then have the cat say something afterwards?
levels.dog_and_cat_hello =  {
  'ideal': 3,
  'requiredBlocks': [
    // make sure each sprite says something
    saySpriteRequiredBlock({
      sprite: "0",
      notDefaultText: true
    }),
    saySpriteRequiredBlock({
      sprite: "1",
      notDefaultText: true
    })
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'goal': {
    successCondition: function () {
      return (Studio.sayComplete > 1);
    }
  },
  'timeoutFailureTick': 200,
  'toolbox':
    tb(blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_2 = utils.extend(levels.dog_and_cat_hello, {
  'isK1': true,
  'toolbox': tb(blockOfType('studio_saySprite'))
});
levels.c2_2 = utils.extend(levels.dog_and_cat_hello, {});
levels.c3_story_2 = utils.extend(levels.dog_and_cat_hello, {});
levels.playlab_2 = utils.extend(levels.dog_and_cat_hello, {
  background: 'desert',
  firstSpriteIndex: 20, // cave boy
  timeoutFailureTick: null,
  timeoutAfterWhenRun: true,
  defaultEmotion: Emotions.HAPPY,
  goal: {
    successCondition: function () {
      return Studio.allWhenRunBlocksComplete() && Studio.sayComplete > 1;
    }
  },
  requiredBlocks: [
    // make sure each sprite says something
    saySpriteRequiredBlock({
      sprite: "0",
      requiredText: msg.hello()
    }),
    saySpriteRequiredBlock({
      sprite: "1",
      requiredText: msg.hello()
    })
  ],
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
});


// extended by: k1_3
// Can you write a program to make this dog move to the cat?
levels.dog_move_cat =  {
  'ideal': 2,
  'requiredBlocks': [
    [{'test': 'moveDistance', 'type': 'studio_moveDistance', 'titles': {'DIR': '2'}}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0, 16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  goal: {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1);
    }
  },
  'timeoutFailureTick': 100,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_3 = utils.extend(levels.dog_move_cat,  {
  'isK1': true,
  'requiredBlocks': [
    [{
      test: function(block) {
        return block.type == 'studio_moveEastDistance';
      },
      type: 'studio_moveEastDistance'}]
  ],
  'toolbox': tb(moveDistanceNSEW + blockOfType('studio_saySprite')),
});
levels.c2_3 = utils.extend(levels.dog_move_cat, {});
levels.c3_story_3 = utils.extend(levels.dog_move_cat, {});

levels.playlab_3 = {
  ideal: 2,
  requiredBlocks: [
    [{
      test: 'moveDistance',
      type: 'studio_moveDistance',
      titles: { DIR: '2', DISTANCE: '200'}
    }]
  ],
  timeoutFailureTick: null,
  timeoutAfterWhenRun: true,
  scale: {
    snapRadius: 2
  },
  background: 'tennis',
  firstSpriteIndex: 26, // tennis girl
  toolbox:
    tb(
      '<block type="studio_moveDistance"><title name="DIR">1</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">2</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">4</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">8</title><title name="DISTANCE">200</title></block>'
       ),
  startBlocks: '<block type="when_run" deletable="false" x="20" y="20"></block>',
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]
};


// Can you write a program that makes the dog move to the cat, and have the cat
// say "hello" when the dog reaches him?
levels.dog_move_cat_hello =  {
  'ideal': 4,
  'requiredBlocks': [
    [{'test': 'moveDistance', 'type': 'studio_moveDistance', 'titles': {'DIR': '2', 'DISTANCE': '100'}}],
    saySpriteRequiredBlock({
      sprite: "1",
      requiredText: msg.hello()
    })
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'goal': {
    successCondition: function () {
      return ((Studio.sayComplete > 0) && Studio.sprite[0].isCollidingWith(1));
    }
  },
  'timeoutFailureTick': 200,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="120"></block>'
};
levels.k1_4 = utils.extend(levels.dog_move_cat_hello,  {
  'isK1': true,
  'requiredBlocks': [
    [{
      test: function(block) {
        return block.type == 'studio_moveEastDistance';
      },
      type: 'studio_moveEastDistance',
    }],
    [{
      test: function(block) {
        // Make sure they have the right block, and have changed the default
        // text
        return block.type == 'studio_saySprite' &&
          block.getTitleValue("SPRITE") === '1' &&
          block.getTitleValue("TEXT") !== msg.defaultSayText();
      },
      type: 'studio_saySprite',
      titles: {'TEXT': msg.hello(), 'SPRITE': '1'}
    }]
  ],
  'toolbox': tb(moveDistanceNSEW + blockOfType('studio_saySprite')),
  'startBlocks':
    '<block type="when_run" deletable="false" x="20" y="20"></block> \
     <block type="studio_whenSpriteCollided" deletable="false" x="20" y="140"></block>'
});
levels.c2_4 = utils.extend(levels.dog_move_cat_hello, {});
levels.c3_story_4 = utils.extend(levels.dog_move_cat_hello, {});

levels.playlab_4 = {
  ideal: 4,
  scale: {
    snapRadius: 2
  },
  background: 'tennis',
  avatarList: ['tennisboy', 'tennisgirl'],
  defaultEmotion: Emotions.SAD,
  requiredBlocks: [
    [{
      test: 'moveDistance',
      type: 'studio_moveDistance',
      titles: { DIR: '4', DISTANCE: '200'}
    }],
    [{
      test: 'playSound',
      type: 'studio_playSound',
      titles: { SOUND: 'goal1'}
    }]
  ],
  // timeout when we've hit 100 OR we had only when run commands and finished them
  timeoutFailureTick: 100,
  timeoutAfterWhenRun: true,
  goal: {
    successCondition: function () {
      return Studio.playSoundCount > 0 && Studio.sprite[0].isCollidingWith(1);
    }
  },
  toolbox:
    tb(
      '<block type="studio_moveDistance"><title name="DIR">1</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">2</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">4</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">8</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_playSound"><title name="SOUND">goal1</title></block>'
       ),
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="120"></block>',
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
};

// Can you write a program to make the octopus say "hello" when it is clicked?
levels.click_hello =  {
  'ideal': 3,
  'requiredBlocks': [
    saySpriteRequiredBlock({
      requiredText: msg.hello()
    })
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 4,
  'goal': {
    successCondition: function () {
      if (!this.successState.seenCmd) {
        this.successState.seenCmd = Studio.isCmdCurrentInQueue('saySprite', 'whenSpriteClicked-0');
      }
      return (Studio.sayComplete > 0 && this.successState.seenCmd);
    }
  },
  'timeoutFailureTick': 300,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="studio_whenSpriteClicked" deletable="false" x="20" y="120"></block>'
};
levels.c2_5 = utils.extend(levels.click_hello, {});
levels.c3_game_1 = utils.extend(levels.click_hello, {});
levels.playlab_5 = utils.extend(levels.click_hello, {
  background: 'space',
  firstSpriteIndex: 23, // spacebot
  timeoutAfterWhenRun: true,
  defaultEmotion: Emotions.HAPPY,
  toolbox: tb(blockOfType('studio_saySprite')),
  startBlocks:
   '<block type="studio_whenSpriteClicked" deletable="false" x="20" y="20"></block>'
});

levels.octopus_happy =  {
  'ideal': 2,
  'requiredBlocks': [
    [{'test': 'setSpriteEmotion', 'type': 'studio_setSpriteEmotion'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 4,
  'goal': {
    successCondition: function () {
      return (Studio.sprite[0].emotion === Emotions.HAPPY) &&
             (Studio.tickCount >= 50);
    }
  },
  'timeoutFailureTick': 100,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_setSpriteEmotion')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_5 = utils.extend(levels.octopus_happy,  {
  'isK1': true,
  'toolbox': tb(moveDistanceNSEW + blockOfType('studio_setSpriteEmotion'))
});
levels.c3_story_5 = utils.extend(levels.octopus_happy, {});

// Create your own story. When you're done, click Finish to let friends try your
// story on their phones.
levels.c3_story_6 = {
  'ideal': Infinity,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'minWorkspaceHeight': 1400,
  'edgeCollisions': true,
  'projectileCollisions': true,
  'allowSpritesOutsidePlayspace': false,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb(blockOfType('studio_setSprite') +
       blockOfType('studio_setBackground') +
       blockOfType('studio_whenSpriteCollided') +
       blockOfType('studio_repeatForever') +
       blockOfType('studio_showTitleScreen') +
       blockOfType('studio_move') +
       blockOfType('studio_moveDistance') +
       blockOfType('studio_stop') +
       blockOfType('studio_wait') +
       blockOfType('studio_playSound') +
       blockOfType('studio_changeScore') +
       blockOfType('studio_saySprite') +
       blockOfType('studio_setSpritePosition') +
       blockOfType('studio_setSpriteSpeed') +
       blockOfType('studio_setSpriteEmotion')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

// Can you write a program to make this penguin move around using the up / down /
// left /right keys to hit all of the targets?
levels.move_penguin =  {
  'ideal': 8,
  'requiredBlocks': [
    [{'test': 'move', 'type': 'studio_move'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'toolbox':
    tb(blockOfType('studio_move') +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"></block> \
    <block type="studio_whenRight" deletable="false" x="180" y="20"></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="120"></block> \
    <block type="studio_whenDown" deletable="false" x="180" y="120"></block>'
};
levels.c2_6 = utils.extend(levels.move_penguin, {});
levels.c3_game_2 = utils.extend(levels.move_penguin, {});
levels.playlab_6 = utils.extend(levels.move_penguin, {
  background: 'cave',
  firstSpriteIndex: 5, // witch
  goalOverride: {
    goal: 'red_fireball',
    success: 'blue_fireball',
    imageWidth: 800
  },
  defaultEmotion: Emotions.ANGRY,
  toolbox:
    tb(
      blockOfType('studio_move', {DIR: 8}) +
      blockOfType('studio_move', {DIR: 2}) +
      blockOfType('studio_move', {DIR: 1}) +
      blockOfType('studio_move', {DIR: 4})
    ),
  map: [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
});

// The "repeat forever" block allows you to run code continuously. Can you
// attach blocks to move this dinosaur up and down repeatedly?
levels.dino_up_and_down =  {
  'ideal': 11,
  'requiredBlocks': [
    [{'test': 'moveDistance',
      'type': 'studio_moveDistance',
      'titles': {'SPRITE': '1', 'DISTANCE': '400'}}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'protagonistSpriteIndex': 1,
  'timeoutFailureTick': 150,
  'minWorkspaceHeight': 800,
  'toolbox':
    tb('<block type="studio_moveDistance"> \
         <title name="DISTANCE">400</title> \
         <title name="SPRITE">1</title></block>' +
       '<block type="studio_saySprite"> \
         <title name="SPRITE">1</title></block>'),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"> \
      <next><block type="studio_move"> \
              <title name="DIR">8</title></block> \
      </next></block> \
    <block type="studio_whenRight" deletable="false" x="20" y="150"> \
      <next><block type="studio_move"> \
              <title name="DIR">2</title></block> \
      </next></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="280"> \
      <next><block type="studio_move"> \
              <title name="DIR">1</title></block> \
      </next></block> \
    <block type="studio_whenDown" deletable="false" x="20" y="410"> \
      <next><block type="studio_move"> \
              <title name="DIR">4</title></block> \
      </next></block> \
    <block type="studio_repeatForever" deletable="false" x="20" y="540"></block>'
};
levels.c2_7 = utils.extend(levels.dino_up_and_down, {});
levels.c3_game_3 = utils.extend(levels.dino_up_and_down, {});

levels.playlab_7 = {
  ideal: 3,
  background: 'rainbow',
  firstSpriteIndex: 10, // wizard
  scale: {
    snapRadius: 2
  },
  softButtons: [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  defaultEmotion: Emotions.HAPPY,
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  goal: {
    successCondition: function () {
      // successful after a given period of time as long as we've used all
      // required blocks. this number has us go back and forth twice, and end
      // facing forward
      return Studio.tickCount === 252;
    },
  },
  timeoutFailureTick: 253,
  minWorkspaceHeight: 800,
  toolbox: tb(
    '<block type="studio_moveDistance"><title name="DIR">1</title><title name="DISTANCE">400</title></block>' +
    '<block type="studio_moveDistance"><title name="DIR">2</title><title name="DISTANCE">400</title></block>' +
    '<block type="studio_moveDistance"><title name="DIR">4</title><title name="DISTANCE">400</title></block>' +
    '<block type="studio_moveDistance"><title name="DIR">8</title><title name="DISTANCE">400</title></block>'
  ),
  startBlocks: '<block type="studio_repeatForever" deletable="false" x="20" y="20"></block>',
  requiredBlocks: [
    [{
      test: function (b) {
        return b.type === 'studio_moveDistance' && b.getTitleValue('DIR') === '2';
      },
      type: 'studio_moveDistance',
      titles: {DIR: 2, DISTANCE: '400'}
    }],
    [{
      test: function (b) {
        return b.type === 'studio_moveDistance' && b.getTitleValue('DIR') === '8';
      },
      type: 'studio_moveDistance',
      titles: {DIR: 8, DISTANCE: '400'}
    }]
  ],
};

// Can you have the penguin say "Ouch!" and play a "hit" sound if he runs into
// the dinosaur, and then move him with the arrows to make that happen?
levels.penguin_ouch =  {
  'ideal': 14,
  'requiredBlocks': [
    saySpriteRequiredBlock({
      sprite: "0",
      requiredText: msg.ouchExclamation()
    }),
    [{'test': 'playSound', 'type': 'studio_playSound'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'minWorkspaceHeight': 900,
  'goal': {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1);
    }
  },
  'timeoutFailureTick': 300,
  'toolbox':
    tb('<block type="studio_moveDistance"> \
         <title name="DISTANCE">400</title> \
         <title name="SPRITE">1</title></block>' +
       blockOfType('studio_saySprite') +
       blockOfType('studio_playSound')),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"> \
      <next><block type="studio_move"> \
              <title name="DIR">8</title></block> \
      </next></block> \
    <block type="studio_whenRight" deletable="false" x="20" y="150"> \
      <next><block type="studio_move"> \
              <title name="DIR">2</title></block> \
      </next></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="280"> \
      <next><block type="studio_move"> \
              <title name="DIR">1</title></block> \
      </next></block> \
    <block type="studio_whenDown" deletable="false" x="20" y="410"> \
      <next><block type="studio_move"> \
              <title name="DIR">4</title></block> \
      </next></block> \
    <block type="studio_repeatForever" deletable="false" x="20" y="540"> \
      <statement name="DO"><block type="studio_moveDistance"> \
              <title name="SPRITE">1</title> \
              <title name="DISTANCE">400</title> \
        <next><block type="studio_moveDistance"> \
                <title name="SPRITE">1</title> \
                <title name="DISTANCE">400</title> \
                <title name="DIR">4</title></block> \
        </next></block> \
    </statement></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="730"></block>'
};
levels.c2_8 = utils.extend(levels.penguin_ouch, {});
levels.c3_game_4 = utils.extend(levels.penguin_ouch, {});

// Can you add a block to score a point when the penguin runs into the octopus,
// and then move him with the arrows until you score?
levels.penguin_touch_octopus = {
  'ideal': 16,
  'requiredBlocks': [
    [{'test': 'changeScore', 'type': 'studio_changeScore'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0,16, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'minWorkspaceHeight': 1050,
  'goal': {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(2);
    }
  },
  'timeoutFailureTick': 600,
  'toolbox':
    tb('<block type="studio_moveDistance"> \
         <title name="DISTANCE">400</title> \
         <title name="SPRITE">1</title></block>' +
       blockOfType('studio_saySprite') +
       blockOfType('studio_playSound') +
       blockOfType('studio_changeScore')),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"> \
      <next><block type="studio_move"> \
              <title name="DIR">8</title></block> \
      </next></block> \
    <block type="studio_whenRight" deletable="false" x="20" y="150"> \
      <next><block type="studio_move"> \
              <title name="DIR">2</title></block> \
      </next></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="280"> \
      <next><block type="studio_move"> \
              <title name="DIR">1</title></block> \
      </next></block> \
    <block type="studio_whenDown" deletable="false" x="20" y="410"> \
      <next><block type="studio_move"> \
              <title name="DIR">4</title></block> \
      </next></block> \
    <block type="studio_repeatForever" deletable="false" x="20" y="540"> \
      <statement name="DO"><block type="studio_moveDistance"> \
              <title name="SPRITE">1</title> \
              <title name="DISTANCE">400</title> \
        <next><block type="studio_moveDistance"> \
                <title name="SPRITE">1</title> \
                <title name="DISTANCE">400</title> \
                <title name="DIR">4</title></block> \
        </next></block> \
    </statement></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="730"> \
      <next><block type="studio_playSound"> \
      <next><block type="studio_saySprite"> \
              <title name="TEXT">Ouch!</title></block> \
      </next></block> \
      </next></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="860"> \
     <title name="SPRITE2">2</title></block>'
};
levels.c2_9 = utils.extend(levels.penguin_touch_octopus, {});
levels.c3_game_5 = utils.extend(levels.penguin_touch_octopus, {});

levels.playlab_8 = {
  background: 'rainbow',
  ideal: 16,
  requiredBlocks: [
    [{test: 'changeScore', type: 'studio_changeScore'}],
    [{test: 'playSound', type: 'studio_playSound', titles: {SOUND: 'winpoint'}}]
  ],
  scale: {
    snapRadius: 2
  },
  softButtons: [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  avatarList: ['unicorn', 'wizard'],
  defaultEmotion: Emotions.HAPPY,
  goal: {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1) && Studio.playerScore === 1;
    },
    failureCondition: function () {
      return Studio.sprite[0].isCollidingWith(1) && Studio.playerScore !== 1;
    }
  },
  timeoutFailureTick: 600,
  toolbox: tb(
    blockOfType('studio_changeScore') +
    '<block type="studio_playSound"><title name="SOUND">winpoint</title></block>'
  ),
  startBlocks:
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="150">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', { SPRITE: 1, DIR: 2, DISTANCE: 400},
          blockOfType('studio_moveDistance', { SPRITE: 1, DIR: 8, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="300"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 8}) +
    '</next></block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="400"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 2}) +
    '</next></block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="500"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 1}) +
    '</next></block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="600"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 4}) +
    '</next></block>'

};

// Can you add blocks to change the background and the speed of the penguin, and
// then move him with the arrows until you score?
levels.change_background_and_speed =  {
  'ideal': 19,
  'requiredBlocks': [
    [{'test': 'setBackground',
      'type': 'studio_setBackground',
      'titles': {'VALUE': '"night"'}}],
    [{'test': 'setSpriteSpeed',
      'type': 'studio_setSpriteSpeed',
      'titles': {'VALUE': 'Studio.SpriteSpeed.FAST'}}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0,16, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'minWorkspaceHeight': 1250,
  'goal': {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(2);
    }
  },
  'timeoutFailureTick': 600,
  'toolbox':
    tb(
      blockOfType('studio_setBackground', {VALUE: '"night"'}) +
      blockOfType('studio_moveDistance', {DISTANCE: 400, SPRITE: 1}) +
      blockOfType('studio_saySprite') +
      blockOfType('studio_playSound') +
      blockOfType('studio_changeScore') +
      blockOfType('studio_setSpriteSpeed', {VALUE: 'Studio.SpriteSpeed.FAST'})
    ),
  'startBlocks':
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="200">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 8}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="330">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 2}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="460">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 1}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="590">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 4}) +
      '</next>' +
    '</block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="720">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', {SPRITE: 1, DIR: 1, DISTANCE: 400},
          blockOfType('studio_moveDistance', {SPRITE: 1, DIR: 4, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="880">' +
      '<title name="SPRITE2">1</title>' +
      '<next>' +
        blockUtils.blockWithNext('studio_playSound', {},
          blockOfType('studio_saySprite', {TEXT: msg.ouchExclamation()})
        ) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="1040">' +
      '<title name="SPRITE2">2</title>' +
      '<next>' +
        blockOfType('studio_changeScore') +
      '</next>' +
    '</block>'
};
levels.c2_10 = utils.extend(levels.change_background_and_speed, {});
levels.c3_game_6 = utils.extend(levels.change_background_and_speed, {});

levels.playlab_9 = {
  background: 'black',
  requiredBlocks: [
    [{test: 'setBackground',
      type: 'studio_setBackground',
      titles: {VALUE: '"space"'}}],
    [{test: 'setSpriteSpeed',
      type: 'studio_setSpriteSpeed',
      titles: {VALUE: 'Studio.SpriteSpeed.FAST'}}]
  ],
  timeoutFailureTick: 400,
  scale: {
    snapRadius: 2
  },
  defaultEmotion: Emotions.ANGRY,
  softButtons: [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  avatarList: ['spacebot', 'alien'],
  goal: {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1);
    }
  },
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0, 0, 0,16, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  toolbox:
    tb(
      blockOfType('studio_setSpriteSpeed', {VALUE: 'Studio.SpriteSpeed.FAST'}) +
      blockOfType('studio_setBackground', {VALUE: '"space"'}) +
      blockOfType('studio_moveDistance', {DISTANCE: 400, SPRITE: 1}) +
      blockOfType('studio_saySprite') +
      blockOfType('studio_playSound', {SOUND: 'winpoint2'}) +
      blockOfType('studio_changeScore')
    ),
  minWorkspaceHeight: 1250,
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="150">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', {SPRITE: 1, DIR: 1, DISTANCE: 400},
          blockOfType('studio_moveDistance', {SPRITE: 1, DIR: 4, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="290">' +
      '<title name="SPRITE2">0</title>' +
      '<title name="SPRITE2">1</title>' +
      '<next>' +
        blockUtils.blockWithNext('studio_playSound', {SOUND: 'winpoint2'},
          blockOfType('studio_saySprite', {TEXT: msg.alienInvasion()})
        ) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="410">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 8}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="510">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 2}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="610">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 1}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="710">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 4}) +
      '</next>' +
    '</block>'
};

// Create your own game. When you're done, click Finish to let friends try your story on their phones.
levels.sandbox =  {
  'ideal': Infinity,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'minWorkspaceHeight': 1400,
  'edgeCollisions': true,
  'projectileCollisions': true,
  'allowSpritesOutsidePlayspace': false,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb(blockOfType('studio_setSprite') +
       blockOfType('studio_setBackground') +
       blockOfType('studio_whenArrow') +
       blockOfType('studio_whenSpriteClicked') +
       blockOfType('studio_whenSpriteCollided') +
       blockOfType('studio_repeatForever') +
       blockOfType('studio_showTitleScreen') +
       blockOfType('studio_move') +
       blockOfType('studio_moveDistance') +
       blockOfType('studio_stop') +
       blockOfType('studio_wait') +
       blockOfType('studio_playSound') +
       blockOfType('studio_changeScore') +
       blockOfType('studio_saySprite') +
       blockOfType('studio_setSpritePosition') +
       blockOfType('studio_throw') +
       blockOfType('studio_makeProjectile') +
       blockOfType('studio_setSpriteSpeed') +
       blockOfType('studio_setSpriteEmotion') +
       blockOfType('studio_vanish')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.c2_11 = utils.extend(levels.sandbox, {});
levels.c3_game_7 = utils.extend(levels.sandbox, {});
levels.playlab_10 = utils.extend(levels.sandbox, {});

// Create your own story! Move around the cat and dog, and make them say things.
levels.k1_6 = {
  'ideal': Infinity,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'minWorkspaceHeight': 1500,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [16, 0,16, 0,16, 0,16, 0],
    [ 0,16, 0,16, 0,16, 0, 0],
    [16, 0,16, 0,16, 0,16, 0],
    [ 0,16, 0,16, 0,16, 0, 0],
    [16, 0,16, 0,16, 0,16, 0],
    [ 0,16, 0,16, 0,16, 0, 0],
    [16,16,16,16,16,16,16, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'isK1': true,
  softButtons: [],
  'toolbox':
    tb(
      blockOfType('studio_setSprite') +
      blockOfType('studio_saySprite') +
      moveDistanceNSEW +
      blockOfType('studio_whenSpriteCollided') +
      blockOfType('studio_setBackground') +
      blockOfType('studio_setSpriteSpeed') +
      blockOfType('studio_setSpriteEmotion') +
      blockOfType('studio_playSound') +
      blockOfType('studio_vanish')),
  'startBlocks':
    '<block type="when_run" deletable="false" x="20" y="20">\
      <next><block type="studio_setSprite"> \
        <title name="SPRITE">0</title></block> \
      </next></block>'
};

levels.k1_block_test = utils.extend(levels['99'], {
  'toolbox':
    tb(
      blockOfType('studio_setSprite') +
      blockOfType('studio_moveNorth') +
      blockOfType('studio_moveSouth') +
      blockOfType('studio_moveEast') +
      blockOfType('studio_moveWest') +
      blockOfType('studio_moveNorth_length') +
      blockOfType('studio_moveSouth_length') +
      blockOfType('studio_moveEast_length') +
      blockOfType('studio_moveWest_length')
    ),
  'isK1': true
});

// you can get here via http://learn.code.org/2014/11, which is semi-hidden
levels.full_sandbox =  {
  'scrollbars' : true,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'minWorkspaceHeight': 1400,
  'edgeCollisions': true,
  'projectileCollisions': true,
  'allowSpritesOutsidePlayspace': true,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb(createCategory(msg.catActions(),
                        blockOfType('studio_setSprite') +
                        blockOfType('studio_setBackground') +
                      '<block type="studio_showTitleScreenParams"> \
                        <value name="TITLE"><block type="text"></block> \
                        </value> \
                        <value name="TEXT"><block type="text"></block> \
                        </value></block>' +
                        blockOfType('studio_move') +
                    '<block type="studio_moveDistanceParams" inline="true"> \
                      <value name="DISTANCE"><block type="math_number"> \
                              <title name="NUM">25</title></block> \
                      </value></block>' +
                        blockOfType('studio_stop') +
                      '<block type="studio_waitParams" inline="true"> \
                        <value name="VALUE"><block type="math_number"> \
                                <title name="NUM">1</title></block> \
                        </value></block>' +
                        blockOfType('studio_playSound') +
                      '<block type="studio_setScoreText" inline="true"> \
                        <value name="TEXT"><block type="text"></block> \
                        </value></block>' +
                      '<block type="studio_saySpriteParams" inline="true"> \
                        <value name="TEXT"><block type="text"></block> \
                        </value></block>' +
                        blockOfType('studio_setSpritePosition') +
                        blockOfType('studio_addCharacter') +
                        blockOfType('studio_throw') +
                        blockOfType('studio_makeProjectile') +
                        blockOfType('studio_setSpriteSpeed') +
                        blockOfType('studio_setSpriteEmotion') +
                        blockOfType('studio_vanish') +
                        blockOfType('studio_setSpriteSize') +
                        blockOfType('studio_showCoordinates')) +
       createCategory(msg.catEvents(),
                        blockOfType('studio_whenArrow') +
                        blockOfType('studio_whenSpriteClicked') +
                        blockOfType('studio_whenSpriteCollided')) +
       createCategory(msg.catControl(),
                        blockOfType('studio_repeatForever') +
                       '<block type="controls_repeat_ext"> \
                          <value name="TIMES"> \
                            <block type="math_number"> \
                              <title name="NUM">10</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('controls_whileUntil') +
                       '<block type="controls_for"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">10</title> \
                            </block> \
                          </value> \
                          <value name="BY"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('controls_flow_statements')) +
       createCategory(msg.catLogic(),
                        blockOfType('controls_if') +
                        blockOfType('logic_compare') +
                        blockOfType('logic_operation') +
                        blockOfType('logic_negate') +
                        blockOfType('logic_boolean')) +
       createCategory(msg.catMath(),
                        blockOfType('math_number') +
                       '<block type="math_change"> \
                          <value name="DELTA"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                       '<block type="math_random_int"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">100</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('math_arithmetic')) +
       createCategory(msg.catText(),
                        blockOfType('text') +
                        blockOfType('text_join') +
                       '<block type="text_append"> \
                          <value name="TEXT"> \
                            <block type="text"></block> \
                          </value> \
                        </block>') +
       createCategory(msg.catVariables(), '', 'VARIABLE') +
       createCategory(msg.catProcedures(), '', 'PROCEDURE') +
       createCategory('Functional',
           blockOfType('functional_string') +
           blockOfType('functional_background_string_picker') +
           blockOfType('functional_math_number') +
           '<block type="functional_math_number_dropdown">' +
             '<title name="NUM" config="2,3,4,5,6,7,8,9,10,11,12">???</title>' +
           '</block>') +
       createCategory('Functional Start',
           blockOfType('functional_start_setSpeeds') +
           blockOfType('functional_start_setBackgroundAndSpeeds')) +
       createCategory('Functional Logic',
           blockOfType('functional_greater_than') +
           blockOfType('functional_less_than') +
           blockOfType('functional_number_equals') +
           blockOfType('functional_string_equals') +
           blockOfType('functional_logical_and') +
           blockOfType('functional_logical_or') +
           blockOfType('functional_logical_not') +
           blockOfType('functional_boolean'))),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.full_sandbox_infinity = utils.extend(levels.full_sandbox, {});

levels.ec_sandbox = utils.extend(levels.sandbox, {
  'editCode': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'codeFunctions': {
    // Play Lab
    "setSprite": { 'category': 'Play Lab' },
    "setBackground": { 'category': 'Play Lab' },
    "move": { 'category': 'Play Lab' },
    "playSound": { 'category': 'Play Lab' },
    "changeScore": { 'category': 'Play Lab' },
    "setSpritePosition": { 'category': 'Play Lab' },
    "setSpriteSpeed": { 'category': 'Play Lab' },
    "setSpriteEmotion": { 'category': 'Play Lab' },
    "throwProjectile": { 'category': 'Play Lab' },
    "vanish": { 'category': 'Play Lab' },
    "onEvent": { 'category': 'Play Lab' },

    // Control
    "forLoop_i_0_4": null,
    "ifBlock": null,
    "ifElseBlock": null,
    "whileBlock": null,

    // Math
    "addOperator": null,
    "subtractOperator": null,
    "multiplyOperator": null,
    "divideOperator": null,
    "equalityOperator": null,
    "inequalityOperator": null,
    "greaterThanOperator": null,
    "lessThanOperator": null,
    "andOperator": null,
    "orOperator": null,
    "notOperator": null,
    "randomNumber_max": null,
    "randomNumber_min_max": null,
    "mathRound": null,
    "mathAbs": null,
    "mathMax": null,
    "mathMin": null,

    // Variables
    "declareAssign_x": null,
    "assign_x": null,
    "declareAssign_x_array_1_4": null,
    "declareAssign_x_prompt": null,

    // Functions
    "functionParams_none": null,
    "functionParams_n": null,
    "callMyFunction": null,
    "callMyFunction_n": null,
  },
  'startBlocks': "",
});

/* ******* Hour of Code 2015 ********/

levels.js_hoc2015_move_right = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song1' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x1020000, 0x1020000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000], 
     [0x1020000, 0x1020000, 0x0000000, 0x0010000, 0x0020000, 0x0100000, 0x00, 0x0000000], 
     [0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000], 
     [0x0000000, 0x0000000, 0x0000000, 0x0000010, 0x0000000, 0x0000001, 0x00, 0x0000000],
     [0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000],   
     [0x0000000, 0x0000000, 0x0000000, 0x0100000, 0x0010000, 0x0120000, 0x00, 0x0000000], 
     [0x0000000, 0x1120000, 0x1120000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0100000],  
     [0x0000000, 0x1120000, 0x1120000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000]],

  'instructions': '"We need that scrap metal. BOTX, can you get it?"',
  'ticksBeforeFaceSouth': 9,
  'timeoutFailureTick': 100,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal1',
    'imageWidth': 50,
    'imageHeight': 50
  },
  "callouts": [
    {
      "id": "playlab:js_hoc2015_move_right:runButton",
      "element_id": "#runButton",
      "hide_target_selector": "#runButton",
      "qtip_config": {
        "content": {
          "text": msg.calloutRunButton(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top left',
          'at': 'bottom center',
          'adjust': {
            'x': 0,
            'y': 0
          }
        }
      }
    }
  ],
  'progressConditions' : [
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false },
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};

levels.js_hoc2015_move_right_down = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song2' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': 
    [[0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00], 
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00], 
     [0x1100000, 0x1100000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00], 
     [0x1100000, 0x1100000, 0x00, 0x0000010, 0x0000000, 0x0000001, 0x0000000, 0x00],  
     [0x0000000, 0x0000000, 0x00, 0x1010000, 0x1010000, 0x0000000, 0x0000000, 0x00], 
     [0x0000000, 0x0000000, 0x00, 0x1010000, 0x1010000, 0x0000001, 0x0000000, 0x00],   
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],  
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00]],
  'instructions': '"We need more scrap metal. Can you get all the metal on this planet?"',
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal2',
    'imageWidth': 50,
    'imageHeight': 50
  },
  'progressConditions' : [
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false }, 
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};


levels.js_hoc2015_move_diagonal = {
  'editCode': true,
  'textModeAtStart': true,
  'background': 'main',
  'music': [ 'song3' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveDown();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,  
  'map':
    [[0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000], 
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0010000, 0x0000010, 0x0000000, 0x0000000],  
     [0x20, 0x1100000, 0x1100000, 0x0000000, 0x0000001, 0x0000000, 0x0000000, 0x0000000],
     [0x00, 0x1100000, 0x1100000, 0x0000001, 0x0240000, 0x0250000, 0x0000000, 0x0000000],   
     [0x00, 0x0000000, 0x0000001, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000],
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000], 
     [0x00, 0x0000000, 0x0000000, 0x1340000, 0x1340000, 0x1350000, 0x1350000, 0x0000000],   
     [0x00, 0x0000000, 0x0000000, 0x1340000, 0x1340000, 0x1350000, 0x1350000, 0x0000000]],
  'embed': 'false',
  'instructions': '"Watch out for the GUY!"',
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal1',
    'imageWidth': 50,
    'imageHeight': 50
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false }, 
      result: { success: false, message: msg.failedHasAllGoals() } }
  ],
  "callouts": [
    {
      'id': 'playlab:js_hoc2015_move_diagonal:placeCommandsHere',
      'element_id': '#show-code-header',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content': {
          'text': msg.calloutShowCodeToggle(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top right',
          'at': 'bottom left',
          'adjust': {
            'x': 0,
            'y': 0
          }
        }
      }
    }
  ]
};


levels.js_hoc2015_move_backtrack = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song4' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': 
    [[0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00], 
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00], 
     [0x00, 0x0000000, 0x0000000, 0x0010000, 0x0000001, 0x0020000, 0x00, 0x00], 
     [0x00, 0x0000000, 0x0000000, 0x0000010, 0x0000000, 0x0000001, 0x00, 0x00],  
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00], 
     [0x20, 0x1100000, 0x1100000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00],
     [0x00, 0x1100000, 0x1100000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00],  
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00]],
  'instructions': '"Go quickly, BOTX."',
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal1',
    'imageWidth': 50,
    'imageHeight': 50
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false }, 
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};

levels.js_hoc2015_move_around = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song5' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00], 
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00], 
     [0x0000000, 0x0000000, 0x00, 0x0000010, 0x0000000, 0x0000001, 0x0010000, 0x00],  
     [0x0000000, 0x0000000, 0x00, 0x0040000, 0x0020000, 0x0000000, 0x0000000, 0x00], 
     [0x0000000, 0x0000000, 0x20, 0x0140000, 0x0000000, 0x0000001, 0x0000000, 0x00],
     [0x1120000, 0x1120000, 0x00, 0x0000000, 0x0000001, 0x0000000, 0x0000000, 0x00],  
     [0x1120000, 0x1120000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00], 
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00]],
  'embed': 'false',
  'instructions': '"It\'s up to you, BOTX!"',
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal2',
    'imageWidth': 50,
    'imageHeight': 50
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false }, 
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};


levels.js_hoc2015_move_finale = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song6' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveDown();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000], 
     [0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000], 
     [0x0000000, 0x0000000, 0x0000010, 0x0020000, 0x0000001, 0x0100000, 0x0000000, 0x0000000], 
     [0x0000000, 0x0000000, 0x0000000, 0x0000001, 0x0000000, 0x0000001, 0x0000000, 0x0000000],  
     [0x0000000, 0x0000000, 0x0000001, 0x0120000, 0x0000000, 0x0000000, 0x0000000, 0x0000000],
     [0x0000000, 0x0000000, 0x0000000, 0x0000020, 0x0000000, 0x0000000, 0x1020000, 0x1020000],
     [0x0000000, 0x1010000, 0x1010000, 0x0000000, 0x0000000, 0x0000000, 0x1020000, 0x1020000],  
     [0x0000000, 0x1010000, 0x1010000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000]],
  'embed': 'false',
  'instructions': '"We need 4 more pieces of metal. Can you find them?"',
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal2',
    'imageWidth': 50,
    'imageHeight': 50
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false }, 
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};


/* ** level 7 ** */

levels.js_hoc2015_event_two_items = {
  'editCode': true,
  'background': 'snow',
  'music': [ 'song7' ],
  'wallMap': 'blank',
  'softButtons': ['downButton', 'upButton'],
  'codeFunctions': {
    'goUp': null,
    'goDown': null,

    'whenUp': null,
    'whenDown': null
  },
  'startBlocks': [
    'function whenUp() {', 
    '  ',
    '}',
    'function whenDown() {',
    '  ',
    '}'].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]],
  'pinWorkspaceToBottom': 'true',
  'embed': 'false',
  'instructions': '"BOT1, I need you to get a critical message to the GOALs."',
  'instructions2': 'Make BOT1 move when you use the arrow keys.',
  'timeoutFailureTick': 600, // 20 seconds
  'showTimeoutRect': true,
  'goalOverride': {
    'goalAnimation': 'animatedGoal',
    'imageWidth': 100,
    'imageHeight': 100,
    'goalRenderOffsetX': 0
  },

  'progressConditions' : [
    { required: { 'allGoalsVisited': true }, 
      result: { success: true, message: msg.successCharacter1() } },
    { required: { 'timedOut': true }, 
      result: { success: false, message: msg.failedTwoItemsTimeout() } }
  ],

  'callouts': [
    {
      'id': 'playlab:js_hoc2015_event_two_items:placeCommandsHere',
      'element_id': '.droplet-gutter-line:nth-of-type(2)',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content': {
          'text': msg.calloutShowPlaceGoUpHere(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top left',
          'at': 'bottom right',
          'adjust': {
            'x': 30,
            'y': -10
          }
        }
      }
    },
    {
      'id': 'arrowsCallout',
      'element_id': '#upButton',
      'hide_target_selector': '#soft-buttons',
      'qtip_config': {
        'content': {
          'text': msg.calloutUseArrowButtons(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top left',
          'at': 'bottom left',
          'adjust': {
            'x': 30,
            'y': 0
          }
        }
      }
    }
  ]
};

levels.js_hoc2015_event_four_items = {
  'editCode': true,
  'background': 'snow',
  'music': [ 'song8' ],
  'wallMap': 'blobs',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'goRight': null,
    'goLeft': null,
    'goUp': null,
    'goDown': null,

    'whenLeft': null,
    'whenRight': null,
    'whenUp': null,
    'whenDown': null
  },
  'startBlocks': [
    'function whenUp() {',
    '  ',
    '}',
    'function whenDown() {',
    '  ',
    '}'].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x01],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]],
  'embed': 'false',
  'instructions': '"Get to all the GOALs as quickly as you can."',
  'instructions2': 'Move in all directions.',
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'goalOverride': {
    'goalAnimation': 'animatedGoal',
    'imageWidth': 100,
    'imageHeight': 100
  },

  'progressConditions' : [
    { required: { 'allGoalsVisited': true }, 
      result: { success: true, message: msg.successCharacter1() } },
    { required: { 'timedOut': true }, 
      result: { success: false, message: msg.failedFourItemsTimeout() } }
  ]
};


levels.js_hoc2015_score =
{
  'avatarList': ['bot1'],
  'editCode': true,
  'background': 'snow',
  'music': [ 'song9' ],
  'wallMap': 'circle',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'autohandlerOverrides': {
    'whenGetPilot': 'whenTouchGoal'
  },
  'codeFunctions': {
    'playSound': null,
    'addPoints': { params: ["100"] },

    'whenGetPilot': null
  },
  'startBlocks': [
    'function whenGetPilot() {',
    '  playSound("character1sound1");',
    '}',
    ].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'edgeCollisions': 'true',
  'map': [
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [1, 0, 0, 16, 0, 0, 0, 1],
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 1,  0, 0, 0, 0]],
  'instructions': '"Reach the GOAL!"',
  'instructions2': "Let's add points. Add 100 points when BOT1 gets the pilot.",
  'autoArrowSteer': true,
  'timeoutFailureTick': 600, // 20 seconds
  'showTimeoutRect': true,
  'goalOverride': {
    'goalAnimation': 'animatedGoal',
    'imageWidth': 100,
    'imageHeight': 100
  },
  'goal': {
    // The level uses completeOnSuccessConditionNotGoals, so make sure this
    // returns null  The progressConditions will take care of completion.
    successCondition: function () { return false; }
  },
  'progressConditions' : [
    { required: { 'timedOut': true, 'allGoalsVisited': false, 'currentPointsBelow': 300 }, 
      result: { success: false, message: msg.failedScoreTimeout() } },
    { required: { 'timedOut': true, 'allGoalsVisited': true, 'currentPointsBelow': 300 }, 
      result: { success: false, message: msg.failedScoreScore() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false, 'currentPointsAtOrAbove': 300 }, 
      result: { success: false, message: msg.failedScoreGoals() } },
    { required: { 'allGoalsVisited': true, 'currentPointsAtOrAbove': 300 }, 
      result: { success: true, message: msg.successCharacter1() } }
  ],
  'completeOnSuccessConditionNotGoals': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_score:placeCommandsAtTop',
      'element_id': '.droplet-gutter-line:nth-of-type(2)',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content': {
          'text': msg.calloutShowPlaySound(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top left',
          'at': 'top left',
          'adjust': {
            'x': 170,
            'y': 20
          }
        }
      }
    }
  ],
};



levels.js_hoc2015_win_lose = {
  'editCode': true,
  'background': 'forest',
  'music': [ 'song10' ],
  'wallMap': 'blobs',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'playSound': null,
    'addPoints': { params: ["100"] },
    'removePoints': { params: ["100"] },
    'whenGetPilot': null,
    'whenGetMan': null,
    'whenGetBird': null,
  },
  'startBlocks': [].join('\n'),

  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x040, 0x040, 0x000, 0x000, 0x000],
    [0x800, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x800],
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x010, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x100, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000]],
  'embed': 'false',
  'instructions': '"Watch out for the MAN."',
  'instructions2': 'Add 100 points when BOT1 gets the pilot.  Remove 100 points when he gets a MAN.  Now, avoid the MEN!',
  'autoArrowSteer': true,
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_win_lose:instructions',
      'element_id': '#prompt-table',
      'hide_target_selector': '#prompt-table',
      'qtip_config': {
        'content': {
          'text': msg.calloutInstructions(),
        },
        'position': {
          'my': 'bottom left',
          'at': 'top right',
          'adjust': {
            'x': -40,
            'y': 0
          }
        }
      }
    }
  ],

  'progressConditions' : [
    { required: { 'timedOut': true, 'collectedItemsBelow': 2, 'currentPointsBelow': 200 }, 
      result: { success: false, message: msg.failedWinLoseTimeout() } },
    { required: { 'timedOut': true, 'collectedItemsAtOrAbove': 2, 'currentPointsBelow': 200 }, 
      result: { success: false, message: msg.failedWinLoseScore() } },
    { required: { 'timedOut': true, 'collectedItemsBelow': 2, 'currentPointsAtOrAbove': 200 }, 
      result: { success: false, message: msg.failedWinLoseGoals() } },
    { required: { 'collectedItemsAtOrAbove': 2, 'currentPointsAtOrAbove': 200 }, 
      result: { success: true, message: msg.successCharacter1() } }
  ]
};


levels.js_hoc2015_add_characters = {
  'editCode': true,
  'background': 'forest',
  'music': [ 'song11' ],
  'wallMap': 'circle',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'addCharacter': { params: ['"pig"'] },
    'addPoints': { params: ["1000"] },
    'removePoints': { params: ["1000"] },
    'playSound': null,

    'whenGetPig': null,
  },
  'startBlocks': [
    'playSound("character1sound1");',
    'addCharacter("pig");',
    '',
    'function whenGetPig() {',
    '  playSound("item1sound1");',
    '  addPoints(1000);',
    '}',
    ].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 16, 0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0], 
    [0, 0, 0, 0,  0, 0, 0, 0]],
  'embed': 'false',
  'instructions': '"I\'m seeing signs of increased activity on this planet!"',
  'instructions2': 'Add 3 PIGs to the planet. Then, go get them.',
  'autoArrowSteer': true,
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_add_characters:calloutPutCommandsHereRunStart',
      'element_id': '.droplet-gutter-line:nth-of-type(2)',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content' : {
          'text': msg.calloutPutCommandsHereRunStart(),
        },
        'event': 'mouseup touchend',
        'position': {
          'my': 'top left',
          'at': 'center right',
        }
      }
    }
  ],

  'progressConditions' : [
    { required: { 'collectedItemsAtOrAbove': 3 }, 
      result: { success: true, message: msg.successCharacter1() } },
    { required: { 'timedOut': true, 'collectedItemsBelow': 3 }, 
      result: { success: false, message: msg.failedAddCharactersTimeout() } }
  ]
};


levels.js_hoc2015_chain_characters = {
  'editCode': true,
  'background': 'ship',
  'music': [ 'song12' ],
  'wallMap': 'grid',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'addCharacter': null,
    'playSound': null,
    'addPoints': null,
    'removePoints': null,

    'whenGetMouse': null,
  },
  'startBlocks': [
    'addCharacter("mouse");',
    'playSound("character1sound3");',
    '',
    'function whenGetMouse() {',
    '  playSound("item6sound2");',
    '  addCharacter("mouse");',
    '  addCharacter("mouse");',
    '}',
    ].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  'instructions': '"They\'re multiplying!"',
  'instructions2': 'Add 100 points every time BOT1 gets a MOUSE. Can you get 800 points? ',
  'autoArrowSteer': true,
  'timeoutFailureTick': 1350, // 45 seconds
  'showTimeoutRect': true,
  'progressConditions' : [
    { required: { 'timedOut': true, 'collectedItemsBelow': 8, 'currentPointsBelow': 800 }, 
      result: { success: false, message: msg.failedChainCharactersTimeout() } },
    { required: { 'timedOut': true, 'collectedItemsAtOrAbove': 8, 'currentPointsBelow': 800 }, 
      result: { success: false, message: msg.failedChainCharactersScore() } },
    { required: { 'timedOut': true, 'collectedItemsBelow': 8, 'currentPointsAtOrAbove': 800 }, 
      result: { success: false, message: msg.failedChainCharactersItems() } },
    { required: { 'collectedItemsAtOrAbove': 8, 'currentPointsAtOrAbove': 800 }, 
      result: { success: true, message: msg.successCharacter1() } }
  ]
};

levels.js_hoc2015_chain_characters_2 = {
  'editCode': true,
  'background': 'ship',
  'music': [ 'song13' ],
  'wallMap': 'horizontal',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'addCharacter': { params: ['"mouse"'] },
    'addPoints': null,
    'removePoints': null,
    'playSound': null,

    'whenGetRoo': null,
    'whenGetMouse': null
  },
  'startBlocks': [
    'addCharacter("roo");',
    'addCharacter("roo");',
    '',
    'function whenGetRoo() {',
    '  playSound("item3sound4");',
    '  addPoints(50);',
    '  addCharacter("bird");',
    '  addCharacter("bird");',
    '}',
    '',
    'function whenGetBird() {',
    '  playSound("item4sound1");',
    '',
    '}',
    'function whenGetMouse() {',
    '  playSound("item6sound2");',
    '  addPoints(100);',
    '  ',
    '}',
    ].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  'instructions': '"It\'s up to you, BOT1!"',
  'instructions2': 'When you get a ROO, two BIRDs appear. Can you make two MICE appear when you get a BIRD? Then, get them all.',
  'autoArrowSteer': true,
  'timeoutFailureTick': 1350, // 45 seconds
  'showTimeoutRect': true,
  'progressConditions' : [
    { required: { 'timedOut': true, 'collectedItemsBelow': 14 }, 
      result: { success: false, message: msg.failedChainCharacters2Timeout() } },
    { required: { 'collectedItemsAtOrAbove': 14 }, 
      result: { success: true, message: msg.successCharacter1() } }
  ],
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_chain_characters_2:calloutPlaceTwo',
      'element_id': '.droplet-gutter-line:nth-of-type(12)',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content' : {
          'text': msg.calloutPlaceTwo(),
        },
        'event': 'mouseup touchend',
        'position': {
          'my': 'top left',
          'at': 'center right',
          'adjust': {
            'x': 40,
            'y': 10
          }
        }
      }
    }
  ]
};

levels.js_hoc2015_change_setting = {
  'editCode': true,
  'background': 'ship',
  'music': [ 'song14' ],
  'wallMap': 'blobs',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'setBot': null,
    'setBackground': null,
    'setBotSpeed': null,
    'setMap': null,
    'playSound': null,
    'addCharacter': null,
    'addPoints': null,
    'removePoints': null,

    'whenScore1000': null,
    'whenGetPilot': null,
  },
  'startBlocks': [
    'addCharacter("pilot");',
    'addCharacter("pilot");',
    'addCharacter("pilot");',
    'playSound("character1sound4");',
    'setBot("bot1");',
    '',
    'function whenGetPilot() {',
    '  addPoints(400);',
    '  setBackground("random");',
    '  ',
    '}',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  'instructions': '"Time to visit another planet."',
  'instructions2': 'Use the new commands to change the background, map, BOT, and speed.',
  'autoArrowSteer': true,
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_change_setting:setMap',
      'element_id': '#droplet_palette_block_setMap',
      'hide_target_selector': '#droplet_palette_block_setMap',
      'qtip_config': {
        'content' : {
          'text': msg.calloutSetMapAndSpeed(),
        },
        'position': {
          'my': 'center left',
          'at': 'center right',
        }
      }
    }
  ],
  'progressConditions' : [
    // Collected all the items and set the right properties?  Success.
    { required: { 'setMap': true, 'setBotSpeed': true, 'collectedItemsAtOrAbove': 3 },
      result: { success: true, message: msg.successGenericCharacter() } },
    // Special message for timing out when not enough items collected.
    { required: { 'timedOut': true, 'collectedItemsBelow': 3 },
      result: { success: false, message: msg.failedChangeSettingTimeout() } },
    // If all items are collected, but either property not set?  Failure.
    { required: { 'setMap': false, 'collectedItemsAtOrAbove': 3 }, 
      result: { success: false, message: msg.failedChangeSettingSettings() } },
    { required: { 'setBotSpeed': false, 'collectedItemsAtOrAbove': 3 }, 
      result: { success: false, message: msg.failedChangeSettingSettings() } }
  ]
};


levels.js_hoc2015_event_free = {
  'editCode': true,
  'freePlay': true,
  'background': 'forest',
  'music': [ 'song15' ],
  'wallMap': 'blank',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'setBot': { 'category': 'Commands' },
    'setBackground': { 'category': 'Commands' },
    'setBotSpeed': { 'category': 'Commands' },
    'setMap': { 'category': 'Commands' },
    'playSound': { 'category': 'Commands' },
    'addCharacter': { 'category': 'Commands' },
    'moveSlow': { 'category': 'Commands' },
    'moveNormal': { 'category': 'Commands' },
    'moveFast': { 'category': 'Commands' },
    'addPoints': { 'category': 'Commands' },
    'removePoints': { 'category': 'Commands' },

    'whenTouchObstacle': { 'category': 'Events' },
    'whenGetMan': { 'category': 'Events' },
    'whenGetPilot': { 'category': 'Events' },
    'whenGetPig': { 'category': 'Events' },
    'whenGetBird': { 'category': 'Events' },
    'whenGetMouse': { 'category': 'Events' },
    'whenGetRoo': { 'category': 'Events' },
    'whenGetSpider': { 'category': 'Events' },
    'whenGetCharacter': { 'category': 'Events' },

    'whenGetAllMen': { 'category': 'Events' },
    'whenGetAllPilots': { 'category': 'Events' },
    'whenGetAllPigs': { 'category': 'Events' },
    'whenGetAllBirds': { 'category': 'Events' },
    'whenGetAllMice': { 'category': 'Events' },
    'whenGetAllRoos': { 'category': 'Events' },
    'whenGetAllSpiders': { 'category': 'Events' },
    'whenGetAllCharacters': { 'category': 'Events' }
  },
  'startBlocks': [
    'setBackground("forest");',
    'setMap("circle");',
    'setBot("bot1");',
    'setBotSpeed("normal");',
    'playSound("character1sound5");',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0,16,0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  'instructions': '"You\'re on your own now, BOT1."',
  'autoArrowSteer': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_event_free:clickCategory',
      'element_id': '.droplet-palette-group-header.green',
      'hide_target_selector': '.droplet-palette-group-header.green',
      'qtip_config': {
        'content' : {
          'text': msg.calloutClickEvents(),
        },
        'position': {
          'my': 'top center',
          'at': 'bottom center',
        }
      }
    }
  ],
};

levels.hoc2015_blockly_1 = utils.extend(levels.js_hoc2015_move_right,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
  ],
});

levels.hoc2015_blockly_2 = utils.extend(levels.js_hoc2015_move_right_down,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
    moveSouthRequiredBlock(),
  ],
});

levels.hoc2015_blockly_3 = utils.extend(levels.js_hoc2015_move_diagonal,  {
  editCode: false,
  startBlocks: whenRunMoveSouth,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveSouthRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_4 = utils.extend(levels.js_hoc2015_move_backtrack,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
  ],
});

levels.hoc2015_blockly_5 = utils.extend(levels.js_hoc2015_move_around,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
    moveSouthRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_6 = utils.extend(levels.js_hoc2015_move_finale,  {
  editCode: false,
  startBlocks: whenRunMoveSouth,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_7 = utils.extend(levels.js_hoc2015_event_two_items,  {
  editCode: false,
  startBlocks: whenUpDown,
  toolbox: tb(hocMoveNS),
  requiredBlocks: [
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
  ],
});

levels.hoc2015_blockly_8 = utils.extend(levels.js_hoc2015_event_four_items,  {
  editCode: false,
  startBlocks: whenUpDownLeftRight,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
    moveEastRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_9 = utils.extend(levels.js_hoc2015_score,  {
  editCode: false,
});

levels.hoc2015_blockly_10 = utils.extend(levels.js_hoc2015_win_lose,  {
  editCode: false,
});

levels.hoc2015_blockly_11 = utils.extend(levels.js_hoc2015_add_characters,  {
  editCode: false,
});

levels.hoc2015_blockly_12 = utils.extend(levels.js_hoc2015_chain_characters,  {
  editCode: false,
});

levels.hoc2015_blockly_13 = utils.extend(levels.js_hoc2015_chain_characters_2,  {
  editCode: false,
});

levels.hoc2015_blockly_14 = utils.extend(levels.js_hoc2015_change_setting,  {
  editCode: false,
});

levels.hoc2015_blockly_15 = utils.extend(levels.js_hoc2015_event_free,  {
  editCode: false,
});
