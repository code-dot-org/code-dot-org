import {
  shouldShowAiTutor,
  APPS_ALWAYS_USING_AI_TUTOR,
} from '@cdo/apps/aiTutor/helpers/shouldShowAiTutor';

describe('shouldShowAiTutor', () => {
  describe('when app is always using AI tutor', () => {
    it('returns true for any app in APPS_ALWAYS_USING_AI_TUTOR', () => {
      APPS_ALWAYS_USING_AI_TUTOR.forEach(appName => {
        const result = shouldShowAiTutor({
          appName,
          tutorLevel: false,
          tutorPilot: false,
          isProjectLevel: false,
        });
        expect(result).toBe(true);
      });
    });
  });

  describe('when tutorPilot is enabled', () => {
    it('returns true when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: true,
        tutorPilot: true,
        isProjectLevel: false,
      });
      expect(result).toBe(true);
    });

    it('returns true when isProjectLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: true,
        isProjectLevel: true,
      });
      expect(result).toBe(true);
    });

    it('returns false when both tutorLevel and isProjectLevel are false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: true,
        isProjectLevel: false,
      });
      expect(result).toBe(false);
    });
  });

  describe('when tutorPilot is disabled', () => {
    it('returns false even when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: true,
        tutorPilot: false,
        isProjectLevel: false,
      });
      expect(result).toBe(false);
    });

    it('returns false even when isProjectLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: false,
        isProjectLevel: true,
      });
      expect(result).toBe(false);
    });
  });
});
