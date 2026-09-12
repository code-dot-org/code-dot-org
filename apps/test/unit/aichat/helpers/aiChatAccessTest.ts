import {
  shouldShowAiTutor,
  areAiChatToolsEnabled,
  APPS_WITH_ESSENTIAL_AI_CHAT,
} from '@cdo/apps/aichat/helpers/aiChatAccess';

describe('shouldShowAiTutor', () => {
  describe('when app always shows AI tutor (essential tutor apps)', () => {
    it('returns true for weblab2 regardless of level flags', () => {
      const result = shouldShowAiTutor({
        appName: 'weblab2',
        isTutorLevel: false,
        aiChatAccessLevel: 'essential_only',
      });
      expect(result).toBe(true);
    });
  });

  describe('when tutorPilot is enabled', () => {
    it('returns true when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        isTutorLevel: true,
        aiChatAccessLevel: 'enabled',
      });
      expect(result).toBe(true);
    });

    it('returns false when tutorLevel is false', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        isTutorLevel: false,
        aiChatAccessLevel: 'enabled',
      });
      expect(result).toBe(false);
    });
  });

  describe('when aiChatAccessLevel is disabled', () => {
    it('returns false even when tutorLevel is true', () => {
      const result = shouldShowAiTutor({
        appName: 'applab',
        isTutorLevel: true,
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

  describe("for a Web Lab 2 level whose AI Tutor is only 'available'", () => {
    const availableLevel = {
      appName: 'weblab2',
      aiTutorDependency: 'available' as const,
    };

    it('returns true when access level is enabled', () => {
      expect(
        areAiChatToolsEnabled({...availableLevel, aiChatAccessLevel: 'enabled'})
      ).toBe(true);
    });

    // The level does not require the tutor, so a section limited to the tools
    // its curriculum requires does not get it here.
    it('returns false when access level is essential_only', () => {
      expect(
        areAiChatToolsEnabled({
          ...availableLevel,
          aiChatAccessLevel: 'essential_only',
        })
      ).toBe(false);
    });

    it('returns false when access level is disabled', () => {
      expect(
        areAiChatToolsEnabled({
          ...availableLevel,
          aiChatAccessLevel: 'disabled',
        })
      ).toBe(false);
    });

    it("returns true under essential_only when the level is 'essential'", () => {
      expect(
        areAiChatToolsEnabled({
          appName: 'weblab2',
          aiTutorDependency: 'essential',
          aiChatAccessLevel: 'essential_only',
        })
      ).toBe(true);
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
