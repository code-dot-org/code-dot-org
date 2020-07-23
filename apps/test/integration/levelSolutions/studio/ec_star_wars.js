import {TestResults} from '@cdo/apps/constants.js';

const levelDef = {
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 16, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  freePlay: true,
  timeoutFailureTick: 200,
  editCode: true
};

export default {
  app: 'studio',
  skinId: 'hoc2015',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Droplet Star Wars map collision: Endor circle',
      xml: `
        setMap("circle");
        for (var i = 0; i < 100; i++) goRight();
      `,
      customValidator: function(assert) {
        assert.equal(Studio.sprite[0].x, 245);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },
    {
      description: 'Droplet Star Wars map collision: Hoth circle',
      xml: `
        setBackground("Hoth");
        setMap("circle");
        for (var i = 0; i < 100; i++) goRight();
      `,
      customValidator: function(assert) {
        assert.equal(Studio.sprite[0].x, 235);
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
