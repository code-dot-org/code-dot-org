import {TestResults} from '@cdo/apps/constants';

export default {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'Data block palette',
      editCode: true,
      xml: ``,

      runBeforeClick(assert) {
        $('.droplet-palette-group-header:contains(Data)').click();
        const actualBlocks = $('.droplet-palette-canvas > g')
          .map((i, el) => $(el).text().split('(')[0].replace(/\W/g, ''))
          .toArray();
        const expectedBlocks = [
          'getColumn',
          'startWebRequest',
          'setKeyValue',
          'getKeyValue',
          'createRecord',
          'readRecords',
          'updateRecord',
          'deleteRecord',
          'getUserId',
          'drawChart',
          'drawChartFromRecords',
          'getPrediction',
        ];
        assert.deepEqual(actualBlocks, expectedBlocks);
        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },
  ],
};
