module.exports = {
  app: "flappy",
  skinId: "flappy",
  levelFile: "levels",
  levelId: "2",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap"></block></next></block><block type="flappy_whenCollideGround" deletable="false"><next><block type="flappy_endGame"></block></next></block></xml>'
    },
    {
      description: "start blocks (missing end game)",
      missingBlocks: [
        {'test': 'endGame', 'type': 'flappy_endGame'}
      ],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap"></block></next></block><block type="flappy_whenCollideGround" deletable="false"></block></xml>'
    }
  ]
};
