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
        testResult: TestResults.FREE_PLAY
      }
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
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'onRecordEvent without includeAll excludes previous creates',
      editCode: true,
      xml: `
        createRecord("mytable", {name:'Alice'}, function(record) {
          onRecordEvent("mytable", function(record, eventType) {
            console.log(eventType + ' ' + record.id)
          });
          createRecord("mytable", {name:'Alice'}, function(record) {
            updateRecord("mytable", {id:1, name:'Bob'}, function(record, success) {
              deleteRecord("mytable", {id:1}, function(success) {
              });
            });
          });
        });`,

      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 100, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // Verify that onRecordEvent was called with the correct data
        const debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"create 2"' + '"update 1"' + '"delete 1"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'onRecordEvent with includeAll includes previous creates',
      editCode: true,
      xml: `
        createRecord("mytable", {name:'Alice'}, function(record) {
          var includeAll = true;
          onRecordEvent("mytable", function(record, eventType) {
            console.log(eventType + ' ' + record.id)
          }, includeAll);
          createRecord("mytable", {name:'Alice'}, function(record) {
            updateRecord("mytable", {id:1, name:'Bob'}, function(record, success) {
              deleteRecord("mytable", {id:1}, function(success) {
              });
            });
          });
        });`,

      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 100, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // Verify that onRecordEvent was called with the correct data
        const debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"create 1"' + '"create 2"' + '"update 1"' + '"delete 1"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description:
        'additional calls to onRecordEvent do not interfere with existing ones',
      editCode: true,
      xml: `
        createRecord("mytable", {name:'Alice'}, function(record) {
          onRecordEvent("mytable", function(record, eventType) {
            console.log(eventType + ' ' + record.id)
          });
          onRecordEvent("other table", function(record, eventType) {
            console.log(eventType + ' ' + record.id)
          });
          createRecord("mytable", {name:'Alice'}, function(record) {
            updateRecord("mytable", {id:1, name:'Bob'}, function(record, success) {
              deleteRecord("mytable", {id:1}, function(success) {
              });
            });
          });
        });`,

      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 100, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // Verify that onRecordEvent was called with the correct data
        const debugOutput = document.getElementById('debug-output');
        assert.equal(
          debugOutput.textContent,
          '"create 2"' + '"update 1"' + '"delete 1"'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description:
        'multiple calls to onRecordEvent on the same table give a warning',
      editCode: true,
      xml: `
        onRecordEvent("mytable", function(record, eventType) {
          console.log(eventType + ' ' + record.id)
        });
        onRecordEvent("mytable", function(record, eventType) {
          console.log(eventType + ' ' + record.id)
        });`,
      runBeforeClick(assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 100, () => {
          Applab.onPuzzleComplete();
        });
      },
      customValidator(assert) {
        // Verify that onRecordEvent prints a warning
        const debugOutput = document.getElementById('debug-output');
        const msg =
          'WARNING: Line: 5: onRecordEvent was already called for table "mytable"';
        assert.equal(
          String(debugOutput.textContent).includes(msg),
          true,
          'correct warning message is shown'
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
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
          `log message contains warning with line number: ${
            debugOutput.textContent
          }`
        );
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    },

    {
      description: 'Data block palette',
      editCode: true,
      xml: ``,

      runBeforeClick(assert) {
        $('.droplet-palette-group-header:contains(Data)').click();
        const actualBlocks = $('.droplet-palette-canvas > g')
          .map((i, el) =>
            $(el)
              .text()
              .split('(')[0]
              .replace(/\W/g, '')
          )
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
          'onRecordEvent',
          'getUserId',
          'drawChart',
          'drawChartFromRecords'
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
