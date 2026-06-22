import {buildAnswerTypeRouterSection} from '@cdo/apps/aiTutor/helpers/aiTutorPromptHelpers';
import basePrompt from '@cdo/apps/pythonlab/prompts/basePrompt.md';
import environmentPrompt from '@cdo/apps/pythonlab/prompts/environment.md';
import {
  ANSWER_TYPE_CONTRACTS,
  ANSWER_TYPE_TRIGGERS,
} from '@cdo/apps/pythonlab/prompts/promptMaps';
import {AiTutorAnswerType} from '@cdo/apps/pythonlab/types';

export const DEFAULT_ANSWER_TYPES: AiTutorAnswerType[] = [
  'buildPython',
  'buildCSV',
  'buildJSON',
  'ask',
  'hint',
  'debug',
  'example',
  'explainCode',
  'documentation',
  'pseudocode',
  'testCase',
];

type AnswerTypeGroup = {
  heading: string;
  answerTypes: AiTutorAnswerType[];
};

const ANSWER_TYPE_GROUPS: AnswerTypeGroup[] = [
  {
    heading: '### Build Modes (produce code now)',
    answerTypes: ['buildPython', 'buildCSV', 'buildJSON'],
  },
  {
    heading: '### Tutoring Modes (no runnable Python)',
    answerTypes: [
      'ask',
      'debug',
      'documentation',
      'example',
      'explainCode',
      'hint',
      'pseudocode',
      'testCase',
    ],
  },
  {
    heading: '### Refusal Modes',
    answerTypes: ['refusal', 'refusalPythonSnippets'],
  },
];

const generateFinalAnswerTypeList = (
  answerTypes: AiTutorAnswerType[]
): AiTutorAnswerType[] => {
  let finalAnswerTypes = [...answerTypes];
  if (answerTypes.length === 0) {
    finalAnswerTypes = DEFAULT_ANSWER_TYPES;
  }
  // Remove any hard-coded refusal modes since we derive the refusal mode
  // based on whether buildPython is included.
  finalAnswerTypes = finalAnswerTypes.filter(
    answerType =>
      answerType !== 'refusal' && answerType !== 'refusalPythonSnippets'
  );
  // If the answer type list includes buildPython, we will only include the generic
  // refusal answer type. Otherwise, we also include the refusal answer type to reject Python snippets.
  const hasBuildPython = finalAnswerTypes.includes('buildPython');
  const refusalAnswerTypes: AiTutorAnswerType[] = hasBuildPython
    ? ['refusal']
    : ['refusal', 'refusalPythonSnippets'];
  finalAnswerTypes.push(...refusalAnswerTypes);
  return finalAnswerTypes;
};

export const generateAiTutorPrompt = (
  answerTypes: AiTutorAnswerType[],
  answerTypeCustomizations?: Partial<Record<AiTutorAnswerType, string>>
): string => {
  const parsedAnswerTypes = generateFinalAnswerTypeList(answerTypes);
  const contracts = parsedAnswerTypes
    .map(answerType => {
      const baseContract = ANSWER_TYPE_CONTRACTS[answerType]?.trim();
      const customization = answerTypeCustomizations?.[answerType]?.trim();
      return customization ? `${baseContract}\n${customization}` : baseContract;
    })
    .join('\n\n');

  return [
    environmentPrompt.trim(),
    '',
    basePrompt.trim(),
    '',
    '---',
    '',
    '## Mode Router (deterministic)',
    'Choose exactly one mode per reply using these rules:',
    '',
    buildAnswerTypeRouterSection(
      ANSWER_TYPE_GROUPS,
      ANSWER_TYPE_TRIGGERS,
      parsedAnswerTypes
    ),
    '',
    '--------',
    '## Mode Answer Contracts',
    '',
    contracts,
  ].join('\n');
};
