/**
 * The two reads this lab makes against the AI Lab model API.
 *
 * The list endpoint returns the stored metadata with trainedModel and
 * featureNumberKey removed, which is all the trait editor needs. The lab
 * therefore never pulls a model out of S3 to draw its fields; only
 * MLTrainers does that, at prediction time, through mlApi.
 */

import HttpClient from '@cdo/apps/util/HttpClient';

import {ModelCard, RawModelMetadata, readModelCard} from './modelCard';

interface NamesEntry {
  id: string;
  name: string;
  metadata: RawModelMetadata;
}

/**
 * The signed-in user's trained models. The endpoint scopes to current_user
 * and answers an anonymous request with the models that have no owner, so a
 * signed-out student sees a list they cannot use. The caller shows the
 * empty case rather than treating it as an error.
 */
export async function fetchModelCards(): Promise<ModelCard[]> {
  const {value} = await HttpClient.fetchJson<NamesEntry[]>(
    '/api/v1/ml_models/names'
  );
  return (value || []).map(entry =>
    readModelCard(entry.id, {name: entry.name, ...(entry.metadata || {})})
  );
}

/** One model by id, for a project that stored its choice and reopened. */
export async function fetchModelCard(
  modelId: string
): Promise<ModelCard | undefined> {
  const cards = await fetchModelCards();
  return cards.find(card => card.modelId === modelId);
}
