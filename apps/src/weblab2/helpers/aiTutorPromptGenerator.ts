import {DEFAULT_ANSWER_TYPES} from '@cdo/apps/weblab2/constants';
import askContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/ask.md';
import buildCSSContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildCSS.md';
import buildHTMLContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildHTML.md';
import buildJavaScriptContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildJavaScript.md';
import buildJSONContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildJSON.md';
import debugContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/debug.md';
import documentationContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/documentation.md';
import exampleContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/example.md';
import explainCodeContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/explainCode.md';
import hintContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/hint.md';
import pseudocodeContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/pseudocode.md';
import refusalContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/refusal.md';
import refusalJavaScriptSnippetsContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/refusalJavaScriptSnippets.md';
import testCaseContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/testCase.md';
import askTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/ask.md';
import buildCSSTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildCSS.md';
import buildHTMLTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildHTML.md';
import buildJavaScriptTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildJavaScript.md';
import buildJSONTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildJSON.md';
import debugTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/debug.md';
import documentationTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/documentation.md';
import exampleTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/example.md';
import explainCodeTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/explainCode.md';
import hintTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/hint.md';
import pseudocodeTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/pseudocode.md';
import refusalTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/refusal.md';
import refusalJavaScriptSnippetsTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/refusalJavaScriptSnippets.md';
import testCaseTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/testCase.md';
import basePrompt from '@cdo/apps/weblab2/prompts/basePrompt.md';
import preReplyCheckAllowJs from '@cdo/apps/weblab2/prompts/preReplyCheckAllowJs.md';
import preReplyCheckNoJs from '@cdo/apps/weblab2/prompts/preReplyCheckNoJs.md';
import {AiTutorAnswerType} from '@cdo/apps/weblab2/types';

const ANSWER_TYPE_TRIGGERS: Record<AiTutorAnswerType, string> = {
  ask: askTrigger,
  buildCSS: buildCSSTrigger,
  buildHTML: buildHTMLTrigger,
  buildJavaScript: buildJavaScriptTrigger,
  buildJSON: buildJSONTrigger,
  debug: debugTrigger,
  documentation: documentationTrigger,
  example: exampleTrigger,
  explainCode: explainCodeTrigger,
  hint: hintTrigger,
  pseudocode: pseudocodeTrigger,
  refusal: refusalTrigger,
  refusalJavaScriptSnippets: refusalJavaScriptSnippetsTrigger,
  testCase: testCaseTrigger,
};

const ANSWER_TYPE_CONTRACTS: Record<AiTutorAnswerType, string> = {
  ask: askContract,
  buildCSS: buildCSSContract,
  buildHTML: buildHTMLContract,
  buildJavaScript: buildJavaScriptContract,
  buildJSON: buildJSONContract,
  debug: debugContract,
  documentation: documentationContract,
  example: exampleContract,
  explainCode: explainCodeContract,
  hint: hintContract,
  pseudocode: pseudocodeContract,
  refusal: refusalContract,
  refusalJavaScriptSnippets: refusalJavaScriptSnippetsContract,
  testCase: testCaseContract,
};

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
      const baseContract = ANSWER_TYPE_CONTRACTS[answerType].trim();
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
