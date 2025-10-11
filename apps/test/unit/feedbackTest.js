import {TestResults} from '@cdo/apps/constants';
import FeedbackUtils from '@cdo/apps/feedback';
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

          jest.spyOn(msg, 'finalStage').mockImplementation(() => finalStageMsg);
          jest.spyOn(msg, 'endOfLesson').mockImplementation(() => endOfLesson);
          jest.spyOn(msg, 'nextStage').mockImplementation(() => nextStageMsg);
          jest.spyOn(msg, 'nextLevel').mockImplementation(() => nextLevelMsg);
        });

        afterEach(() => {
          jest.restoreAllMocks();
        });

        describe('with sharing enabled', () => {
          it('returns appStrings.reinfFeedbackMsg if final lesson message disabled', () => {
            options.level.disableFinalLessonMessage = true;
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(
              options.appStrings.reinfFeedbackMsg
            );
          });

          it('returns final stage and appStrings.reinfFeedbackMsg if final level', () => {
            options.level.isLastLevelInLesson = true;
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(
              `${finalStageMsg} ${options.appStrings.reinfFeedbackMsg}`
            );

            // Gracefully handles missing reinfFeedbackMsg.
            options.appStrings.reinfFeedbackMsg = null;
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(
              `${finalStageMsg} `
            );
          });

          it('returns end of lesson message if final level and level.showEndOfLessonMsgs is true', () => {
            options.level.isLastLevelInLesson = true;
            options.level.showEndOfLessonMsgs = true;
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(endOfLesson);
          });

          it('returns appStrings.reinfFeedbackMsg if not final level', () => {
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(
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
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(
              finalStageMsg
            );
          });

          it('returns final stage message if final level and level.showEndOfLessonMsgs is true', () => {
            options.level.isLastLevelInLesson = true;
            options.level.showEndOfLessonMsgs = true;
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(endOfLesson);
          });

          it('returns next stage message if lesson completed', () => {
            options.response = {
              lesson_changing: {previous: {name: 'Lesson Name'}},
            };
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(
              nextStageMsg
            );
          });

          it('returns next level message if lesson not completed', () => {
            expect(feedbackUtils.getFeedbackMessage(options)).toBe(
              nextLevelMsg
            );
          });
        });
      });
    });
  });
});
