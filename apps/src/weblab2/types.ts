import {LevelProperties} from '@cdo/apps/lab2/types';

export interface Weblab2LevelProperties extends LevelProperties {
  widgetView?: boolean;
  initialViewMode?: ViewMode;
  aiTutorMode?: AiTutorMode;
  aiTutorPromptAnswerTypes?: AiTutorAnswerType[];
}

export enum ViewMode {
  SPLIT = 'split',
  CODE = 'code',
  PREVIEW = 'preview',
}

export type AiTutorAnswerType =
  | 'ask'
  | 'buildCSS'
  | 'buildHTML'
  | 'buildJavaScript'
  | 'debug'
  | 'documentation'
  | 'example'
  | 'explainCode'
  | 'hint'
  | 'pseudocode'
  | 'refusal'
  | 'refusalJavaScriptSnippets'
  | 'testCase';

export type AiTutorMode =
  | 'suggest'
  | 'outline'
  | 'guide'
  | 'produce'
  | 'designer'
  | 'tutor'
  | 'engineer'
  | 'qa';

export const DEFAULT_AI_TUTOR_MODE = 'engineer';
