import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {PromptOptionKeys} from './types';

export const initialAssistantGreeting = "Hi! I'm your AI Tutor.";

export enum SuggestedPromptActions {
  COMPILATION = 'compilation',
  VALIDATION = 'validation',
  GENERIC_HELP = 'generic_help',
}

export const QuickActions: Record<SuggestedPromptActions, string> = {
  [SuggestedPromptActions.COMPILATION]: "Why doesn't my code compile?",
  [SuggestedPromptActions.VALIDATION]: 'Why are my tests failing?',
  [SuggestedPromptActions.GENERIC_HELP]: "Why doesn't my code work?",
};

export const AITutorEventMap: Record<
  keyof typeof SuggestedPromptActions,
  keyof typeof EVENTS
> = {
  COMPILATION: 'AI_TUTOR_SUGGESTED_PROMPT_COMPILATION',
  VALIDATION: 'AI_TUTOR_SUGGESTED_PROMPT_VALIDATION',
  GENERIC_HELP: 'AI_TUTOR_SUGGESTED_PROMPT_GENERIC_HELP',
};

export const PromptOptionMap: Record<SuggestedPromptActions, PromptOptionKeys> =
  {
    [SuggestedPromptActions.COMPILATION]: 'showCompilationOption',
    [SuggestedPromptActions.VALIDATION]: 'showValidationOption',
    [SuggestedPromptActions.GENERIC_HELP]: 'showGenericErrorOption',
  };
