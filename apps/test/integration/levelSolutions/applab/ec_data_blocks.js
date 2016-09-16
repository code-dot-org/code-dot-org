import tickWrapper from '../../util/tickWrapper';
import { TestResults } from '@cdo/apps/constants';


export default {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "Data createRecord",
      editCode: true,
      useFirebase: true,
      xml:`
        createRecord('mytable', {name:'Alice', age:7}, function(record) {
          console.log('record created with id: ' + record.id + ' name: ' + record.name +
            ' age: ' + record.age);
        });`,

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent,
          "record created with id: 1 name: Alice age: 7");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "Data createRecord again to confirm mock is reset",
      editCode: true,
      useFirebase: true,
      xml:`
        createRecord('mytable', {name:'Alice', age:7}, function(record) {
          console.log('record created with id: ' + record.id + ' name: ' + record.name +
            ' age: ' + record.age);
        });`,

      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        tickWrapper.runOnAppTick(Applab, 200, function () {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function (assert) {
        // No errors in output console
        var debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent,
          "record created with id: 1 name: Alice age: 7");
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "Data block palette without firebase",
      editCode: true,
      xml:``,

      runBeforeClick: function (assert) {
        $('.droplet-palette-group-header:contains(Data)').click();
        const actualBlocks = $('.droplet-hover-div').map((i, el) => el.dataset.block).toArray();
        const expectedBlocks = [
          "startWebRequest", "setKeyValue", "getKeyValue", "createRecord", "readRecords",
          "updateRecord", "deleteRecord", "getUserId", "drawChart",
          "drawChartFromRecords"
        ];
        assert.deepEqual(actualBlocks, expectedBlocks);
        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "Data block palette with firebase",
      editCode: true,
      useFirebase: true,
      xml:``,

      runBeforeClick: function (assert) {
        $('.droplet-palette-group-header:contains(Data)').click();
        const actualBlocks = $('.droplet-hover-div').map((i, el) => el.dataset.block).toArray();
        const expectedBlocks = [
          "startWebRequest", "setKeyValue", "getKeyValue", "createRecord", "readRecords",
          "updateRecord", "deleteRecord", "onRecordEvent", "getUserId", "drawChart",
          "drawChartFromRecords"
        ];
        assert.deepEqual(actualBlocks, expectedBlocks);
        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
  ],
};
