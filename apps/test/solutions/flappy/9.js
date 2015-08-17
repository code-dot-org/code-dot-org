var setScoreRequiredBlock = {
  test: function (block) {
    return block.type === 'flappy_setScore';
  },
  type: 'flappy_setScore'
};

module.exports = {
  app: "flappy",
  skinId: "flappy",
  levelFile: "levels",
  levelId: "9",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"><next><block type="flappy_setScore"><title name="VALUE">0</title></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
    },
    {
      description: "start blocks (missing set score)",
      missingBlocks: [setScoreRequiredBlock],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap_height"><title name="VALUE">Flappy.FlapHeight.NORMAL</title></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block><block type="flappy_whenCollideObstacle" deletable="false"></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block></xml>'
    }
  ]
};
