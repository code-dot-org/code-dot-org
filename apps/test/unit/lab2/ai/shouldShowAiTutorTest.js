import {queryParams} from '@cdo/apps/code-studio/utils';

import {
  shouldShowAiTutor,
  APPS_ALWAYS_USING_AI_TUTOR,
} from '../../../../src/lab2/ai/shouldShowAiTutor';

jest.mock('@cdo/apps/code-studio/utils', () => ({
  queryParams: jest.fn(),
}));

describe('shouldShowAiTutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock returns undefined
    queryParams.mockReturnValue(undefined);
  });

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

  describe('when show-ai-tutor2 query parameter is true', () => {
    it('returns true regardless of other parameters', () => {
      queryParams.mockImplementation(param => {
        if (param === 'show-ai-tutor2') return 'true';
        return undefined;
      });

      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: false,
        isProjectLevel: false,
      });
      expect(result).toBe(true);
    });
  });

  describe('when show-ai-tutor query parameter is true', () => {
    it('returns true regardless of other parameters', () => {
      queryParams.mockImplementation(param => {
        if (param === 'show-ai-tutor') return 'true';
        return undefined;
      });

      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: false,
        isProjectLevel: false,
      });
      expect(result).toBe(true);
    });
  });
});
