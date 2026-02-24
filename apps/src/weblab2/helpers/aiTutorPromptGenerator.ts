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
import {AiTutorMode} from '@cdo/apps/weblab2/types';

const MODE_TRIGGERS: Record<AiTutorMode, string> = {
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

const MODE_CONTRACTS: Record<AiTutorMode, string> = {
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
  modes: AiTutorMode[];
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

const buildModeRouterSection = (
  modes: AiTutorMode[],
  allowJs: boolean
): string => {
  // If the mode list includes buildJavaScript, we will use the refusal mode that allows JavaScript,
  // otherwise we block JavaScript from being generated. The mode list should not include a refusal mode, since those
  // are not part of the level edit page.
  const refusalMode = allowJs ? 'refusal' : 'refusalJavaScriptSnippets';
  modes = [...modes, refusalMode];
  return MODE_GROUPS.flatMap(group => {
    const groupModes = group.modes.filter(mode => modes.includes(mode));
    if (groupModes.length === 0) return [];
    return [
      group.heading,
      ...groupModes.map(mode => `- ${MODE_TRIGGERS[mode].trim()}`),
    ];
  }).join('\n');
};

export const generateAiTutorPrompt = (modes: AiTutorMode[]): string => {
  const contracts = modes.map(mode => MODE_CONTRACTS[mode].trim()).join('\n\n');
  const allowJs = modes.includes('buildJavaScript');

  return [
    basePrompt.trim(),
    '',
    '---',
    '',
    '## Mode Router (deterministic)',
    'Choose exactly one mode per reply using these rules:',
    '',
    buildModeRouterSection(modes, allowJs),
    '',
    '--------',
    '## Mode Answer Contracts',
    '',
    contracts,
    '',
    (allowJs ? preReplyCheckAllowJs : preReplyCheckNoJs).trim(),
  ].join('\n');
};
