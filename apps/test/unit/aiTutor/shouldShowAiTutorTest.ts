import {
  shouldShowAiTutor,
  APPS_WITH_ESSENTIAL_AI_CHAT,
} from '@cdo/apps/aichat/helpers/aiChatAccess';
import experiments from '@cdo/apps/util/experiments';

describe('shouldShowAiTutor', () => {
  describe('when app is always using AI tutor', () => {
    it('returns true for any app in APPS_ALWAYS_USING_AI_TUTOR', () => {
      APPS_WITH_ESSENTIAL_AI_CHAT.forEach(appName => {
        const result = shouldShowAiTutor({
          appName,
          tutorLevel: false,
        });
        expect(result).toBe(true);
      });
    });
  });

  describe('when AI_CHAT_NEW_PERMISSIONS experiment is enabled', () => {
    beforeEach(() => {
      jest.spyOn(experiments, 'isEnabled').mockReturnValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns true when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: true,
      });
      expect(result).toBe(true);
    });

    it('returns false when tutorLevel is false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
      });
      expect(result).toBe(false);
    });
  });

  describe('when AI_CHAT_NEW_PERMISSIONS experiment is disabled', () => {
    beforeEach(() => {
      jest.spyOn(experiments, 'isEnabled').mockReturnValue(false);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns false when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: true,
      });
      expect(result).toBe(false);
    });

    it('returns false when tutorLevel is false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
      });
      expect(result).toBe(false);
    });
  });
});
