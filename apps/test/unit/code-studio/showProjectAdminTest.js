import showProjectAdmin from '@cdo/apps/code-studio/showProjectAdmin'; // eslint-disable-line no-restricted-imports

import {assertVisible, assertHidden} from '../../util/assertions';
import {enforceDocumentBodyCleanup} from '../../util/testUtils';

describe('showProjectAdmin', () => {
  enforceDocumentBodyCleanup({checkEveryTest: true}, () => {
    let rootElement, project;

    beforeEach(() => {
      project = {
        isPublished: jest.fn(),
        isProjectLevel: jest.fn(),
        shouldHideShareAndRemix: jest.fn(),
        getAbuseScore: jest.fn(),
        exceedsAbuseThreshold: jest.fn(),
        getSharingDisabled: jest.fn(),
        hasPrivacyProfanityViolation: jest.fn(),
        privacyProfanityDetailsEnglish: jest.fn(),
        privacyProfanityDetailsIntl: jest.fn(),
        privacyProfanitySecondLanguage: jest.fn(),
      };

      rootElement = document.createElement('div');
      rootElement.innerHTML = `
      <div class="content">
        <div class="admin-project-sharing">
          <div class="unblocked" style="display: none">
            This project is safe to share.
          </div>
          <div class="blocked" style="display: none">
            This project is blocked from sharing.
          </div>
        </div>
        <ul class="blocked-reasons" style= "display: none">
          <li class="admin-sharing" style="display: none">
            Sharing is disabled
          </li>
          <li class="privacy-profanity" style="display: none">
            Private or profane text
            <div class="privacy-profanity-details-english" style="display: none">
              English:
              <span class=".eng-flagged-text"></span>
            </div>
            <div class="privacy-profanity-details-intl" style="display: none">
              Language:
              <span class=".intl-flagged-language"></span>
              Flagged content:
              <span class=".intl-flagged-text"></span>
            </div>
          </li>
          <li class="abusive-image" style="display: none">
            Inappropriate image
          </li>
          <li class="reported-abuse" style="display: none">
            Manually reported abusive
          </li>
        </ul>
        <div class="admin-abuse">
          Abuse score:
          <span class="admin-abuse-score"></span>
          <button id="admin-abuse-reset" href="#">Reset</button>
          <button id="admin-abuse-buffer" href="#">Buffer</button>
        </div>
        <div class="admin-report-abuse">
          <a href="/report_abuse">Report Abuse</a>
        </div>
      </div>`;
      document.body.appendChild(rootElement);
    });

    afterEach(() => {
      document.body.removeChild(rootElement);
    });

    describe('abuse controls', () => {
      describe('on a project level', () => {
        beforeEach(() => {
          project.isProjectLevel.mockReturnValue(true);
          project.shouldHideShareAndRemix.mockReturnValue(true);
        });
        testAbuseControlBehaviors();
      });

      describe('on a level with a share button', () => {
        beforeEach(() => {
          project.isProjectLevel.mockReturnValue(false);
          project.shouldHideShareAndRemix.mockReturnValue(false);
        });
        testAbuseControlBehaviors();
      });

      describe('on a non-project level with no share button', () => {
        beforeEach(() => {
          project.isProjectLevel.mockReturnValue(false);
          project.shouldHideShareAndRemix.mockReturnValue(true);
        });

        it('does not show sharing and abuse information', () => {
          showProjectAdmin(project);
          assertHidden('.unblocked');
          assertHidden('.blocked');
          assertHidden('.blocked-reasons');
          assertHidden('.admin-sharing');
          assertHidden('.privacy-profanity');
          assertHidden('.abusive-image');
          assertHidden('.reported-abuse');
        });
      });

      function testAbuseControlBehaviors() {
        describe('project is safe to share', () => {
          beforeEach(() => {
            project.getAbuseScore.mockReturnValue(0);
            project.exceedsAbuseThreshold.mockReturnValue(false);
            project.hasPrivacyProfanityViolation.mockReturnValue(false);
            project.getSharingDisabled.mockReturnValue(false);
          });

          it('shows sharing unblocked message', () => {
            showProjectAdmin(project);
            assertVisible('.unblocked');
            assertHidden('.blocked');
          });

          it('does not show sharing blocked reasons', () => {
            showProjectAdmin(project);
            assertHidden('.blocked-reasons');
            assertHidden('.admin-sharing');
            assertHidden('.privacy-profanity');
            assertHidden('.abusive-image');
            assertHidden('.reported-abuse');
          });

          it('shows report abuse link', () => {
            showProjectAdmin(project);
            assertVisible('.admin-report-abuse');
          });

          it('shows reset and buffer abuse control', () => {
            showProjectAdmin(project);
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('#admin-abuse-reset');
            assertVisible('#admin-abuse-buffer');
          });
        });

        describe('sharing is disabled', () => {
          beforeEach(() => {
            project.getAbuseScore.mockReturnValue(0);
            project.exceedsAbuseThreshold.mockReturnValue(false);
            project.hasPrivacyProfanityViolation.mockReturnValue(false);
            project.getSharingDisabled.mockReturnValue(true);
          });

          it('shows sharing blocked message', () => {
            showProjectAdmin(project);
            assertVisible('.blocked');
            assertHidden('.unblocked');
          });

          it('shows sharing blocked reasons, sharing disabled', () => {
            showProjectAdmin(project);
            assertVisible('.blocked-reasons');
            assertVisible('.admin-sharing');
            assertHidden('.privacy-profanity');
            assertHidden('.abusive-image');
            assertHidden('.reported-abuse');
          });

          it('shows report abuse link', () => {
            showProjectAdmin(project);
            assertVisible('.admin-report-abuse');
          });

          it('shows reset and buffer abuse control', () => {
            showProjectAdmin(project);
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('#admin-abuse-reset');
            assertVisible('#admin-abuse-buffer');
          });
        });

        describe('text moderation flagged project - English', () => {
          beforeEach(() => {
            project.getAbuseScore.mockReturnValue(0);
            project.exceedsAbuseThreshold.mockReturnValue(false);
            project.hasPrivacyProfanityViolation.mockReturnValue(true);
            project.getSharingDisabled.mockReturnValue(false);
            project.privacyProfanityDetailsEnglish.mockReturnValue('fu');
          });

          it('shows sharing blocked message', () => {
            showProjectAdmin(project);
            assertVisible('.blocked');
            assertHidden('.unblocked');
          });

          it('shows sharing blocked reasons, privacy or profanity', () => {
            showProjectAdmin(project);
            assertVisible('.blocked-reasons');
            assertHidden('.admin-sharing');
            assertVisible('.privacy-profanity');
            assertVisible('.privacy-profanity-details-english');
            assertHidden('.abusive-image');
            assertHidden('.reported-abuse');
          });

          it('shows report abuse link', () => {
            showProjectAdmin(project);
            assertVisible('.admin-report-abuse');
          });

          it('shows reset and buffer abuse control', () => {
            showProjectAdmin(project);
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('#admin-abuse-reset');
            assertVisible('#admin-abuse-buffer');
          });
        });

        describe('text moderation flagged project - Intl', () => {
          beforeEach(() => {
            project.getAbuseScore.mockReturnValue(0);
            project.exceedsAbuseThreshold.mockReturnValue(false);
            project.hasPrivacyProfanityViolation.mockReturnValue(true);
            project.getSharingDisabled.mockReturnValue(false);
            project.privacyProfanityDetailsIntl.mockReturnValue('fu');
            project.privacyProfanitySecondLanguage.mockReturnValue('it');
          });

          it('shows sharing blocked message', () => {
            showProjectAdmin(project);
            assertVisible('.blocked');
            assertHidden('.unblocked');
          });

          it('shows sharing blocked reasons, privacy or profanity', () => {
            showProjectAdmin(project);
            assertVisible('.blocked-reasons');
            assertHidden('.admin-sharing');
            assertVisible('.privacy-profanity');
            assertVisible('.privacy-profanity-details-intl');
            assertHidden('.abusive-image');
            assertHidden('.reported-abuse');
          });

          it('shows report abuse link', () => {
            showProjectAdmin(project);
            assertVisible('.admin-report-abuse');
          });

          it('shows reset and buffer abuse control', () => {
            showProjectAdmin(project);
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('#admin-abuse-reset');
            assertVisible('#admin-abuse-buffer');
          });
        });

        describe('image moderation flagged project', () => {
          beforeEach(() => {
            project.getAbuseScore.mockReturnValue(15);
            project.exceedsAbuseThreshold.mockReturnValue(true);
            project.hasPrivacyProfanityViolation.mockReturnValue(false);
            project.getSharingDisabled.mockReturnValue(false);
          });

          it('shows sharing blocked message', () => {
            showProjectAdmin(project);
            assertVisible('.blocked');
            assertHidden('.unblocked');
          });

          it('shows sharing blocked reasons, abusive image', () => {
            showProjectAdmin(project);
            assertVisible('.blocked-reasons');
            assertHidden('.admin-sharing');
            assertHidden('.privacy-profanity');
            assertVisible('.abusive-image');
            assertHidden('.reported-abuse');
          });

          it('shows report abuse link', () => {
            showProjectAdmin(project);
            assertVisible('.admin-report-abuse');
          });

          it('shows reset abuse control', () => {
            showProjectAdmin(project);
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('#admin-abuse-reset');
            assertVisible('#admin-abuse-buffer');
          });
        });

        describe('with a manually reported positive abuse score above threshold', () => {
          beforeEach(() => {
            project.getAbuseScore.mockReturnValue(20);
            project.exceedsAbuseThreshold.mockReturnValue(true);
            project.hasPrivacyProfanityViolation.mockReturnValue(false);
            project.getSharingDisabled.mockReturnValue(false);
          });

          it('shows sharing blocked message', () => {
            showProjectAdmin(project);
            assertVisible('.blocked');
            assertHidden('.unblocked');
          });

          it('shows sharing blocked reasons, reported abuse', () => {
            showProjectAdmin(project);
            assertVisible('.blocked-reasons');
            assertHidden('.admin-sharing');
            assertHidden('.privacy-profanity');
            assertHidden('.abusive-image');
            assertVisible('.reported-abuse');
          });

          it('shows report abuse link', () => {
            showProjectAdmin(project);
            assertVisible('.admin-report-abuse');
          });

          it('shows reset abuse control', () => {
            showProjectAdmin(project);
            assertVisible('.admin-abuse');
            assertVisible('.admin-abuse-score');
            assertVisible('#admin-abuse-reset');
            assertVisible('#admin-abuse-buffer');
          });
        });
      }
    });
  });
});
