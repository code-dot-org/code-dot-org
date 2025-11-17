import {getPromptNameFromMode} from '@cdo/apps/weblab2/helpers/aiTutorHelper';

describe('getPromptNameFromMode', () => {
  it('returns default prompt name for undefined', () => {
    expect(getPromptNameFromMode(undefined)).toBe(
      'weblab2-engineer-structured'
    );
  });

  it('returns default prompt name for invalid mode', () => {
    expect(getPromptNameFromMode('invalid')).toBe(
      'weblab2-engineer-structured'
    );
    expect(getPromptNameFromMode('')).toBe('weblab2-engineer-structured');
  });

  it('returns correct prompt name for valid modes', () => {
    expect(getPromptNameFromMode('suggest')).toBe('weblab2-suggest-structured');
    expect(getPromptNameFromMode('outline')).toBe('weblab2-outline-structured');
    expect(getPromptNameFromMode('guide')).toBe('weblab2-guide-structured');
    expect(getPromptNameFromMode('produce')).toBe('weblab2-produce-structured');
    expect(getPromptNameFromMode('engineer')).toBe(
      'weblab2-engineer-structured'
    );
    expect(getPromptNameFromMode('qa')).toBe('weblab2-qa-structured');
    expect(getPromptNameFromMode('designer')).toBe(
      'weblab2-designer-structured'
    );
    expect(getPromptNameFromMode('tutor')).toBe('weblab2-tutor-structured');
  });
});
