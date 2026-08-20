import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Modal from '@code-dot-org/component-library/modal';

import type {ImportedMlModel} from './project';

import styles from './build-lab.module.scss';

interface Props {
  importedModelIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onImport: (model: ImportedMlModel) => Promise<void>;
}

function isModel(value: unknown): value is ImportedMlModel {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ImportedMlModel>;
  return Boolean(
    candidate.id &&
      candidate.name &&
      candidate.metadata?.label &&
      Array.isArray(candidate.metadata.features),
  );
}

export default function MlModelManager({
  importedModelIds,
  isOpen,
  onClose,
  onImport,
}: Props) {
  const [models, setModels] = useState<ImportedMlModel[]>([]);
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
    setSelectedModelId('');
    setError('');
    setIsLoading(true);

    fetch('/api/v1/ml_models/names')
      .then(async response => {
        if (!response.ok) {
          throw new Error(`Unable to load models: ${response.status}`);
        }
        return (await response.json()) as unknown;
      })
      .then(payload => {
        if (!isCurrent) {
          return;
        }
        const availableModels = Array.isArray(payload)
          ? payload.filter(isModel)
          : [];
        setModels(availableModels);
        setSelectedModelId(availableModels[0]?.id ?? '');
      })
      .catch(() => {
        if (isCurrent) {
          setError(
            'Unable to load trained models. Sign in to Studio and try again.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const selectedModel = models.find(model => model.id === selectedModelId);
  const imported = selectedModel
    ? importedModelIds.includes(selectedModel.id)
    : false;
  const metadata = selectedModel?.metadata;

  const importModel = async () => {
    if (!selectedModel || imported || isImporting) {
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

  return (
    <Modal
      className={styles.mlModelModal}
      customContent={
        <div className={styles.mlModelManager}>
          {isLoading && (
            <Typography variant="body2">Loading models...</Typography>
          )}
          {!isLoading && error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {!isLoading && !error && models.length === 0 && (
            <Typography variant="body2">
              No trained models are available for this account yet.
            </Typography>
          )}
          {!isLoading && !error && models.length > 0 && (
            <>
              <SimpleDropdown
                items={models.map(model => ({
                  text: model.name,
                  value: model.id,
                }))}
                labelText="Trained model"
                name="buildlab-ml-model"
                onChange={event => setSelectedModelId(event.target.value)}
                selectedValue={selectedModelId}
              />
              {selectedModel && metadata && (
                <div className={styles.mlModelDetails}>
                  <Typography component="h3" variant="subtitle1">
                    {metadata.name ?? selectedModel.name}
                  </Typography>
                  <Typography variant="body2">
                    Predict <strong>{metadata.label.id}</strong> from{' '}
                    {metadata.features.map(feature => feature.id).join(', ')}.
                  </Typography>
                  {metadata.summaryStat?.stat !== undefined && (
                    <Typography variant="body2">
                      Accuracy: {metadata.summaryStat.stat}%
                    </Typography>
                  )}
                  {metadata.potentialUses && (
                    <Typography variant="body2">
                      Intended use: {metadata.potentialUses}
                    </Typography>
                  )}
                  {metadata.potentialMisuses && (
                    <Typography variant="body2">
                      Notes: {metadata.potentialMisuses}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Inputs: {metadata.features.length}
                  </Typography>
                </div>
              )}
              {imported && (
                <Typography variant="body2">
                  This model is already imported into the project.
                </Typography>
              )}
            </>
          )}
        </div>
      }
      onClose={onClose}
      primaryButtonProps={{
        children: isImporting ? 'Importing...' : 'Import model',
        disabled: isLoading || !selectedModel || imported || isImporting,
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
