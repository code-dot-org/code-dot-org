import { createToolbox as tb } from '../block_utils';
import { extend } from '../utils';

/*
 * Configuration for all levels.
 */
var levels = {};

levels['1'] = {
  'instructionsImportant': true,
  'requiredBlocks': [
    [{'test': 'moveLeft', 'type': 'bounce_moveLeft'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [8, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block>'),
  'startBlocks':
   '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block>'
};
levels['1_basketball'] = extend(levels['1'], {
  'useFlagGoal': true,
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [8, 0, 0,16, 0, 0, 0, 0]
  ]
});
levels['1_sports'] = extend(levels['1_basketball'], {
  theme: 'soccer',
});
levels['2'] = {
  'ideal': 5,
  'requiredBlocks': [
    [{'test': 'moveRight', 'type': 'bounce_moveRight'}],
    [{'test': 'moveLeft', 'type': 'bounce_moveLeft'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [8, 0, 0,16, 0, 0, 0, 8],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block>'),
  'startBlocks':
   '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="20"></block>'
};
levels['2_basketball'] = extend(levels['2'], {
  'useFlagGoal': true,
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [8, 0, 0,16, 0, 0, 0, 8]
  ],
});
levels['2_sports'] = extend(levels['2_basketball'], {
  theme: 'soccer',
});
levels['3'] = {
  'requiredBlocks': [
    [{'test': 'moveUp', 'type': 'bounce_moveUp'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'upButton'
  ],
  'map': [
    [0, 0, 0, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_moveUp"></block> \
        <block type="bounce_moveDown"></block>'),
  'startBlocks':
   '<block type="bounce_whenUp" deletable="false" x="20" y="20"></block>'
};
levels['4'] = {
  'requiredBlocks': [
    [{'test': 'moveRight', 'type': 'bounce_moveRight'}],
    [{'test': 'moveLeft', 'type': 'bounce_moveLeft'}],
    [{'test': 'moveUp', 'type': 'bounce_moveUp'}],
    [{'test': 'moveDown', 'type': 'bounce_moveDown'}]
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
    [0, 0, 8, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 8],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [8, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 8, 0, 0]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_moveUp"></block> \
        <block type="bounce_moveDown"></block>'),
  'startBlocks':
   '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
    <block type="bounce_whenUp" deletable="false" x="20" y="120"></block> \
    <block type="bounce_whenDown" deletable="false" x="180" y="120"></block>'
};
levels['5'] = {
  'timeoutFailureTick': 100,
  'requiredBlocks': [
    [{'test': 'bounceBall', 'type': 'bounce_bounceBall'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'ballDirection': (1.285 * Math.PI),
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [32,0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0]
  ],
  'toolbox':
    tb('<block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block>'),
  'startBlocks':
   '<block type="bounce_whenPaddleCollided" deletable="false" x="20" y="20"></block>'
};
levels['5_basketball'] = extend(levels['5'], {
  'useFlagGoal': true,
  'toolbox': tb('<block type="bounce_bounceBall"></block>')
});
levels['5_sports'] = extend(levels['5_basketball'], {
  theme: 'hockey'
});
levels['6'] = {
  'timeoutFailureTick': 140,
  'requiredBlocks': [
    [{'test': 'bounceBall', 'type': 'bounce_bounceBall'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'ballDirection': (1.285 * Math.PI),
  'map': [
    [1, 1,33, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 4, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0,16, 0, 0, 0, 1]
  ],
  'toolbox':
    tb('<block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block>'),
  'startBlocks':
   '<block type="bounce_whenPaddleCollided" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenWallCollided" deletable="false" x="20" y="120"></block>'
};
levels['6_basketball'] = extend(levels['6'], {
  'useFlagGoal': true,
  'toolbox': tb('<block type="bounce_bounceBall"></block>')
});
levels['6_sports'] = extend(levels['6_basketball'], {
  theme: 'hockey'
});
levels['7'] = {
  'timeoutFailureTick': 900,
  'requiredBlocks': [
    [{'test': 'moveLeft', 'type': 'bounce_moveLeft'}],
    [{'test': 'moveRight', 'type': 'bounce_moveRight'}],
    [{'test': 'bounceBall', 'type': 'bounce_bounceBall'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton'
  ],
  'failOnBallExit' : true,
  'map': [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0,32, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 4, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0,16, 0, 0, 0, 0, 1]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block>'),
  'startBlocks':
   '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
    <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="120"></block> \
    <block type="bounce_whenWallCollided" deletable="false" x="20" y="220"></block>'
};
levels['7_basketball'] = extend(levels['7'], {
  'useFlagGoal': true,
});
levels['7_sports'] = extend(levels['7_basketball'], {
  theme: 'football',
});
/*
  '8': {
    'requiredBlocks': [
      [{'test': 'moveRight', 'type': 'bounce_moveRight'}]
    ],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': [
      'leftButton',
      'rightButton'
    ],
    'map': [
      [1, 1, 1, 1, 5, 1, 1, 1],
      [1, 0, 4, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 4, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 4, 1],
      [1, 4, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0,16, 0, 0, 0, 0, 1]
    ],
    'toolbox':
      tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block>'),
    'startBlocks':
     '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
      <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="120"></block> \
      <block type="bounce_whenWallCollided" deletable="false" x="20" y="220"></block>'
  },
  '9': {
    'requiredBlocks': [
      [{'test': 'moveRight', 'type': 'bounce_moveRight'}]
    ],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': [
      'leftButton',
      'rightButton'
    ],
    'map': [
      [1, 5, 1, 5, 1, 5, 1, 5],
      [5, 0, 4, 0, 4, 0, 4, 1],
      [1, 4, 0, 4, 0, 4, 0, 5],
      [5, 0, 4, 0, 4, 0, 4, 1],
      [1, 4, 0, 4, 0, 4, 0, 5],
      [5, 0, 4, 0, 4, 0, 4, 1],
      [1, 4, 0, 4, 0, 4, 0, 5],
      [1, 0,16, 0, 0, 0, 0, 1]
    ],
    'toolbox':
      tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block>'),
    'startBlocks':
     '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
      <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="120"></block> \
      <block type="bounce_whenWallCollided" deletable="false" x="20" y="220"></block>'
  },
*/
levels['10'] = {
  'requiredBlocks': [
    [{'test': 'moveLeft', 'type': 'bounce_moveLeft'}],
    [{'test': 'moveRight', 'type': 'bounce_moveRight'}],
    [{'test': 'bounceBall', 'type': 'bounce_bounceBall'}],
    [{'test': 'incrementPlayerScore', 'type': 'bounce_incrementPlayerScore'}],
    [{'test': 'incrementOpponentScore', 'type': 'bounce_incrementOpponentScore'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton'
  ],
  'goal': {
    successCondition: function () {
      return (Bounce.opponentScore >= 2);
    }
  },
  'respawnBalls' : true,
  'map': [
    [1, 1, 2, 2, 2, 2, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 4, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0,16, 0, 0, 0, 0, 1]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block> \
        <block type="bounce_incrementPlayerScore"></block> \
        <block type="bounce_incrementOpponentScore"></block>'),
  'startBlocks':
   '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
    <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="100"></block> \
    <block type="bounce_whenWallCollided" deletable="false" x="20" y="180"></block> \
    <block type="bounce_whenBallInGoal" deletable="false" x="20" y="260"></block> \
    <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="340"></block>'
};
levels['10_basketball'] = extend(levels['10'], {
  'map': [
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 4, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0,16, 0, 0, 0, 0, 1]
  ],
});
levels['10_sports'] = extend(levels['10_basketball'], {
  'map': [
    [1, 1, 2, 2, 2, 2, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 4, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0,16, 0, 0, 0, 0, 1]
  ],
  theme: 'football',
});
levels['11'] = {
  'requiredBlocks': [
    [{'test': 'moveLeft', 'type': 'bounce_moveLeft'}],
    [{'test': 'moveRight', 'type': 'bounce_moveRight'}],
    [{'test': 'bounceBall', 'type': 'bounce_bounceBall'}],
    [{'test': 'incrementPlayerScore', 'type': 'bounce_incrementPlayerScore'}],
    [{'test': 'incrementOpponentScore', 'type': 'bounce_incrementOpponentScore'}],
    [{'test': 'launchBall', 'type': 'bounce_launchBall'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton'
  ],
  'minWorkspaceHeight': 750,
  'goal': {
    successCondition: function () {
      return (Bounce.opponentScore >= 2);
    }
  },
  'map': [
    [1, 1, 2, 2, 2, 2, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0,16, 0, 0, 0, 0, 1]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block> \
        <block type="bounce_incrementPlayerScore"></block> \
        <block type="bounce_incrementOpponentScore"></block> \
        <block type="bounce_launchBall"></block> \
        <block type="bounce_setPaddleSpeed"></block> \
        <block type="bounce_setBallSpeed"></block> \
        <block type="bounce_setBackground"></block> \
        <block type="bounce_setBall"></block> \
        <block type="bounce_setPaddle"></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenLeft" deletable="false" x="20" y="180"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="180"></block> \
    <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="270"></block> \
    <block type="bounce_whenWallCollided" deletable="false" x="20" y="370"></block> \
    <block type="bounce_whenBallInGoal" deletable="false" x="20" y="470"></block> \
    <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="590"></block>'
};
levels['11_basketball'] = extend(levels['11'], {
  'map': [
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0,16, 0, 0, 0, 0, 1]
  ],
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block> \
        <block type="bounce_incrementPlayerScore"></block> \
        <block type="bounce_incrementOpponentScore"></block> \
        <block type="bounce_launchBall"></block> \
        <block type="bounce_setPaddleSpeed"></block> \
        <block type="bounce_setBallSpeed"></block> \
        <block type="bounce_setPaddleDropdown"></block>'),
});
levels['11_sports'] = extend(levels['11_basketball'], {
});
var topGoalLarge = [
  [1, 1, 2, 2, 2, 2, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0,16, 0, 0, 0, 0, 1]
];
var topGoalSmall = [
  [1, 1, 1, 2, 2, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0,16, 0, 0, 0, 0, 1]
];
levels['12'] = {
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton'
  ],
  'minWorkspaceHeight': 800,
  'freePlay': true,
  'map': topGoalLarge,
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block> \
        <block type="bounce_incrementPlayerScore"></block> \
        <block type="bounce_incrementOpponentScore"></block> \
        <block type="bounce_launchBall"></block> \
        <block type="bounce_setPaddleSpeed"></block> \
        <block type="bounce_setBallSpeed"></block> \
        <block type="bounce_setBackground"></block> \
        <block type="bounce_setBall"></block> \
        <block type="bounce_setPaddle"></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenLeft" deletable="false" x="20" y="220"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="220"></block> \
    <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="310"></block> \
    <block type="bounce_whenWallCollided" deletable="false" x="20" y="410"></block> \
    <block type="bounce_whenBallInGoal" deletable="false" x="20" y="510"></block> \
    <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="630"></block>'
};
levels['12_basketball'] = {
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton'
  ],
  'minWorkspaceHeight': 800,
  'freePlay': true,
  'map': topGoalSmall,
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block> \
        <block type="bounce_incrementPlayerScore"></block> \
        <block type="bounce_incrementOpponentScore"></block> \
        <block type="bounce_launchBall"></block> \
        <block type="bounce_setTeam"></block> \
        <block type="bounce_setPaddleSpeed"></block> \
        <block type="bounce_setPaddleDropdown"></block> \
        <block type="bounce_setBallSpeed"></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenLeft" deletable="false" x="20" y="220"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="220"></block> \
    <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="310"></block> \
    <block type="bounce_whenWallCollided" deletable="false" x="20" y="410"></block> \
    <block type="bounce_whenBallInGoal" deletable="false" x="20" y="510"></block> \
    <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="630"></block>'
};
levels['12_sports'] = extend(levels['12_basketball'], {
  'toolbox':
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block> \
        <block type="bounce_incrementPlayerScore"></block> \
        <block type="bounce_incrementOpponentScore"></block> \
        <block type="bounce_launchBall"></block> \
        <block type="bounce_setBackground"></block> \
        <block type="bounce_setPaddleDropdown"></block> \
        <block type="bounce_setBall"></block> \
        <block type="bounce_setPaddleSpeed"></block> \
        <block type="bounce_setBallSpeed"></block>'),
  'maps': {
    'basketball': topGoalSmall,
    'football': topGoalLarge,
    'hockey': topGoalSmall,
    'soccer': topGoalLarge,
  },
});

levels['custom'] = {
  requiredBlocks: [],
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
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  toolbox:
    tb('<block type="bounce_moveLeft"></block> \
        <block type="bounce_moveRight"></block> \
        <block type="bounce_bounceBall"></block> \
        <block type="bounce_playSound"></block> \
        <block type="bounce_incrementPlayerScore"></block> \
        <block type="bounce_incrementOpponentScore"></block> \
        <block type="bounce_launchBall"></block> \
        <block type="bounce_setPaddleSpeed"></block> \
        <block type="bounce_setBackground"></block> \
        <block type="bounce_setBall"></block> \
        <block type="bounce_setPaddle"></block> \
        <block type="bounce_setBallSpeed"></block>'),
  startBlocks:
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="bounce_whenLeft" deletable="false" x="20" y="220"></block> \
    <block type="bounce_whenRight" deletable="false" x="180" y="220"></block> \
    <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="310"></block> \
    <block type="bounce_whenWallCollided" deletable="false" x="20" y="410"></block> \
    <block type="bounce_whenBallInGoal" deletable="false" x="20" y="510"></block> \
    <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="630"></block>'
};

module.exports = levels;
