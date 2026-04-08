import {DEFAULT_ANSWER_TYPES} from '@cdo/apps/weblab2/constants';
import basePrompt from '@cdo/apps/weblab2/prompts/basePrompt.md';
import preReplyCheckAllowJs from '@cdo/apps/weblab2/prompts/preReplyCheckAllowJs.md';
import preReplyCheckNoJs from '@cdo/apps/weblab2/prompts/preReplyCheckNoJs.md';
import {
  ANSWER_TYPE_CONTRACTS,
  ANSWER_TYPE_TRIGGERS,
} from '@cdo/apps/weblab2/prompts/promptMaps';
import {AiTutorAnswerType} from '@cdo/apps/weblab2/types';

type AnswerTypeGroup = {
  heading: string;
  answerTypes: AiTutorAnswerType[];
};

const ANSWER_TYPE_GROUPS: AnswerTypeGroup[] = [
  {
    heading: '### Build Modes (produce code now)',
    answerTypes: ['buildCSS', 'buildHTML', 'buildJavaScript', 'buildJSON'],
  },
  {
    heading: '### Tutoring Modes (no runnable JS)',
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
    answerTypes: ['refusal', 'refusalJavaScriptSnippets'],
  },
];

const buildAnswerTypeRouterSection = (
  answerTypes: AiTutorAnswerType[]
): string => {
  return ANSWER_TYPE_GROUPS.flatMap(group => {
    const groupAnswerTypes = group.answerTypes.filter(answerType =>
      answerTypes.includes(answerType)
    );
    if (groupAnswerTypes.length === 0) return [];
    return [
      group.heading,
      ...groupAnswerTypes.map(
        answerType => `- ${ANSWER_TYPE_TRIGGERS[answerType].trim()}`
      ),
      '',
    ];
  }).join('\n');
};

const generateFinalAnswerTypeList = (
  answerTypes: AiTutorAnswerType[]
): AiTutorAnswerType[] => {
  let finalAnswerTypes = [...answerTypes];
  if (answerTypes.length === 0) {
    finalAnswerTypes = DEFAULT_ANSWER_TYPES;
  }
  // Remove any hard-coded refusal modes since we derive the refusal mode
  // based on whether buildJavaScript is included.
  finalAnswerTypes = finalAnswerTypes.filter(
    answerType =>
      answerType !== 'refusal' && answerType !== 'refusalJavaScriptSnippets'
  );
  // If the answer type list includes buildJavaScript, we will only include the generic
  // refusal answer type. Otherwise, we also include the refusal answer type to reject JavaScript snippets.
  const hasBuildJavaScript = finalAnswerTypes.includes('buildJavaScript');
  const refusalAnswerTypes: AiTutorAnswerType[] = hasBuildJavaScript
    ? ['refusal']
    : ['refusal', 'refusalJavaScriptSnippets'];
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
  const allowJs = parsedAnswerTypes.includes('buildJavaScript');

  return [
    basePrompt.trim(),
    '',
    '---',
    '',
    '## Mode Router (deterministic)',
    'Choose exactly one mode per reply using these rules:',
    '',
    buildAnswerTypeRouterSection(parsedAnswerTypes),
    '',
    '--------',
    '## Mode Answer Contracts',
    '',
    contracts,
    '',
    (allowJs ? preReplyCheckAllowJs : preReplyCheckNoJs).trim(),
  ].join('\n');
};
