import {LevelProperties} from '@cdo/apps/lab2/types';

export interface Weblab2LevelProperties extends LevelProperties {
  widgetView?: boolean;
  initialViewMode?: ViewMode;
  aiTutorMode?: string;
  aiTutorPromptAnswerTypes?: AiTutorMode[];
}

export enum ViewMode {
  SPLIT = 'split',
  CODE = 'code',
  PREVIEW = 'preview',
}

export type AiTutorMode =
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

export type LegacyMode =
  | 'suggest'
  | 'outline'
  | 'guide'
  | 'produce'
  | 'designer'
  | 'tutor'
  | 'engineer'
  | 'qa';
