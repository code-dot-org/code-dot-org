import sinon from 'sinon';
import {assertVisible, assertHidden} from '../../util/assertions';
import showProjectAdmin from '@cdo/apps/code-studio/showProjectAdmin';
import {enforceDocumentBodyCleanup, replaceOnWindow, restoreOnWindow} from "../../util/testUtils";

describe('showProjectAdmin', () => {
  enforceDocumentBodyCleanup({checkEveryTest: true}, () => {
    let rootElement, dashboard;

    beforeEach(() => {
      dashboard = {};
      dashboard.project = {};
      dashboard.project.isPublished = sinon.spy();
      dashboard.project.isProjectLevel = sinon.stub();
      dashboard.project.shouldHideShareAndRemix = sinon.stub();
      dashboard.project.getAbuseScore = sinon.stub();
      replaceOnWindow('dashboard', dashboard);

      rootElement = document.createElement('div');
      rootElement.innerHTML = `
      <div class="content">
        <div class="admin-abuse" style="display: none">
          Abuse score:
          <span class="admin-abuse-score"></span>
          <a class="admin-abuse-reset" href="#">Reset</a>
        </div>
        <div class="admin-report-abuse" style="display: none">
          <a href="/report_abuse">Report Abuse</a>
        </div>
      </div>
      `;
      document.body.appendChild(rootElement);
    });

    afterEach(() => {
      document.body.removeChild(rootElement);
      restoreOnWindow('dashboard');
    });


    describe('abuse controls', () => {
      describe('on a project level', () => {
        beforeEach(() => {
          dashboard.project.isProjectLevel.returns(true);
          dashboard.project.shouldHideShareAndRemix.returns(true);
        });
        testAbuseControlBehaviors();
      });

      describe('on a level with a share button', () => {
        beforeEach(() => {
          dashboard.project.isProjectLevel.returns(false);
          dashboard.project.shouldHideShareAndRemix.returns(false);
        });
        testAbuseControlBehaviors();
      });

      describe('on a non-project level with no share button', () => {
        beforeEach(() => {
          dashboard.project.isProjectLevel.returns(false);
          dashboard.project.shouldHideShareAndRemix.returns(true);
        });

        it('shows no abuse controls', () => {
          showProjectAdmin();
          assertHidden('.admin-report-abuse');
          assertHidden('.admin-abuse');
          assertHidden('.admin-abuse-score');
          assertHidden('.admin-abuse-reset');
        });
      });

      function testAbuseControlBehaviors() {
        describe('with zero abuse score', () => {
          beforeEach(() => dashboard.project.getAbuseScore.returns(0));

          it('shows report abuse link', () => {
            showProjectAdmin();
            assertVisible('.admin-report-abuse');
          });

          it('does not show reset abuse control', () => {
            showProjectAdmin();
            assertHidden('.admin-abuse');
            assertHidden('.admin-abuse-score');
            assertHidden('.admin-abuse-reset');
          });
        });

        describe('with a positive abuse score', () => {
          beforeEach(() => dashboard.project.getAbuseScore.returns(10));

          it('does not show report abuse link', () => {
            showProjectAdmin();
            assertHidden('.admin-report-abuse');
          });

          it('shows reset abuse control', () => {
            showProjectAdmin();
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('.admin-abuse-reset');
          });
        });
      }
    });
  });
});
