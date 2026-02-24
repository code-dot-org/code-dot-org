import {TUTOR_MODE_TO_ANSWER_TYPE} from '@cdo/apps/weblab2/constants';
import basePrompt from '@cdo/apps/weblab2/prompts/basePrompt.md';
import askContract from '@cdo/apps/weblab2/prompts/modeContracts/ask.md';
import buildCSSContract from '@cdo/apps/weblab2/prompts/modeContracts/buildCSS.md';
import buildHTMLContract from '@cdo/apps/weblab2/prompts/modeContracts/buildHTML.md';
import buildJavaScriptContract from '@cdo/apps/weblab2/prompts/modeContracts/buildJavaScript.md';
import debugContract from '@cdo/apps/weblab2/prompts/modeContracts/debug.md';
import documentationContract from '@cdo/apps/weblab2/prompts/modeContracts/documentation.md';
import exampleContract from '@cdo/apps/weblab2/prompts/modeContracts/example.md';
import explainCodeContract from '@cdo/apps/weblab2/prompts/modeContracts/explainCode.md';
import hintContract from '@cdo/apps/weblab2/prompts/modeContracts/hint.md';
import pseudocodeContract from '@cdo/apps/weblab2/prompts/modeContracts/pseudocode.md';
import refusalContract from '@cdo/apps/weblab2/prompts/modeContracts/refusal.md';
import refusalJavaScriptSnippetsContract from '@cdo/apps/weblab2/prompts/modeContracts/refusalJavaScriptSnippets.md';
import testCaseContract from '@cdo/apps/weblab2/prompts/modeContracts/testCase.md';
import askTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/ask.md';
import buildCSSTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/buildCSS.md';
import buildHTMLTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/buildHTML.md';
import buildJavaScriptTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/buildJavaScript.md';
import debugTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/debug.md';
import documentationTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/documentation.md';
import exampleTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/example.md';
import explainCodeTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/explainCode.md';
import hintTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/hint.md';
import pseudocodeTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/pseudocode.md';
import refusalTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/refusal.md';
import refusalJavaScriptSnippetsTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/refusalJavaScriptSnippets.md';
import testCaseTrigger from '@cdo/apps/weblab2/prompts/modeTriggers/testCase.md';
import preReplyCheckAllowJs from '@cdo/apps/weblab2/prompts/preReplyCheckAllowJs.md';
import preReplyCheckNoJs from '@cdo/apps/weblab2/prompts/preReplyCheckNoJs.md';
import {AiTutorAnswerType} from '@cdo/apps/weblab2/types';

const MODE_TRIGGERS: Record<AiTutorAnswerType, string> = {
  ask: askTrigger,
  buildCSS: buildCSSTrigger,
  buildHTML: buildHTMLTrigger,
  buildJavaScript: buildJavaScriptTrigger,
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

const MODE_CONTRACTS: Record<AiTutorAnswerType, string> = {
  ask: askContract,
  buildCSS: buildCSSContract,
  buildHTML: buildHTMLContract,
  buildJavaScript: buildJavaScriptContract,
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

type ModeGroup = {
  heading: string;
  modes: AiTutorAnswerType[];
};

const MODE_GROUPS: ModeGroup[] = [
  {
    heading: '### Build Modes (produce code now)',
    modes: ['buildCSS', 'buildHTML', 'buildJavaScript'],
  },
  {
    heading: '### Tutoring Modes (no runnable JS)',
    modes: [
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
    modes: ['refusal', 'refusalJavaScriptSnippets'],
  },
];

const buildModeRouterSection = (modes: AiTutorAnswerType[]): string => {
  return MODE_GROUPS.flatMap(group => {
    const groupModes = group.modes.filter(mode => modes.includes(mode));
    if (groupModes.length === 0) return [];
    return [
      group.heading,
      ...groupModes.map(mode => `- ${MODE_TRIGGERS[mode].trim()}`),
      '',
    ];
  }).join('\n');
};

const generateFinalModeList = (
  modes: AiTutorAnswerType[]
): AiTutorAnswerType[] => {
  let finalModes = [...modes];
  if (modes.length === 0) {
    finalModes = TUTOR_MODE_TO_ANSWER_TYPE['engineer'];
  }
  // Remove any hard-coded refusal modes since we derive the refusal mode
  // based on whether buildJavaScript is included.
  finalModes = finalModes.filter(
    mode => mode !== 'refusal' && mode !== 'refusalJavaScriptSnippets'
  );
  // If the mode list includes buildJavaScript, we will use the refusal mode that allows JavaScript,
  // otherwise we block JavaScript from being generated.
  const hasBuildJavaScript = modes.includes('buildJavaScript');
  const refusalMode = hasBuildJavaScript
    ? 'refusal'
    : 'refusalJavaScriptSnippets';
  finalModes.push(refusalMode);
  return finalModes;
};

export const generateAiTutorPrompt = (modes: AiTutorAnswerType[]): string => {
  const parsedModes = generateFinalModeList(modes);
  const contracts = parsedModes
    .map(mode => MODE_CONTRACTS[mode].trim())
    .join('\n\n');
  const allowJs = parsedModes.includes('buildJavaScript');

  return [
    basePrompt.trim(),
    '',
    '---',
    '',
    '## Mode Router (deterministic)',
    'Choose exactly one mode per reply using these rules:',
    '',
    buildModeRouterSection(parsedModes),
    '',
    '--------',
    '## Mode Answer Contracts',
    '',
    contracts,
    '',
    (allowJs ? preReplyCheckAllowJs : preReplyCheckNoJs).trim(),
  ].join('\n');
};
