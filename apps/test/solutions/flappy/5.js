module.exports = {
  app: "flappy",
  skinId: "flappy",
  levelFile: "levels",
  levelId: "5",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"><next><block type="flappy_incrementPlayerScore"></block></next></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block></xml>'
    },
    {
      description: "start blocks (missing increment score)",
      missingBlocks: [
        {'test': 'incrementPlayerScore', 'type': 'flappy_incrementPlayerScore'}
      ],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap"></block></next></block><block type="flappy_whenEnterObstacle" deletable="false"></block><block type="when_run" deletable="false"><next><block type="flappy_setSpeed"><title name="VALUE">Flappy.LevelSpeed.NORMAL</title></block></next></block></xml>'
    }
  ]
};

