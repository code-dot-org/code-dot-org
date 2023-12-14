import {DANCE_AI_SOUNDS} from '@cdo/apps/dance/ai/constants';

export enum AiOutput {
  AI_BLOCK = 'ai_block',
  GENERATED_BLOCKS = 'generated_blocks',
  BOTH = 'both',
}

export type LabelMaps = {
  [key in FieldKey]: {[id: string]: string};
};

export enum FieldKey {
  BACKGROUND_EFFECT = 'backgroundEffect',
  FOREGROUND_EFFECT = 'foregroundEffect',
  BACKGROUND_PALETTE = 'backgroundColor',
}

export type GeneratedEffect = {[key in FieldKey]: string};

export type GeneratedEffectScores = number[];

export type MinMax = {
  minIndividualScore: number;
  maxTotalScore: number;
};

export interface AiFieldValue extends GeneratedEffect {
  inputs: string[];
}

export type DanceAiSound = (typeof DANCE_AI_SOUNDS)[number];

export type DanceAiModelItem = {
  id: string;
  emoji: string;
  modelDescriptiveName: string;
};

export type CachedWeightsMapping = {
  emojiAssociations: {[key: string]: number[]};
  output: string[];
};

export enum EffectsQuality {
  GOOD = 'good',
  BAD = 'bad',
}

export enum DanceAiModalMode {
  INITIAL = 'initial',
  SELECT_INPUTS = 'selectInputs',
  GENERATING = 'generating',
  GENERATED = 'generated',
  RESULTS = 'results',
  EXPLANATION = 'explanation',
}

export enum DanceAiPreviewButtonToggleState {
  EFFECT = 'effect',
  CODE = 'code',
}
