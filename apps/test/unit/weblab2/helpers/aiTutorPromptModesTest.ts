import {JsonObjectSchema} from '@cdo/apps/aichat/types';
import {getBuildAndAskPromptModes} from '@cdo/apps/weblab2/helpers/aiTutorPromptModes';
import askInstructions from '@cdo/apps/weblab2/prompts/chatModes/ask.md';
import buildInstructions from '@cdo/apps/weblab2/prompts/chatModes/build.md';

const answerSchema = (schema: object | undefined) =>
  (schema as JsonObjectSchema).properties.answer as JsonObjectSchema;

describe('getBuildAndAskPromptModes', () => {
  const {modes, defaultValue} = getBuildAndAskPromptModes(undefined, []);
  const [build, ask] = modes;

  it('offers Build and Ask, with Ask on Enter', () => {
    expect(modes.map(mode => mode.label)).toEqual(['Build', 'Ask']);
    expect(defaultValue).toBe('ask');
  });

  it('ends each system prompt with its mode instructions', () => {
    expect(build.systemPrompt).toContain(buildInstructions.trim());
    expect(ask.systemPrompt).toContain(askInstructions.trim());
    expect(build.systemPrompt).not.toContain(askInstructions.trim());
  });

  it('limits each answerType enum to the mode and its refusals', () => {
    expect(
      answerSchema(build.responseJsonSchema).properties.answerType
    ).toMatchObject({
      enum: ['buildPage', 'refusal'],
    });
    const askEnum = (
      answerSchema(ask.responseJsonSchema).properties.answerType as {
        enum: string[];
      }
    ).enum;
    expect(askEnum.some(type => type.startsWith('build'))).toBe(false);
  });

  it('lets only Build return code', () => {
    expect(
      answerSchema(build.responseJsonSchema).properties.code
    ).toBeDefined();
    expect(
      answerSchema(ask.responseJsonSchema).properties.code
    ).toBeUndefined();
  });
});
