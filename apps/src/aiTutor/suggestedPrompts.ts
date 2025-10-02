import {ChatButtonData} from '../aichat/types';

export interface AiTutorSuggestedPrompt extends ChatButtonData {}

export const defaultPrompts: AiTutorSuggestedPrompt[] = [
  {
    id: 'documentation',
    icon: {
      iconName: 'file-code',
    },
    label: 'Show documentation',
    value: 'Can you give me some documentation?',
    analyticsProperties: {
      cannedPrompt: 'documentation',
    },
  },
];

export const levelPrompts: AiTutorSuggestedPrompt[] = [
  {
    id: 'example',
    icon: {
      iconName: 'code',
    },
    label: 'Show me an example',
    value: 'Can you give me an example?',
    analyticsProperties: {
      cannedPrompt: 'example',
    },
  },
  {
    id: 'hint',
    icon: {
      iconName: 'lightbulb',
    },
    label: 'Give me a hint',
    value: 'Can you give me a hint?',
    analyticsProperties: {
      cannedPrompt: 'hint',
    },
  },
];

export const standaloneProjectPrompts: AiTutorSuggestedPrompt[] = [
  {
    id: 'brainstorm',
    icon: {
      iconName: 'brain',
    },
    label: 'Help me brainstorm',
    value: 'Can you help me brainstorm?',
    analyticsProperties: {
      cannedPrompt: 'brainstorm',
    },
  },
  {
    id: 'debug',
    icon: {
      iconName: 'bug',
    },
    label: 'Help me debug',
    value: 'Can you help me debug?',
    analyticsProperties: {
      cannedPrompt: 'debug',
    },
  },
  {
    id: 'projects',
    icon: {
      iconName: 'star',
    },
    label: 'Show me example projects',
    value: 'Can you show me example projects?',
    analyticsProperties: {
      cannedPrompt: 'projects',
    },
  },
];
