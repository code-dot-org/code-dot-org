// AI Lab models in Sprite Lab: fetching a trained model, the shape a block
// needs to draw its inputs, and prediction in the model's own vocabulary.
import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';
import {predict} from '@cdo/apps/MLTrainers';
import HttpClient from '@cdo/apps/util/HttpClient';

export interface AiModelFeature {
  id: string;
  // Present for a categorical feature; absent for a continuous one.
  values?: string[];
  min?: number;
  max?: number;
}

/** The trained model as GET /api/v1/ml_models/:id returns it. */
export interface AiModel {
  name: string;
  features: AiModelFeature[];
  label: {id: string; values?: string[]};
  featureNumberKey: Record<string, Record<string, number>>;
  selectedTrainer: string;
  trainedModel: unknown;
}

/** What a predict block stores so it can draw its inputs before the model loads. */
export interface AiModelShape {
  id: string;
  name: string;
  features: {id: string; yesNo: boolean}[];
}

const YES = 'yes';
const NO = 'no';

/** A categorical feature whose only values are yes and no takes a boolean. */
export function isYesNoFeature(feature: AiModelFeature): boolean {
  const values = (feature.values || []).map(value => value.toLowerCase());
  return values.length === 2 && values.includes(YES) && values.includes(NO);
}

export function modelShape(id: string, model: AiModel): AiModelShape {
  return {
    id,
    name: model.name,
    features: model.features.map(feature => ({
      id: feature.id,
      yesNo: isYesNoFeature(feature),
    })),
  };
}

const models = new Map<string, AiModel>();
const loads = new Map<string, Promise<AiModel>>();
let levelModelId: string | undefined;

export function getAiModel(id: string): AiModel | undefined {
  return models.get(id);
}

/** The level's model, if the level names one and it has loaded. */
export function getLevelAiModel(): AiModel | undefined {
  return levelModelId ? models.get(levelModelId) : undefined;
}

/** Fetch a model once; later calls share the result. */
export function loadAiModel(id: string): Promise<AiModel> {
  const loaded = models.get(id);
  if (loaded) {
    return Promise.resolve(loaded);
  }
  let load = loads.get(id);
  if (!load) {
    load = HttpClient.fetchJson<AiModel>(`/api/v1/ml_models/${id}`).then(
      ({value}) => {
        models.set(id, value);
        return value;
      }
    );
    loads.set(id, load);
  }
  return load;
}

/** The model the current level names, for blocks that arrive without a shape. */
export function setLevelAiModelId(id: string | undefined): void {
  levelModelId = id;
}

export function levelAiModelShape(): AiModelShape | undefined {
  if (!levelModelId) {
    return undefined;
  }
  const model = models.get(levelModelId);
  return model && modelShape(levelModelId, model);
}

/** A slot's value in the model's own vocabulary. */
export function featureValue(
  feature: AiModelFeature,
  value: unknown
): string | number {
  if (
    isYesNoFeature(feature) &&
    (typeof value === 'boolean' || value === undefined || value === null)
  ) {
    return matchValue(feature, value ? YES : NO);
  }
  if (feature.values) {
    return matchValue(feature, String(value));
  }
  return Number(value);
}

// The feature's own spelling of a value, matched without regard to case.
function matchValue(feature: AiModelFeature, text: string): string {
  const lower = text.toLowerCase();
  return (
    (feature.values || []).find(value => value.toLowerCase() === lower) || text
  );
}

/** The model's label for these inputs, keyed by feature id. */
export function predictLabel(
  model: AiModel,
  inputs: Record<string, unknown>
): string {
  const testData: Record<string, string | number> = {};
  model.features.forEach(feature => {
    testData[stripSpaceAndSpecial(feature.id)] = featureValue(
      feature,
      inputs[feature.id]
    );
  });
  return String(predict({...model, testData}));
}
