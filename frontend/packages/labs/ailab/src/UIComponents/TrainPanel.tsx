/* Panel for choosing a model's label and features, then training it. */
import {DropdownProviderWrapper} from '@code-dot-org/component-library/common/contexts';
import CheckboxDropdown from '@code-dot-org/component-library/dropdown/checkboxDropdown';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {type ChangeEvent} from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {hasCurrentTrainingResult} from '../helpers/navigationValidation';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {readyToTrain, setTrainingModalStep} from '../redux';
import {getSelectableColumns} from '../selectors';
import {useTrainingRun} from '../useTrainingRun';

import FieldLabel from './FieldLabel';
import PredictionSentence from './PredictionSentence';
import TrainingResultCard from './TrainingResultCard';

import styles from './trainPanel.module.scss';

const TrainPanel = () => {
  const dispatch = useAppDispatch();
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const labelIsPreset = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const featuresLocked = useAppSelector(state => !!state.mode?.lockFeatures);
  const pretrained = useAppSelector(state => !!state.mode?.pretrained);
  const selectableColumns = useAppSelector(getSelectableColumns, deepEqual);
  const {
    project,
    setLabelColumn,
    addSelectedFeature,
    removeSelectedFeature,
    setSelectedFeatures,
  } = useProject();
  const {labelColumn, selectedFeatures} = project;
  const canTrain = readyToTrain(project);
  const hasTrainingResult = hasCurrentTrainingResult(project);
  const {beginRun} = useTrainingRun();

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);

  const labelColumns = featuresLocked
    ? selectableColumns.filter(column => !selectedFeatures.includes(column))
    : selectableColumns;
  const labelItems = [
    {value: '', text: 'Choose one', disabled: true},
    ...labelColumns.map(column => ({
      value: column,
      text: columnName(column),
    })),
  ];

  const featureOptions = selectableColumns
    .filter(column => column !== labelColumn)
    .map(column => ({value: column, label: columnName(column)}));

  const onLabelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLabelColumn(event.target.value);
  };

  const onFeatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {value, checked} = event.target;
    if (checked) {
      addSelectedFeature(value);
    } else {
      removeSelectedFeature(value);
    }
  };

  const onSelectAllFeatures = () => {
    setSelectedFeatures(featureOptions.map(option => option.value));
  };

  const onRemoveAllFeatures = () => {
    setSelectedFeatures([]);
  };

  const onTrain = () => {
    beginRun();
    dispatch(setTrainingModalStep('training'));
  };

  const featuresSummary =
    selectedFeatures.length > 0
      ? `${selectedFeatures.length} selected`
      : 'Choose one or more';

  return (
    <div id="train-panel" className={styles.panel}>
      <div className={styles.header}>
        <Typography component="h3" variant="overline2" className={styles.title}>
          Train
        </Typography>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <FieldLabel
                text="Predict"
                tooltip="What you want your model to predict."
              />
              <SimpleDropdown
                name="ailab-label"
                labelText="Predict"
                isLabelVisible={false}
                dropdownTextThickness="thin"
                size="s"
                className={styles.dropdown}
                items={labelItems}
                selectedValue={labelColumn ?? ''}
                onChange={onLabelChange}
                disabled={labelIsPreset}
              />
            </div>
            <div className={classNames(styles.field, styles.featuresField)}>
              <FieldLabel
                text="Using"
                tooltip="What your model will use to make a prediction."
              />
              <DropdownProviderWrapper>
                <CheckboxDropdown
                  name="ailab-features"
                  labelText={featuresSummary}
                  aria-label={`Using, ${featuresSummary}`}
                  labelType="thin"
                  size="s"
                  className={styles.featuresDropdown}
                  allOptions={featureOptions}
                  checkedOptions={selectedFeatures}
                  onChange={onFeatureChange}
                  doneText="Done"
                  selectAllText="Select All"
                  clearAllText="Clear"
                  onClearAll={onRemoveAllFeatures}
                  onSelectAll={onSelectAllFeatures}
                  disabled={featuresLocked}
                />
              </DropdownProviderWrapper>
            </div>
          </div>
          <PredictionSentence
            label={labelColumn}
            features={selectedFeatures}
            className={styles.sentence}
          />
          {!hasTrainingResult && !pretrained && (
            <div className={styles.actionRow}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                fullWidth
                disabled={!canTrain}
                onClick={onTrain}
              >
                Train model
              </Button>
            </div>
          )}
        </div>
        <TrainingResultCard />
      </div>
    </div>
  );
};

export default TrainPanel;
