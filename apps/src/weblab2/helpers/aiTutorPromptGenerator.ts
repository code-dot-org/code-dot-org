import {buildAnswerTypeRouterSection} from '@cdo/apps/aiTutor/helpers/aiTutorPromptHelpers';
import {
  BUILDER_ANSWER_TYPES,
  DEFAULT_ANSWER_TYPES,
} from '@cdo/apps/weblab2/constants';
import basePrompt from '@cdo/apps/weblab2/prompts/basePrompt.md';
import builderPrompt from '@cdo/apps/weblab2/prompts/builder/builderPrompt.md';
import builderPreReplyCheck from '@cdo/apps/weblab2/prompts/builder/preReplyCheck.md';
import environmentPrompt from '@cdo/apps/weblab2/prompts/environment.md';
import preReplyCheckAllowJs from '@cdo/apps/weblab2/prompts/preReplyCheckAllowJs.md';
import preReplyCheckNoJs from '@cdo/apps/weblab2/prompts/preReplyCheckNoJs.md';
import {
  ANSWER_TYPE_CONTRACTS,
  ANSWER_TYPE_TRIGGERS,
  BUILDER_ANSWER_TYPE_CONTRACTS,
  BUILDER_ANSWER_TYPE_TRIGGERS,
} from '@cdo/apps/weblab2/prompts/promptMaps';
import securityIntro from '@cdo/apps/weblab2/prompts/securityIntro.md';
import {AiTutorAnswerType} from '@cdo/apps/weblab2/types';
import {
  AllowedFontHostnames,
  AllowedHostnameSuffixes,
  AllowedImageHostnameSuffixes,
} from '@cdo/generated-scripts/sharedConstants';

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

const BUILDER_ANSWER_TYPE_GROUPS: AnswerTypeGroup[] = [
  {
    heading: '### Build Modes (produce code now)',
    answerTypes: ['buildCSS', 'buildHTML', 'buildJavaScript', 'buildJSON'],
  },
  {
    heading: '### Discussion Modes',
    answerTypes: ['ask', 'debug', 'explainCode'],
  },
  {
    heading: '### Refusal Mode',
    answerTypes: ['refusal'],
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

const buildSecuritySection = (): string => {
  const connectHostnames = AllowedHostnameSuffixes.join(', ');
  const imageHostnames = AllowedImageHostnameSuffixes.join(', ');
  const fontHostnames = AllowedFontHostnames.join(', ');

  return [
    securityIntro.trim(),
    '## Allowed External URLs',
    `Allowed connect sources: ${connectHostnames}`,
    `Allowed image sources: ${imageHostnames}`,
    `Allowed font sources: ${fontHostnames}`,
  ].join('\n');
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
    environmentPrompt.trim(),
    '',
    buildSecuritySection(),
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
    '',
    (allowJs ? preReplyCheckAllowJs : preReplyCheckNoJs).trim(),
  ].join('\n');
};

/**
 * Prompt for authoring mode: a levelbuilder editing shared widget2 sources.
 * Same environment and security sections as the tutor prompt, but the
 * Socratic base, tutoring modes and JS refusals are replaced by a
 * pair-programmer that builds what the author asks for.
 */
export const generateAiTutorBuilderPrompt = (widgetId?: string): string => {
  const answerTypes: AiTutorAnswerType[] = [...BUILDER_ANSWER_TYPES, 'refusal'];
  const triggers: Record<AiTutorAnswerType, string> = {
    ...ANSWER_TYPE_TRIGGERS,
    ...BUILDER_ANSWER_TYPE_TRIGGERS,
  };
  const contracts = answerTypes
    .map(answerType =>
      (
        BUILDER_ANSWER_TYPE_CONTRACTS[answerType] ??
        ANSWER_TYPE_CONTRACTS[answerType]
      ).trim()
    )
    .join('\n\n');
  const widgetSection = widgetId
    ? [
        '## Current widget',
        `You are editing the shared widget \`${widgetId}\`. Its files are included with each message.`,
        '',
      ]
    : [];

  return [
    environmentPrompt.trim(),
    '',
    buildSecuritySection(),
    '',
    builderPrompt.trim(),
    '',
    ...widgetSection,
    '---',
    '',
    '## Mode Router (deterministic)',
    'Choose exactly one mode per reply using these rules:',
    '',
    buildAnswerTypeRouterSection(
      BUILDER_ANSWER_TYPE_GROUPS,
      triggers,
      answerTypes
    ),
    '',
    '--------',
    '## Mode Answer Contracts',
    '',
    contracts,
    '',
    builderPreReplyCheck.trim(),
  ].join('\n');
};
