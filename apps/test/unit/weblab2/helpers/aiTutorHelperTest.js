import experiments from '@cdo/apps/util/experiments';
import {getPromptNameFromMode} from '@cdo/apps/weblab2/helpers/aiTutorHelper';

describe('getPromptNameFromMode with Langfuse experiment', () => {
  beforeEach(() => {
    experiments.setEnabled(experiments.USE_LANGFUSE_PROMPT, true);
  });

  afterEach(() => {
    experiments.setEnabled(experiments.USE_LANGFUSE_PROMPT, false);
  });

  it('returns default prompt name for undefined', () => {
    expect(getPromptNameFromMode(undefined)).toBe('modes/engineer');
  });

  it('returns default prompt name for invalid mode', () => {
    expect(getPromptNameFromMode('invalid')).toBe('modes/engineer');
    expect(getPromptNameFromMode('')).toBe('modes/engineer');
  });

  it('returns correct prompt name for valid modes', () => {
    expect(getPromptNameFromMode('engineer')).toBe('modes/engineer');
    expect(getPromptNameFromMode('designer')).toBe('modes/designer');
    expect(getPromptNameFromMode('tutor')).toBe('modes/tutor');
    expect(getPromptNameFromMode('qa')).toBe('modes/qa');
    expect(getPromptNameFromMode('debug')).toBe('modes/debug');
  });
});

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
