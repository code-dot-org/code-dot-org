import tickWrapper from '../../util/tickWrapper';
import { TestResults } from '@cdo/apps/constants';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import project from '@cdo/apps/code-studio/initApp/project';
import {CAPTURE_TICK_COUNT} from '@cdo/apps/applab/constants';

export default {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "project thumbnail is saved",
      editCode: true,
      useFirebase: true,
      xml: `write('hello');`,

      runBeforeClick(assert) {
        sinon.stub(project, 'saveThumbnail').returns(Promise.resolve());
        tickWrapper.runOnAppTick(Applab, CAPTURE_TICK_COUNT + 1, () => {
          expect(Applab.isCaptureComplete()).to.be.false;
          tickWrapper.tickAppUntil(Applab, Applab.isCaptureComplete).then(() => {
            expect(project.saveThumbnail).to.have.been.calledOnce;
            project.saveThumbnail.restore();
            Applab.onPuzzleComplete();
          });
        });
      },
      customValidator(assert) {
        // No errors in output console
        const debugOutput = document.getElementById('debug-output');
        assert.equal(debugOutput.textContent, '');
        return true;
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
  ]
};
