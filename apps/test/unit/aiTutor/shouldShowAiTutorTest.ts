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
      });
      expect(result).toBe(true);
    });

    it('returns false when tutorLevel is false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: true,
      });
      expect(result).toBe(false);
    });
  });

  describe('when tutorPilot is disabled', () => {
    it('returns false when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: true,
        tutorPilot: false,
      });
      expect(result).toBe(false);
    });

    it('returns false when tutorLevel is false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: false,
      });
      expect(result).toBe(false);
    });
  });
});
