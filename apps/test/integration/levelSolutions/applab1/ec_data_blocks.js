import tickWrapper from '../../util/tickWrapper';
import {TestResults} from '@cdo/apps/constants';

export default {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'Data createRecord',
      editCode: true,
      xml: `
        createRecord('mytable', {name:'Alice', age:7}, function(record) {
          console.log('record created with id: ' + record.id + ' name: ' + record.name +
            ' age: ' + record.age);
        });`,

      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // No errors in output console
        const debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"record created with id: 1 name: Alice age: 7"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },

    {
      description: 'Data getColumn',
      editCode: true,
      xml: `
        createRecord("mytable", {name:'Alice'}, function(record) {
          createRecord("mytable", {name: 'Bob'}, function (record) {
            var names = getColumn('mytable', 'name');
            console.log("getColumn returned: " + names.join(', '));
          });
        });`,

      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // No errors in output console
        const debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"getColumn returned: Alice, Bob"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },

    {
      description: 'Data createRecord again to confirm mock is reset',
      editCode: true,
      xml: `
        createRecord('mytable', {name:'Alice', age:7}, function(record) {
          console.log('record created with id: ' + record.id + ' name: ' + record.name +
            ' age: ' + record.age);
        });`,

      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // No errors in output console
        const debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"record created with id: 1 name: Alice age: 7"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },

    {
      description: 'Firebase warnings include line numbers',
      editCode: true,
      xml: `
        var value = '';
        for (var i = 0; i < 12; i++) {
          value += '0123456789';
        }
        setKeyValue('key1', value, function () {
          console.log('set key1');
        });`,
      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 100, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // Error text includes line number
        const debugOutput = document.getElementById('debug-output');
        assert.equal(
          String(debugOutput.textContent).startsWith('WARNING: Line: 6:'),
          true,
          `log message contains warning with line number: ${debugOutput.textContent}`
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },

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
