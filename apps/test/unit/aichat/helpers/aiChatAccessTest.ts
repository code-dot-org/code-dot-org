import {
  shouldShowAiTutor,
  areAiChatToolsEnabled,
  shouldShowUsOnlyModelsAlert,
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

describe('shouldShowUsOnlyModelsAlert', () => {
  const blockedUnits = {
    aichatUnitTitles: ['Thinking Critically About AI'],
    aiTutor: false,
    assignedUnitCount: 9,
  };

  it('returns true when the course requires AI chat and a unit is blocked', () => {
    expect(
      shouldShowUsOnlyModelsAlert({
        assignedAiChatToolsDependency: 'essential',
        assignedUsOnlyAiModels: blockedUnits,
      })
    ).toBe(true);
  });

  it('returns false when the course requires AI chat but nothing is blocked', () => {
    expect(
      shouldShowUsOnlyModelsAlert({
        assignedAiChatToolsDependency: 'essential',
        assignedUsOnlyAiModels: undefined,
      })
    ).toBe(false);
  });

  // Losing the tutor leaves every level completable, so it is not badge-worthy.
  it('returns false when only AI Tutor is unavailable', () => {
    expect(
      shouldShowUsOnlyModelsAlert({
        assignedAiChatToolsDependency: 'essential',
        assignedUsOnlyAiModels: {
          aichatUnitTitles: [],
          aiTutor: true,
          assignedUnitCount: 9,
        },
      })
    ).toBe(false);
  });

  // Optional AI chat is not worth warning about: the course is still completable.
  it('returns false when AI chat is only available, not essential', () => {
    expect(
      shouldShowUsOnlyModelsAlert({
        assignedAiChatToolsDependency: 'available',
        assignedUsOnlyAiModels: blockedUnits,
      })
    ).toBe(false);
  });

  it('returns false when the section has no assigned course', () => {
    expect(
      shouldShowUsOnlyModelsAlert({
        assignedAiChatToolsDependency: undefined,
        assignedUsOnlyAiModels: undefined,
      })
    ).toBe(false);
  });
});
