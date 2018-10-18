import sinon from 'sinon';
import {assertVisible, assertHidden} from '../../util/assertions';
import showProjectAdmin from '@cdo/apps/code-studio/showProjectAdmin';
import {enforceDocumentBodyCleanup} from "../../util/testUtils";

describe('showProjectAdmin', () => {
  enforceDocumentBodyCleanup({checkEveryTest: true}, () => {
    let rootElement, project;

    beforeEach(() => {
      project = {
        isPublished: sinon.spy(),
        isProjectLevel: sinon.stub(),
        shouldHideShareAndRemix: sinon.stub(),
        getAbuseScore: sinon.stub(),
      };

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
    });


    describe('abuse controls', () => {
      describe('on a project level', () => {
        beforeEach(() => {
          project.isProjectLevel.returns(true);
          project.shouldHideShareAndRemix.returns(true);
        });
        testAbuseControlBehaviors();
      });

      describe('on a level with a share button', () => {
        beforeEach(() => {
          project.isProjectLevel.returns(false);
          project.shouldHideShareAndRemix.returns(false);
        });
        testAbuseControlBehaviors();
      });

      describe('on a non-project level with no share button', () => {
        beforeEach(() => {
          project.isProjectLevel.returns(false);
          project.shouldHideShareAndRemix.returns(true);
        });

        it('shows no abuse controls', () => {
          showProjectAdmin(project);
          assertHidden('.admin-report-abuse');
          assertHidden('.admin-abuse');
          assertHidden('.admin-abuse-score');
          assertHidden('.admin-abuse-reset');
        });
      });

      function testAbuseControlBehaviors() {
        describe('with zero abuse score', () => {
          beforeEach(() => project.getAbuseScore.returns(0));

          it('shows report abuse link', () => {
            showProjectAdmin(project);
            assertVisible('.admin-report-abuse');
          });

          it('does not show reset abuse control', () => {
            showProjectAdmin(project);
            assertHidden('.admin-abuse');
            assertHidden('.admin-abuse-score');
            assertHidden('.admin-abuse-reset');
          });
        });

        describe('with a positive abuse score', () => {
          beforeEach(() => project.getAbuseScore.returns(10));

          it('does not show report abuse link', () => {
            showProjectAdmin(project);
            assertHidden('.admin-report-abuse');
          });

          it('shows reset abuse control', () => {
            showProjectAdmin(project);
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('.admin-abuse-reset');
          });
        });
      }
    });
  });
});
