module.exports = {
  app: "bounce",
  levelFile: "levels",
  levelId: "1",
  tests: [
    // currently only testing missing blocks
    {
      description: "Expected solution",
      missingBlocks: [],
      xml: '<xml><block type="bounce_whenLeft" deletable="false"><next><block type="bounce_moveLeft"></block></next></block></xml>',
      customValidator: function () {
        return BlocklyApps.enableShowCode === false && BlocklyApps.enableShowBlockCount === false;
      }
    },
    {
      description: "missing moveLeft block",
      missingBlocks: [
        {'test': 'moveLeft', 'type': 'bounce_moveLeft'}
      ],
      xml: '<xml><block type="bounce_whenLeft" deletable="false"></block></xml>'
    }
  ]
};
