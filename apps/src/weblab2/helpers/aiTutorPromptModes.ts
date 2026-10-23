import {ChatPromptMode, ChatPromptModes} from '@cdo/apps/aichat/types';
import {
  getJsonVideoPrompt,
  type JsonVideoFileMetadata,
} from '@cdo/apps/jsonVideo/jsonVideoPrompt';
import askInstructions from '@cdo/apps/weblab2/prompts/chatModes/ask.md';
import buildInstructions from '@cdo/apps/weblab2/prompts/chatModes/build.md';
import {
  AiTutorAnswerType,
  AiTutorPromptSettings,
} from '@cdo/apps/weblab2/types';

import {
  generateAiTutorPrompt,
  generateFinalAnswerTypeList,
} from './aiTutorPromptGenerator';
import {getAiTutorResponseJsonSchema} from './aiTutorStructuredResponseHelper';

// buildPage alone: offering buildHTML or buildCSS beside it lets the model
// fall back to a single file.
const BUILD_ANSWER_TYPES: AiTutorAnswerType[] = ['buildPage'];

const ASK_ANSWER_TYPES: AiTutorAnswerType[] = [
  'ask',
  'debug',
  'documentation',
  'example',
  'explainCode',
  'hint',
  'pseudocode',
  'testCase',
];

const getPromptMode = (
  mode: Pick<ChatPromptMode, 'value' | 'label' | 'icon'>,
  answerTypes: AiTutorAnswerType[],
  instructions: string,
  allowCode: boolean,
  customizations: AiTutorPromptSettings['answerTypeCustomizations'],
  tutorVideos: JsonVideoFileMetadata[]
): ChatPromptMode => ({
  ...mode,
  // Instructions go last so they read as the final word over shared rules.
  systemPrompt:
    `${generateAiTutorPrompt(answerTypes, customizations)}\n\n` +
    `${instructions.trim()}` +
    getJsonVideoPrompt(tutorVideos, true),
  responseJsonSchema: getAiTutorResponseJsonSchema(
    generateFinalAnswerTypeList(answerTypes),
    {allowCode}
  ),
});

/** The Build and Ask submit buttons; Ask can return no files. */
export const getBuildAndAskPromptModes = (
  customizations: AiTutorPromptSettings['answerTypeCustomizations'],
  tutorVideos: JsonVideoFileMetadata[]
): ChatPromptModes => ({
  modes: [
    getPromptMode(
      {
        value: 'build',
        label: 'Build',
        icon: {iconName: 'hammer', iconStyle: 'solid'},
      },
      BUILD_ANSWER_TYPES,
      buildInstructions,
      true,
      customizations,
      tutorVideos
    ),
    getPromptMode(
      {
        value: 'ask',
        label: 'Ask',
        icon: {iconName: 'message', iconStyle: 'solid'},
      },
      ASK_ANSWER_TYPES,
      askInstructions,
      false,
      customizations,
      tutorVideos
    ),
  ],
  defaultValue: 'ask',
});
