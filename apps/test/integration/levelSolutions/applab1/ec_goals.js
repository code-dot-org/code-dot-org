import {TestResults} from '@cdo/apps/constants';

export default {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_goals',
  tests: [
    {
      description: 'Goals block palette',
      editCode: true,
      xml: ``,

      runBeforeClick(assert) {
        $('.droplet-palette-group-header:contains(Goals)').click();
        const actualBlocks = $('.droplet-palette-canvas > g')
          .map((i, el) =>
            $(el)
              .text()
              .replace(/\s/g, ' ')
          )
          .toArray();
        const expectedBlocks = [
          '// Goal 1',
          '// Goal 2',
          '// Goal 3',
          '// Goal 4',
          '// Goal 5',
          '// Goal 6',
          '// Goal 7',
          '// Goal 8',
          '// Goal 9',
          '// Goal 10',
          '// Goal 11',
          '// Goal 12',
          '// Goal 13',
          '// Goal 14',
          '// Goal 15',
          '// Goal 16',
          '// Goal 17',
          '// Goal 18',
          '// Goal 19',
          '// Goal 20'
        ];
        assert.deepEqual(actualBlocks, expectedBlocks);
        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
