import {TestResults} from '@cdo/apps/constants';
import tickWrapper from '../../util/tickWrapper';

const levelDef = {
  helperLibraries: ['HelloWorld'],
  editCode: true
};

export default {
  app: 'applab',
  skinId: 'applab',
  levelDefinition: levelDef,
  tests: [
    {
      libraries: {
        HelloWorld: 'console.log("hello world"); var myVar = 123;'
      },
      description: 'Helper Libraries in App Lab',
      editCode: true,
      xml: 'console.log(myVar);',
      runBeforeClick: function() {
        tickWrapper.runOnAppTick(Applab, 2, function() {
          Applab.onPuzzleComplete();
        });
      },
      customValidator: function(assert) {
        const debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '"hello world"123');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      }
    }
  ]
};
