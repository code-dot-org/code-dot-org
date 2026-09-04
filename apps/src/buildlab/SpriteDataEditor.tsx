import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, {FormEvent, useEffect, useId, useState} from 'react';

import {
  normalizeSpriteDataKey,
  SPRITE_PREDICTION_DATA_KEYS,
  type ImportedMlModel,
  type StageElement,
} from './project';

import styles from './buildlab-view.module.scss';

interface Props {
  models: ImportedMlModel[];
  onChange: (data: Record<string, string> | undefined) => void;
  sprite: StageElement;
}

function comparableKey(key: string) {
  return key.trim().replace(/\W/g, '').toLowerCase();
}

export default function SpriteDataEditor({models, onChange, sprite}: Props) {
  const headingId = useId();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [keyError, setKeyError] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(
    () => models[0]?.id ?? ''
  );

  useEffect(() => {
    setNewKey('');
    setNewValue('');
    setKeyError('');
  }, [sprite.id]);

  useEffect(() => {
    if (!models.some(model => model.id === selectedModelId)) {
      setSelectedModelId(models[0]?.id ?? '');
    }
  }, [models, selectedModelId]);

  const data = sprite.data ?? {};

  const updateValue = (key: string, value: string) => {
    onChange({...data, [key]: value});
  };

  const removeProperty = (key: string) => {
    const nextData = Object.fromEntries(
      Object.entries(data).filter(([candidate]) => candidate !== key)
    );
    onChange(Object.keys(nextData).length ? nextData : undefined);
  };

  const addProperty = (event: FormEvent) => {
    event.preventDefault();
    const key = normalizeSpriteDataKey(newKey);
    const trimmedKey = newKey.trim();
    const normalizedKey = comparableKey(trimmedKey);
    if (!trimmedKey) {
      setKeyError('Enter a property name.');
      return;
    }
    if (!key) {
      setKeyError('Choose a different property name.');
      return;
    }
    if (
      Object.keys(data).some(
        existingKey => comparableKey(existingKey) === normalizedKey
      )
    ) {
      setKeyError('This sprite already has that property.');
      return;
    }

    onChange({...data, [key]: newValue});
    setNewKey('');
    setNewValue('');
    setKeyError('');
  };

  const addModelFeatures = () => {
    const model = models.find(candidate => candidate.id === selectedModelId);
    if (!model) {
      return;
    }

    const existingKeys = new Set(Object.keys(data).map(comparableKey));
    const nextData = {...data};
    model.metadata.features.forEach(feature => {
      const featureId = normalizeSpriteDataKey(feature.id);
      const normalizedFeatureId = comparableKey(feature.id);
      if (
        !featureId ||
        !normalizedFeatureId ||
        existingKeys.has(normalizedFeatureId)
      ) {
        return;
      }
      nextData[featureId] = feature.values?.[0] ?? '';
      existingKeys.add(normalizedFeatureId);
    });
    onChange(nextData);
  };

  return (
    <section aria-labelledby={headingId} className={styles.spriteDataSection}>
      <div className={styles.propertySectionHeading}>
        <Typography component="h3" id={headingId} variant="subtitle2">
          Sprite data
        </Typography>
        <Typography variant="body2">
          Values reset to these defaults each time the project runs.
        </Typography>
      </div>
      {Object.keys(data).length === 0 ? (
        <Typography variant="body2">
          This sprite does not have any data yet.
        </Typography>
      ) : (
        <div className={styles.spriteDataList}>
          {Object.entries(data).map(([key, value]) => (
            <div className={styles.spriteDataRow} key={key}>
              <TextField
                label={`${key} value`}
                name={`sprite-data-${sprite.id}-${key}`}
                onChange={event => updateValue(key, event.target.value)}
                value={value}
              />
              <Button
                aria-label={`Remove ${key} from ${sprite.id}`}
                onClick={() => removeProperty(key)}
                size="small"
                type="button"
                variant="outlined"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <form className={styles.spriteDataForm} onSubmit={addProperty}>
        <TextField
          errorMessage={keyError || undefined}
          label="Property name"
          name={`new-sprite-data-key-${sprite.id}`}
          onChange={event => {
            setNewKey(event.target.value);
            setKeyError('');
          }}
          value={newKey}
        />
        <TextField
          label="Initial value"
          name={`new-sprite-data-value-${sprite.id}`}
          onChange={event => setNewValue(event.target.value)}
          value={newValue}
        />
        <Button size="small" type="submit" variant="outlined">
          Add property
        </Button>
      </form>
      {models.length > 0 && (
        <div className={styles.spriteModelFeatures}>
          <SimpleDropdown
            items={models.map(model => ({text: model.name, value: model.id}))}
            labelText="Imported model"
            name={`sprite-data-model-${sprite.id}`}
            onChange={event => setSelectedModelId(event.target.value)}
            selectedValue={selectedModelId}
          />
          <Button
            disabled={!selectedModelId}
            onClick={addModelFeatures}
            size="small"
            type="button"
            variant="outlined"
          >
            Add model features
          </Button>
        </div>
      )}
      <Typography className={styles.spriteDataHint} variant="body2">
        A predictor sprite stores its result in{' '}
        <strong>{SPRITE_PREDICTION_DATA_KEYS.result}</strong>. Its status and
        error are available as{' '}
        <strong>{SPRITE_PREDICTION_DATA_KEYS.status}</strong> and{' '}
        <strong>{SPRITE_PREDICTION_DATA_KEYS.error}</strong>.
      </Typography>
    </section>
  );
}
