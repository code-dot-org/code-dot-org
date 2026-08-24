import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Modal from '@code-dot-org/component-library/modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';

import type {ImportedMlModel} from './project';

import styles from './buildlab-view.module.scss';

interface Props {
  importedModels: ImportedMlModel[];
  importedModelIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onImport: (model: ImportedMlModel) => Promise<void>;
  onRemove: (modelId: string) => void;
  providedModels: ProvidedMlModel[];
}

export interface ProvidedMlModel {
  id: string;
  name: string;
}

type ModelSource = 'my' | 'provided';

const MODEL_SOURCE_OPTIONS = [
  {text: 'My models', value: 'my'},
  {text: 'Provided models', value: 'provided'},
];

function isModel(value: unknown): value is ImportedMlModel {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ImportedMlModel>;
  return Boolean(
    candidate.id &&
      candidate.name &&
      candidate.metadata?.label &&
      Array.isArray(candidate.metadata.features)
  );
}

export default function MlModelManager({
  importedModels,
  importedModelIds,
  isOpen,
  onClose,
  onImport,
  onRemove,
  providedModels,
}: Props) {
  const [models, setModels] = useState<ImportedMlModel[]>([]);
  const [levelModels, setLevelModels] = useState<ImportedMlModel[]>([]);
  const [modelSource, setModelSource] = useState<ModelSource>('my');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCurrent = true;
    setModels([]);
    setLevelModels([]);
    setModelSource('my');
    setSelectedModelId('');
    setError('');
    setIsLoading(true);

    const myModelsPromise = fetch('/api/v1/ml_models/names').then(
      async response => {
        if (!response.ok) {
          throw new Error(`Unable to load models: ${response.status}`);
        }
        const payload = (await response.json()) as unknown;
        return Array.isArray(payload) ? payload.filter(isModel) : [];
      }
    );
    const providedModelsPromise = Promise.all(
      providedModels.map(async model => {
        const response = await fetch(
          `/api/v1/ml_models/${encodeURIComponent(model.id)}`
        );
        if (!response.ok) {
          throw new Error(`Unable to load model: ${response.status}`);
        }
        const metadata = (await response.json()) as unknown;
        const hydratedModel = {id: model.id, name: model.name, metadata};
        return isModel(hydratedModel) ? hydratedModel : null;
      })
    ).then(models =>
      models.filter((model): model is ImportedMlModel => !!model)
    );

    Promise.allSettled([myModelsPromise, providedModelsPromise]).then(
      ([myModelsResult, providedModelsResult]) => {
        if (!isCurrent) {
          return;
        }

        const myModels =
          myModelsResult.status === 'fulfilled' ? myModelsResult.value : [];
        const loadedProvidedModels =
          providedModelsResult.status === 'fulfilled'
            ? providedModelsResult.value
            : [];
        setModels(myModels);
        setLevelModels(loadedProvidedModels);
        const initialSource: ModelSource =
          myModels.length > 0 || loadedProvidedModels.length === 0
            ? 'my'
            : 'provided';
        setModelSource(initialSource);
        const initialModels =
          initialSource === 'my' ? myModels : loadedProvidedModels;
        setSelectedModelId(
          initialModels.find(model => !importedModelIds.includes(model.id))
            ?.id ?? ''
        );
        if (myModelsResult.status === 'rejected') {
          setError(
            'Unable to load your trained models. Sign in to Studio and try again.'
          );
        } else if (providedModelsResult.status === 'rejected') {
          setError('Unable to load the models provided for this level.');
        }
        setIsLoading(false);
      }
    );

    return () => {
      isCurrent = false;
    };
  }, [importedModelIds, isOpen, providedModels]);

  if (!isOpen) {
    return null;
  }

  const sourceModels = modelSource === 'my' ? models : levelModels;
  const availableModels = sourceModels.filter(
    model => !importedModelIds.includes(model.id)
  );
  const selectedModel = availableModels.find(
    model => model.id === selectedModelId
  );
  const modelDetails = (model: ImportedMlModel) => (
    <div className={styles.mlModelDetails}>
      <Typography component="h4" variant="subtitle1">
        {model.metadata.name ?? model.name}
      </Typography>
      <Typography variant="body2">
        Predict <strong>{model.metadata.label.id}</strong> from{' '}
        {model.metadata.features.map(feature => feature.id).join(', ')}.
      </Typography>
      {model.metadata.summaryStat?.stat !== undefined && (
        <Typography variant="body2">
          Accuracy: {model.metadata.summaryStat.stat}%
        </Typography>
      )}
      <Typography variant="body2">
        Inputs: {model.metadata.features.length}
      </Typography>
    </div>
  );
  const metadata = selectedModel?.metadata;

  const importModel = async () => {
    if (!selectedModel || isImporting) {
      return;
    }

    setIsImporting(true);
    setError('');
    try {
      await onImport(selectedModel);
      onClose();
    } catch {
      setError('This model could not be imported. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSourceChange = (source: ModelSource) => {
    setModelSource(source);
    const nextModels = source === 'my' ? models : levelModels;
    setSelectedModelId(
      nextModels.find(model => !importedModelIds.includes(model.id))?.id ?? ''
    );
  };

  return (
    <Modal
      className={styles.mlModelModal}
      customContent={
        <div className={styles.mlModelManager}>
          <div className={styles.mlModelSection}>
            <Typography component="h3" variant="subtitle1">
              Imported into this project
            </Typography>
            {importedModels.length === 0 ? (
              <Typography variant="body2">
                No models have been imported into this project.
              </Typography>
            ) : (
              <div className={styles.mlModelList}>
                {importedModels.map(model => (
                  <div className={styles.mlModelListItem} key={model.id}>
                    <div>
                      <Typography component="h4" variant="body2">
                        {model.name}
                      </Typography>
                      <Typography variant="body2">
                        Predicts {model.metadata.label.id} from{' '}
                        {model.metadata.features.length} input
                        {model.metadata.features.length === 1 ? '' : 's'}
                      </Typography>
                    </div>
                    <Button
                      disabled={isImporting}
                      onClick={() => onRemove(model.id)}
                      size="small"
                      variant="outlined"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.mlModelSection}>
            <Typography component="h3" variant="subtitle1">
              Import another model
            </Typography>
            {providedModels.length > 0 && (
              <SimpleDropdown
                items={MODEL_SOURCE_OPTIONS}
                labelText="Model source"
                name="buildlab-ml-model-source"
                onChange={event =>
                  handleSourceChange(event.target.value as ModelSource)
                }
                selectedValue={modelSource}
              />
            )}
            {isLoading && (
              <Typography variant="body2">Loading models...</Typography>
            )}
            {!isLoading && error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {!isLoading && !error && availableModels.length === 0 && (
              <Typography variant="body2">
                {modelSource === 'provided'
                  ? 'No models have been provided for this level.'
                  : 'No additional trained models are available for your account.'}
              </Typography>
            )}
            {!isLoading && !error && availableModels.length > 0 && (
              <>
                <SimpleDropdown
                  items={availableModels.map(model => ({
                    text: model.name,
                    value: model.id,
                  }))}
                  labelText="Trained model"
                  name="buildlab-ml-model"
                  onChange={event => setSelectedModelId(event.target.value)}
                  selectedValue={selectedModelId}
                />
                {selectedModel && metadata && modelDetails(selectedModel)}
              </>
            )}
          </div>
        </div>
      }
      onClose={onClose}
      primaryButtonProps={{
        children: isImporting ? 'Importing...' : 'Import model',
        disabled: isLoading || !selectedModel || isImporting,
        onClick: importModel,
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        disabled: isImporting,
        onClick: onClose,
      }}
      title="Import a trained ML model"
    />
  );
}
