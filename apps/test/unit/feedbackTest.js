import {assert} from '../util/reconfiguredChai';
import FeedbackUtils from '@cdo/apps/feedback';
import {TestResults} from '@cdo/apps/constants';
import msg from '@cdo/locale';

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

          jest
            .spyOn(msg, 'finalStage')
            .mockClear()
            .mockImplementation(() => finalStageMsg);
          jest
            .spyOn(msg, 'endOfLesson')
            .mockClear()
            .mockImplementation(() => endOfLesson);
          jest
            .spyOn(msg, 'nextStage')
            .mockClear()
            .mockImplementation(() => nextStageMsg);
          jest
            .spyOn(msg, 'nextLevel')
            .mockClear()
            .mockImplementation(() => nextLevelMsg);
        });

        afterEach(() => {
          jest.restoreAllMocks();
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
