import {adaptiveAccess} from '@cdo/apps/adaptive/views/access/adaptiveAccess';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

describe('adaptiveAccess', () => {
  it('waits until the current user has loaded', () => {
    expect(
      adaptiveAccess({
        aiChatAccessLevel: undefined,
        userType: 'unknown',
        inSection: null,
      })
    ).toBe('pending');
  });

  it.each([AiChatAccessLevels.ENABLED, AiChatAccessLevels.ESSENTIAL_ONLY])(
    'allows %s access for students and teachers alike',
    level => {
      expect(
        adaptiveAccess({
          aiChatAccessLevel: level,
          userType: 'student',
          inSection: true,
        })
      ).toBe('allowed');
      expect(
        adaptiveAccess({
          aiChatAccessLevel: level,
          userType: 'teacher',
          inSection: null,
        })
      ).toBe('allowed');
    }
  );

  it('sends a teacher without AI access to the verification screen', () => {
    expect(
      adaptiveAccess({
        aiChatAccessLevel: AiChatAccessLevels.DISABLED,
        userType: 'teacher',
        inSection: null,
      })
    ).toBe('unverifiedTeacher');
  });

  it('tells a sectioned student their class lacks access', () => {
    expect(
      adaptiveAccess({
        aiChatAccessLevel: AiChatAccessLevels.DISABLED,
        userType: 'student',
        inSection: true,
      })
    ).toBe('studentNoAccess');
  });

  it('tells an unsectioned student to join a class', () => {
    expect(
      adaptiveAccess({
        aiChatAccessLevel: AiChatAccessLevels.DISABLED,
        userType: 'student',
        inSection: false,
      })
    ).toBe('studentNoSection');
  });
});
