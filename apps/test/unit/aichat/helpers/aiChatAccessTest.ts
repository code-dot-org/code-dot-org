import {
  shouldShowAiTutor,
  areAiChatToolsEnabled,
  APPS_WITH_ESSENTIAL_AI_CHAT,
} from '@cdo/apps/aichat/helpers/aiChatAccess';

describe('shouldShowAiTutor', () => {
  describe('when app always shows AI tutor (essential tutor apps)', () => {
    it('returns true for weblab2 regardless of pilot or level flags', () => {
      const result = shouldShowAiTutor({
        appName: 'weblab2',
        tutorLevel: false,
        tutorPilot: false,
        aiChatAccessLevel: 'essential_only',
      });
      expect(result).toBe(true);
    });
  });

  describe('when tutorPilot is enabled', () => {
    it('returns true when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: true,
        tutorPilot: true,
        aiChatAccessLevel: 'enabled',
      });
      expect(result).toBe(true);
    });

    it('returns false when tutorLevel is false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: true,
        aiChatAccessLevel: 'enabled',
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
        aiChatAccessLevel: 'enabled',
      });
      expect(result).toBe(false);
    });

    it('returns false when tutorLevel is false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: false,
        tutorPilot: false,
        aiChatAccessLevel: 'enabled',
      });
      expect(result).toBe(false);
    });
  });

  describe('when aiChatAccessLevel is disabled', () => {
    it('returns false even when tutorPilot and tutorLevel are true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        tutorLevel: true,
        tutorPilot: true,
        aiChatAccessLevel: 'disabled',
      });
      expect(result).toBe(false);
    });
  });
});

describe('areAiChatToolsEnabled', () => {
  describe('for apps with essential AI chat (weblab2, aichat)', () => {
    it('returns true when access level is enabled', () => {
      APPS_WITH_ESSENTIAL_AI_CHAT.forEach(appName => {
        expect(
          areAiChatToolsEnabled({appName, aiChatAccessLevel: 'enabled'})
        ).toBe(true);
      });
    });

    it('returns true when access level is essential_only', () => {
      APPS_WITH_ESSENTIAL_AI_CHAT.forEach(appName => {
        expect(
          areAiChatToolsEnabled({
            appName,
            aiChatAccessLevel: 'essential_only',
          })
        ).toBe(true);
      });
    });

    it('returns false when access level is disabled', () => {
      APPS_WITH_ESSENTIAL_AI_CHAT.forEach(appName => {
        expect(
          areAiChatToolsEnabled({appName, aiChatAccessLevel: 'disabled'})
        ).toBe(false);
      });
    });
  });

  describe('for non-essential apps (e.g. applab)', () => {
    it('returns true when access level is enabled', () => {
      expect(
        areAiChatToolsEnabled({
          appName: 'applab',
          aiChatAccessLevel: 'enabled',
        })
      ).toBe(true);
    });

    it('returns false when access level is essential_only', () => {
      expect(
        areAiChatToolsEnabled({
          appName: 'applab',
          aiChatAccessLevel: 'essential_only',
        })
      ).toBe(false);
    });

    it('returns false when access level is disabled', () => {
      expect(
        areAiChatToolsEnabled({
          appName: 'applab',
          aiChatAccessLevel: 'disabled',
        })
      ).toBe(false);
    });
  });
});
