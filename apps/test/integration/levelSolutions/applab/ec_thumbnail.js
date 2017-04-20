import tickWrapper from '../../util/tickWrapper';
import { TestResults } from '@cdo/apps/constants';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import project from '@cdo/apps/code-studio/initApp/project';
import * as thumbnailUtils from '@cdo/apps/util/thumbnail';
import {CAPTURE_TICK_COUNT, isCaptureComplete} from '@cdo/apps/applab/applabThumbnail';

export default {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "succeeds when image capture and project thumbnail save succeed",
      editCode: true,
      useFirebase: true,
      xml: `write('hello');`,
      runBeforeClick(assert) {
        project.saveThumbnail.resolves();
        tickWrapper.runOnAppTick(Applab, CAPTURE_TICK_COUNT + 1, () => {
          expect(isCaptureComplete()).to.be.false;
          tickWrapper.tickAppUntil(Applab, isCaptureComplete).then(() => {
            expect(project.saveThumbnail).to.have.been.calledOnce;
            Applab.onPuzzleComplete();
          }).catch(e => {
            // Make sure any error details are visible in the test output.
            setTimeout(() => {
              throw new Error(`error within tickWrapper.tickAppUntil: ${e}`);
            }, 0);
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

    {
      description: "fails gracefully when project thumbnail save fails",
      editCode: true,
      useFirebase: true,
      xml: `write('hello');`,
      runBeforeClick(assert) {
        project.saveThumbnail.rejects('foobar');
        sinon.stub(console, 'log');
        tickWrapper.runOnAppTick(Applab, CAPTURE_TICK_COUNT + 1, () => {
          expect(isCaptureComplete()).to.be.false;
          tickWrapper.tickAppUntil(Applab, isCaptureComplete).then(() => {
            expect(project.saveThumbnail).to.have.been.calledOnce;

            expect(console.log).to.have.been.calledOnce;
            expect(console.log.getCall(0).args[0]).to.contain('foobar');
            console.log.restore();

            Applab.onPuzzleComplete();
          }).catch(e => {
            // Make sure any error details are visible in the test output.
            setTimeout(() => {
              throw new Error(`error within tickWrapper.tickAppUntil: ${e}`);
            }, 0);
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

    {
      description: "fails gracefully when image capture fails",
      editCode: true,
      useFirebase: true,
      xml: `write('hello');`,
      runBeforeClick(assert) {
        sinon.stub(thumbnailUtils, 'html2canvas').rejects('foobar');
        sinon.stub(console, 'log');
        tickWrapper.runOnAppTick(Applab, CAPTURE_TICK_COUNT + 1, () => {
          expect(isCaptureComplete()).to.be.false;
          tickWrapper.tickAppUntil(Applab, isCaptureComplete).then(() => {
            expect(project.saveThumbnail).not.to.have.been.called;

            expect(thumbnailUtils.html2canvas).to.have.been.calledOnce;
            thumbnailUtils.html2canvas.restore();

            expect(console.log).to.have.been.calledOnce;
            expect(console.log.getCall(0).args[0]).to.contain('foobar');
            console.log.restore();

            Applab.onPuzzleComplete();
          }).catch(e => {
            // Make sure any error details are visible in the test output.
            setTimeout(() => {
              throw new Error(`error within tickWrapper.tickAppUntil: ${e}`);
            }, 0);
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
