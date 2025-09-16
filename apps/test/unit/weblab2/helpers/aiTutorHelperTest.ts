import {
  getPromptNameFromMode,
  getPromptOptionsFromModes,
} from '@cdo/apps/weblab2/helpers/aiTutorHelper';
import weblab2I18n from '@cdo/apps/weblab2/locale';

describe('getPromptNameFromMode', () => {
  it('returns default prompt name for undefined', () => {
    expect(getPromptNameFromMode(undefined)).toBe('weblab2-suggest');
  });

  it('returns default prompt name for invalid mode', () => {
    expect(getPromptNameFromMode('invalid')).toBe('weblab2-suggest');
    expect(getPromptNameFromMode('')).toBe('weblab2-suggest');
  });

  it('returns correct prompt name for valid modes', () => {
    expect(getPromptNameFromMode('suggest')).toBe('weblab2-suggest');
    expect(getPromptNameFromMode('outline')).toBe('weblab2-outline');
    expect(getPromptNameFromMode('guide')).toBe('weblab2-guide');
    expect(getPromptNameFromMode('produce')).toBe('weblab2-produce');
  });
});

describe('getPromptOptionsFromModes', () => {
  it('returns correct options for valid modes', () => {
    const options = getPromptOptionsFromModes([
      'suggest',
      'outline',
      'guide',
      'produce',
    ]);
    expect(options).toEqual([
      {
        displayName: weblab2I18n.suggest(),
        icon: {iconName: 'comment-dots'},
        promptName: 'weblab2-suggest',
      },
      {
        displayName: weblab2I18n.outline(),
        icon: {iconName: 'diagram-project'},
        promptName: 'weblab2-outline',
      },
      {
        displayName: weblab2I18n.guide(),
        icon: {iconName: 'compass'},
        promptName: 'weblab2-guide',
      },
      {
        displayName: weblab2I18n.produce(),
        icon: {iconName: 'hammer'},
        promptName: 'weblab2-produce',
      },
    ]);
  });

  it('ignores invalid modes', () => {
    const options = getPromptOptionsFromModes(['suggest', 'invalid', 'guide']);
    expect(options).toEqual([
      {
        displayName: weblab2I18n.suggest(),
        icon: {iconName: 'comment-dots'},
        promptName: 'weblab2-suggest',
      },
      {
        displayName: weblab2I18n.guide(),
        icon: {iconName: 'compass'},
        promptName: 'weblab2-guide',
      },
    ]);
  });

  it('returns default option if all modes are invalid', () => {
    const options = getPromptOptionsFromModes(['foo', 'bar']);
    expect(options).toEqual([
      {
        displayName: weblab2I18n.suggest(),
        icon: {iconName: 'comment-dots'},
        promptName: 'weblab2-suggest',
      },
    ]);
  });

  it('returns default option if modes is empty', () => {
    const options = getPromptOptionsFromModes([]);
    expect(options).toEqual([
      {
        displayName: weblab2I18n.suggest(),
        icon: {iconName: 'comment-dots'},
        promptName: 'weblab2-suggest',
      },
    ]);
  });
});
