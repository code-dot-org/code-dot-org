import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {TestResults} from '@cdo/apps/constants';
import FeedbackUtils from '@cdo/apps/feedback';
import msg from '@cdo/locale';

import {assert} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('FeedbackUtils', () => {
  describe('getFeedbackMessage', () => {
    let feedbackUtils;

    beforeEach(() => {
      feedbackUtils = new FeedbackUtils({} /* studioApp */);
    });

    describe('successful test result', () => {
      describe('on freeplay', () => {
        let options;
        const finalStageMsg = 'Final stage!';
        const nextStageMsg = 'Next stage!';
        const nextLevelMsg = 'Next level!';
        const endOfLesson = 'End of lesson!';

        beforeEach(() => {
          options = {
            feedbackType: TestResults.FREE_PLAY,
            level: {
              validationEnabled: true,
            },
            appStrings: {
              reinfFeedbackMsg: "You're finished!",
            },
          };

          sinon.stub(msg, 'finalStage').callsFake(() => finalStageMsg);
          sinon.stub(msg, 'endOfLesson').callsFake(() => endOfLesson);
          sinon.stub(msg, 'nextStage').callsFake(() => nextStageMsg);
          sinon.stub(msg, 'nextLevel').callsFake(() => nextLevelMsg);
        });

        afterEach(() => {
          sinon.restore();
        });

        describe('with sharing enabled', () => {
          it('returns appStrings.reinfFeedbackMsg if final lesson message disabled', () => {
            options.level.disableFinalLessonMessage = true;
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              options.appStrings.reinfFeedbackMsg
            );
          });

          it('returns final stage and appStrings.reinfFeedbackMsg if final level', () => {
            options.level.isLastLevelInLesson = true;
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              `${finalStageMsg} ${options.appStrings.reinfFeedbackMsg}`
            );

            // Gracefully handles missing reinfFeedbackMsg.
            options.appStrings.reinfFeedbackMsg = null;
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              `${finalStageMsg} `
            );
          });

          it('returns end of lesson message if final level and level.showEndOfLessonMsgs is true', () => {
            options.level.isLastLevelInLesson = true;
            options.level.showEndOfLessonMsgs = true;
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              endOfLesson
            );
          });

          it('returns appStrings.reinfFeedbackMsg if not final level', () => {
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              options.appStrings.reinfFeedbackMsg
            );
          });
        });

        describe('with sharing disabled', () => {
          beforeEach(() => {
            options.level.disableSharing = true;
          });

          it('returns final stage message if final level', () => {
            options.level.isLastLevelInLesson = true;
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              finalStageMsg
            );
          });

          it('returns final stage message if final level and level.showEndOfLessonMsgs is true', () => {
            options.level.isLastLevelInLesson = true;
            options.level.showEndOfLessonMsgs = true;
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              endOfLesson
            );
          });

          it('returns next stage message if lesson completed', () => {
            options.response = {
              lesson_changing: {previous: {name: 'Lesson Name'}},
            };
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              nextStageMsg
            );
          });

          it('returns next level message if lesson not completed', () => {
            assert.equal(
              feedbackUtils.getFeedbackMessage(options),
              nextLevelMsg
            );
          });
        });
      });
    });
  });
});
