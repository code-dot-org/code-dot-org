import KNN from 'ml-knn';

import type {
  ElementKind,
  ImportedMlModel,
  MlModelFeature,
  StageElement,
} from './project';

export interface MlModelPayload {
  featureNumberKey?: Record<string, Record<string, number>>;
  features?: MlModelFeature[];
  label?: MlModelFeature;
  labelColumn?: string;
  selectedFeatures?: string[];
  selectedTrainer?: string;
  trainedModel?: object | null;
}

export interface GeneratedMlModelElements {
  elements: StageElement[];
  predictionButtonId: string;
  resultElementId: string;
}

export type MlFeatureValues = Record<string, string>;

function modelPart(value: string) {
  return value.replace(/\W/g, '').toLowerCase() || 'model';
}

function uniqueId(base: string, usedIds: Set<string>) {
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
}

function controlKind(
  feature: MlModelFeature
): Extract<ElementKind, 'dropdown' | 'textInput'> {
  return feature.values?.length ? 'dropdown' : 'textInput';
}

function controlElement(
  model: ImportedMlModel,
  feature: MlModelFeature,
  id: string,
  x: number,
  y: number
): StageElement {
  const kind = controlKind(feature);
  return {
    backgroundColor: '#ffffff',
    borderColor: '#9aa5b1',
    borderRadius: 4,
    borderWidth: 1,
    fontFamily: 'Arial',
    fontSize: 14,
    height: 36,
    id,
    inputValue: feature.values?.[0] ?? '',
    kind,
    label: feature.values?.[0] ?? `Enter ${feature.id}`,
    mlFeatureId: feature.id,
    mlModelId: model.id,
    objectFit: 'contain',
    options: feature.values,
    screenId: '',
    textAlign: 'left',
    textColor: '#1f2933',
    visible: true,
    width: 170,
    x,
    y,
  };
}

export function createMlModelElements(
  model: ImportedMlModel,
  screenId: string,
  existingIds: string[]
): GeneratedMlModelElements {
  const usedIds = new Set(existingIds);
  const prefix = `ml-${modelPart(model.id)}`;
  const elements: StageElement[] = [];

  const titleId = uniqueId(`${prefix}-title`, usedIds);
  elements.push({
    fontFamily: 'Arial',
    fontSize: 18,
    height: 32,
    id: titleId,
    kind: 'label',
    label: model.name,
    mlModelId: model.id,
    screenId,
    textAlign: 'left',
    textColor: '#1f2933',
    visible: true,
    width: 340,
    x: 24,
    y: 16,
  });

  const featureYStart = 58;
  model.metadata.features.forEach((feature, index) => {
    const featurePart = modelPart(feature.id);
    const labelId = uniqueId(`${prefix}-${featurePart}-label`, usedIds);
    const controlId = uniqueId(`${prefix}-${featurePart}-input`, usedIds);
    const y = featureYStart + index * 48;

    elements.push({
      fontFamily: 'Arial',
      fontSize: 14,
      height: 32,
      id: labelId,
      kind: 'label',
      label: feature.id,
      mlFeatureId: feature.id,
      mlModelId: model.id,
      screenId,
      textAlign: 'left',
      textColor: '#1f2933',
      visible: true,
      width: 120,
      x: 24,
      y,
    });
    elements.push({
      ...controlElement(model, feature, controlId, 154, y - 2),
      screenId,
    });
  });

  const buttonY = featureYStart + model.metadata.features.length * 48 + 4;
  const predictionButtonId = uniqueId(`${prefix}-predict`, usedIds);
  elements.push({
    backgroundColor: '#248da8',
    borderColor: '#248da8',
    borderRadius: 4,
    borderWidth: 0,
    fontFamily: 'Arial',
    fontSize: 16,
    height: 40,
    id: predictionButtonId,
    kind: 'button',
    label: 'Predict',
    mlModelId: model.id,
    screenId,
    textAlign: 'center',
    textColor: '#ffffff',
    visible: true,
    width: 120,
    x: 24,
    y: buttonY,
  });

  const resultElementId = uniqueId(`${prefix}-prediction`, usedIds);
  elements.push({
    fontFamily: 'Arial',
    fontSize: 18,
    height: 32,
    id: resultElementId,
    kind: 'label',
    label: 'Prediction will appear here',
    mlModelId: model.id,
    screenId,
    textAlign: 'left',
    textColor: '#1f2933',
    visible: true,
    width: 340,
    x: 24,
    y: buttonY + 52,
  });

  return {elements, predictionButtonId, resultElementId};
}

function stripSpaceAndSpecial(value: string) {
  return value.replace(/\W/g, '');
}

function featureKey(value: string) {
  return stripSpaceAndSpecial(value).toLowerCase();
}

function featureNumberMapping(
  featureNumberKey: Record<string, Record<string, number>> | undefined,
  feature: string
) {
  if (!featureNumberKey) {
    return undefined;
  }

  return Object.entries(featureNumberKey).find(
    ([featureId]) => featureKey(featureId) === featureKey(feature)
  )?.[1];
}

function convertFeatureValue(
  featureNumberKey: Record<string, Record<string, number>> | undefined,
  feature: string,
  value: string
) {
  if (!value.trim()) {
    throw new Error(`Missing value for ${feature}`);
  }

  const convertedValue =
    featureNumberMapping(featureNumberKey, feature)?.[value] ?? value;
  const numberValue = Number.parseFloat(String(convertedValue));
  if (!Number.isFinite(numberValue)) {
    throw new Error(`Invalid value for ${feature}`);
  }
  return numberValue;
}

function getFeatureValue(featureValues: MlFeatureValues, featureId: string) {
  const matchingEntry = Object.entries(featureValues).find(
    ([key]) => featureKey(key) === featureKey(featureId)
  );
  return matchingEntry?.[1] ?? '';
}

/**
 * Read the App Lab-style controls generated for an imported model. Keeping
 * this adapter outside the predictor lets the same model consume sprite data.
 */
export function getMlFeatureValuesFromElements(
  modelId: string,
  elements: StageElement[]
): MlFeatureValues {
  return Object.fromEntries(
    elements
      .filter(
        element =>
          element.mlModelId === modelId &&
          (element.kind === 'dropdown' || element.kind === 'textInput') &&
          Boolean(element.mlFeatureId)
      )
      .map(element => [
        element.mlFeatureId as string,
        element.inputValue?.trim() ||
          (element.kind === 'dropdown' ? element.options?.[0] ?? '' : ''),
      ])
  );
}

export async function predictMlModel(
  modelId: string,
  featureValues: MlFeatureValues
): Promise<number | string> {
  const response = await fetch(
    `/api/v1/ml_models/${encodeURIComponent(modelId)}`
  );
  if (!response.ok) {
    throw new Error(`Unable to load model: ${response.status}`);
  }

  const responseData = (await response.json()) as unknown;
  const modelData = (
    typeof responseData === 'string' ? JSON.parse(responseData) : responseData
  ) as MlModelPayload;
  if (
    modelData.selectedTrainer !== 'knnClassify' &&
    modelData.selectedTrainer !== 'knnRegress'
  ) {
    throw new Error('This model trainer is not supported in Build Lab');
  }

  const features = modelData.features?.length
    ? modelData.features
    : (modelData.selectedFeatures ?? []).map(id => ({id}));
  const labelId = modelData.label?.id ?? modelData.labelColumn;
  if (!features.length || !labelId || !modelData.trainedModel) {
    throw new Error('The model is missing prediction data');
  }

  const featureIds = features.map(feature => feature.id);
  const testValues = featureIds.map(feature =>
    convertFeatureValue(
      modelData.featureNumberKey,
      feature,
      getFeatureValue(featureValues, feature)
    )
  );
  const model = KNN.load(modelData.trainedModel);
  const rawPrediction = model.predict(testValues) as number | string;
  const labelMapping = featureNumberMapping(
    modelData.featureNumberKey,
    labelId
  );
  const mappedLabel = labelMapping
    ? Object.entries(labelMapping).find(
        ([, numericValue]) => Number(numericValue) === Number(rawPrediction)
      )?.[0]
    : undefined;
  return mappedLabel ?? rawPrediction;
}
