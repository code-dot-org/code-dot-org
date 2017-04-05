import $ from 'jquery';
import tickWrapper from '../../util/tickWrapper';
import { TestResults } from '@cdo/apps/constants';
import sinon from 'sinon';
import {expect} from '../../../util/configuredChai';
import project from '@cdo/apps/code-studio/initApp/project';
import {CAPTURE_TICK_COUNT} from '@cdo/apps/applab/constants';
import * as thumbnailUtils from '@cdo/apps/util/thumbnail';

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
        sinon.stub(project, 'saveThumbnail').resolves();
        sinon.spy(Applab, 'pinVisualizationSize');
        sinon.spy(Applab, 'clearVisualizationSize');

        let beforeHtml;
        tickWrapper.runOnAppTick(Applab, 1, () => {
          expect(Applab.pinVisualizationSize).not.to.have.been.called;
          beforeHtml = $('#visualizationColumn')[0].innerHTML;
        });

        tickWrapper.runOnAppTick(Applab, CAPTURE_TICK_COUNT + 1, () => {
          expect(Applab.isCaptureComplete()).to.be.false;
          tickWrapper.tickAppUntil(Applab, Applab.isCaptureComplete).then(() => {
            expect(project.saveThumbnail).to.have.been.calledOnce;
            project.saveThumbnail.restore();

            expect(Applab.pinVisualizationSize).to.have.been.calledOnce;
            Applab.pinVisualizationSize.restore();

            expect(Applab.clearVisualizationSize).to.have.been.calledOnce;
            Applab.clearVisualizationSize.restore();

            const afterHtml = $('#visualizationColumn')[0].innerHTML;

            expect(beforeHtml.length).to.be.above(0);
            expect(beforeHtml).to.equal(afterHtml,
              'html unchanged after pinning and unpinning viz column width');

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
        sinon.stub(project, 'saveThumbnail').rejects('foobar');
        sinon.spy(Applab, 'pinVisualizationSize');
        sinon.spy(Applab, 'clearVisualizationSize');
        sinon.stub(console, 'log');

        tickWrapper.runOnAppTick(Applab, CAPTURE_TICK_COUNT + 1, () => {
          expect(Applab.isCaptureComplete()).to.be.false;
          tickWrapper.tickAppUntil(Applab, Applab.isCaptureComplete).then(() => {
            expect(project.saveThumbnail).to.have.been.calledOnce;
            project.saveThumbnail.restore();

            expect(Applab.pinVisualizationSize).to.have.been.calledOnce;
            Applab.pinVisualizationSize.restore();

            expect(Applab.clearVisualizationSize).to.have.been.calledOnce;
            Applab.clearVisualizationSize.restore();

            expect(console.log).to.have.been.calledOnce;
            expect(console.log.getCall(0).args[0]).to.contain('foobar');
            console.log.restore();

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

    {
      description: "fails gracefully when image capture fails",
      editCode: true,
      useFirebase: true,
      xml: `write('hello');`,
      runBeforeClick(assert) {
        sinon.stub(thumbnailUtils, 'html2canvas').rejects('foobar');
        sinon.stub(project, 'saveThumbnail');
        sinon.spy(Applab, 'pinVisualizationSize');
        sinon.spy(Applab, 'clearVisualizationSize');
        sinon.stub(console, 'log');

        tickWrapper.runOnAppTick(Applab, CAPTURE_TICK_COUNT + 1, () => {
          expect(Applab.isCaptureComplete()).to.be.false;
          tickWrapper.tickAppUntil(Applab, Applab.isCaptureComplete).then(() => {
            expect(project.saveThumbnail).not.to.have.been.called;
            project.saveThumbnail.restore();

            expect(thumbnailUtils.html2canvas).to.have.been.calledOnce;
            thumbnailUtils.html2canvas.restore();

            expect(Applab.pinVisualizationSize).to.have.been.calledOnce;
            Applab.pinVisualizationSize.restore();

            expect(Applab.clearVisualizationSize).to.have.been.calledOnce;
            Applab.clearVisualizationSize.restore();

            expect(console.log).to.have.been.calledOnce;
            expect(console.log.getCall(0).args[0]).to.contain('foobar');
            console.log.restore();

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
