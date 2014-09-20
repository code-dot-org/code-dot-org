var setRandomBackgroundRequiredBlock = {
  test: function (block) {
    return (block.type === 'flappy_setBackground' ||
      block.type === 'flappy_setPlayer') &&
      block.getTitleValue('VALUE') === 'random';
  },
  type: 'flappy_setBackground',
  titles: {
    'VALUE': 'random'
  }
};

module.exports = {
  app: "flappy",
  skinId: "flappy",
  levelFile: "levels",
  levelId: "8",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title><next><block type="flappy_setBackground"><title name="VALUE">random</title></block></next></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
    },
    {
      description: "start blocks (missing set background)",
      missingBlocks: [setRandomBackgroundRequiredBlock],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
    },
    {
      description: "Non-random set scene",
      missingBlocks: [setRandomBackgroundRequiredBlock],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title><next><block type="flappy_setBackground"><title name="VALUE">"scifi"</title></block></next></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
    }
  ]
};
