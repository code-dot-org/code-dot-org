/**
 * One shape for the two generations of AI Lab model metadata. The trait
 * editor and the predict block both read a model through this file, so
 * neither one must know which generation it got.
 *
 * Two facts control this file, and the stored metadata declares neither. A
 * feature is categorical when it has a `values` array. The key that
 * MLTrainers.predict looks for in testData is the feature id with all
 * non-word characters removed, not the feature id.
 */

import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';

/** A feature as the ml_models API stores it. */
export interface RawFeature {
  id: string;
  description?: string;
  min?: number;
  max?: number;
  values?: string[];
}

export interface RawModelMetadata {
  name?: string;
  selectedTrainer?: string;
  features?: RawFeature[];
  label?: {
    id: string;
    description?: string;
    min?: number;
    max?: number;
    values?: string[];
  };
  /** Written by models trained before `label` became an object. */
  labelColumn?: string;
}

export type TraitKind = 'category' | 'number';

export interface TraitField {
  /** The name the student sees. */
  id: string;
  /** The testData key. Never the id; read the file comment. */
  key: string;
  kind: TraitKind;
  description?: string;
  values?: string[];
  min?: number;
  max?: number;
}

export interface ModelCard {
  modelId: string;
  name: string;
  trainer: string;
  labelName: string;
  fields: TraitField[];
}

// applab/ai.js:37 branches on the same test to choose a dropdown over a text
// input, so this is the established reading of the metadata.
function toField(feature: RawFeature): TraitField {
  const categorical =
    Array.isArray(feature.values) && feature.values.length > 0;
  return {
    id: feature.id,
    key: stripSpaceAndSpecial(feature.id),
    kind: categorical ? 'category' : 'number',
    description: feature.description,
    values: categorical ? feature.values : undefined,
    min: categorical ? undefined : feature.min,
    max: categorical ? undefined : feature.max,
  };
}

/**
 * The metadata comes from `GET /api/v1/ml_models/names`, which omits
 * trainedModel and featureNumberKey. The trait editor needs no more than
 * that, so it never pulls a model out of S3.
 */
export function readModelCard(
  modelId: string,
  meta: RawModelMetadata
): ModelCard {
  return {
    modelId,
    name: meta.name || modelId,
    trainer: meta.selectedTrainer || 'unknown',
    labelName: meta.label?.id || meta.labelColumn || 'prediction',
    fields: (meta.features || []).map(toField),
  };
}

// MLTrainers keeps this list private and returns the string
// 'Error: unknown trainer' for everything else, which a block cannot tell
// from a prediction. Export KNNTrainers from MLTrainers and import it here
// when the decision-tree trainer lands.
export const SUPPORTED_TRAINERS = ['knnClassify', 'knnRegress'];

export function isTrainerSupported(card: ModelCard): boolean {
  return SUPPORTED_TRAINERS.includes(card.trainer);
}
