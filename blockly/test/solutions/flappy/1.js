module.exports = {
  app: "flappy",
  skinId: "flappy",
  levelFile: "levels",
  levelId: "1",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="flappy_whenClick" deletable="false"><next><block type="flappy_flap"></block></next></block></xml>',
      customValidator: function () {
        return BlocklyApps.enableShowCode === false && BlocklyApps.enableShowBlockCount === false;
      }
    },
    {
      description: "missing flap block",
      missingBlocks: [
        {'test': 'flap', 'type': 'flappy_flap'}
      ],
      xml: '<xml><block type="flappy_whenClick" deletable="false"></block></xml>'
    }
  ]
};
