import {
  shouldShowAiTutor,
  areAiChatToolsEnabled,
  shouldShowAiChatEssentialAlert,
  APPS_WITH_ESSENTIAL_AI_CHAT,
} from '@cdo/apps/aichat/helpers/aiChatAccess';
import {AiChatToolsDependency} from '@cdo/generated-scripts/sharedConstants';

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

describe('shouldShowAiChatEssentialAlert', () => {
  // A section assigned a course that requires AI chat tools, with those tools
  // turned off for the section: the case the alert exists for.
  const essentialAndUnavailable = {
    assignedAiChatToolsDependency: AiChatToolsDependency.ESSENTIAL,
    sectionAiChatAccessLevel: 'disabled' as const,
    teacherAiChatAccessLevel: 'enabled' as const,
  };

  it('returns true when the assigned course requires AI chat tools the section cannot use', () => {
    expect(shouldShowAiChatEssentialAlert(essentialAndUnavailable)).toBe(true);
  });

  it('returns true when the teacher is unverified rather than the section disabled', () => {
    expect(
      shouldShowAiChatEssentialAlert({
        ...essentialAndUnavailable,
        sectionAiChatAccessLevel: 'enabled',
        teacherAiChatAccessLevel: 'disabled',
      })
    ).toBe(true);
  });

  it('returns false when the course does not require AI chat tools', () => {
    expect(
      shouldShowAiChatEssentialAlert({
        ...essentialAndUnavailable,
        assignedAiChatToolsDependency: AiChatToolsDependency.AVAILABLE,
      })
    ).toBe(false);
  });

  it('returns true for a course that is not exempt', () => {
    expect(
      shouldShowAiChatEssentialAlert({
        ...essentialAndUnavailable,
        courseVersionName: 'aif-2026',
        unitName: 'aif-2026-u1',
      })
    ).toBe(true);
  });

  // 'csd-2026' and 'csd2-2026' come from the exempt-curriculum list in
  // lib/cdo/shared_constants.rb.
  it('returns false when the assigned course is exempt', () => {
    expect(
      shouldShowAiChatEssentialAlert({
        ...essentialAndUnavailable,
        courseVersionName: 'csd-2026',
        unitName: 'csd2-2026',
      })
    ).toBe(false);
  });

  it('returns false when only the assigned unit is exempt', () => {
    expect(
      shouldShowAiChatEssentialAlert({
        ...essentialAndUnavailable,
        courseVersionName: null,
        unitName: 'csd2-2026',
      })
    ).toBe(false);
  });
});
