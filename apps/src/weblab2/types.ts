import {LevelProperties} from '@cdo/apps/lab2/types';

export interface AiTutorPromptSettings {
  answerTypes: AiTutorAnswerType[];
  answerTypeCustomizations?: Partial<Record<AiTutorAnswerType, string>>;
}

export type Widget2 = {
  id: string;
  parameters?: object;
};

export interface Weblab2LevelProperties extends LevelProperties {
  widgetView?: boolean;
  initialViewMode?: ViewMode;
  aiTutorMode?: string;
  levelSystemPrompt?: string;
  aiTutorPromptSettings?: AiTutorPromptSettings;
  widget2?: Widget2;
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
  | 'buildJSON'
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
