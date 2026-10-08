/* Panel for choosing a model's label and features, then training it. */
import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import type {ChangeEvent} from 'react';

import {DropdownProviderWrapper} from '@code-dot-org/component-library/common/contexts';
import CheckboxDropdown from '@code-dot-org/component-library/dropdown/checkboxDropdown';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {hasCurrentTrainingResult} from '../helpers/navigationValidation';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {
  addSelectedFeature,
  readyToTrain,
  removeSelectedFeature,
  setLabelColumn,
  setTrainingModalStep,
} from '../redux';
import {getSelectableColumns} from '../selectors';
import {store} from '../store';
import train from '../train';

import FieldLabel from './FieldLabel';
import PredictionSentence from './PredictionSentence';
import TrainingResultCard from './TrainingResultCard';

import styles from './trainPanel.module.scss';

const TrainPanel = () => {
  const dispatch = useAppDispatch();
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const labelColumn = useAppSelector(state => state.labelColumn);
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const labelIsPreset = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const selectableColumns = useAppSelector(getSelectableColumns, deepEqual);
  const canTrain = useAppSelector(readyToTrain);
  const hasTrainingResult = useAppSelector(hasCurrentTrainingResult);

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);

  const labelItems = [
    {value: '', text: 'Choose one', disabled: true},
    ...selectableColumns.map(column => ({
      value: column,
      text: columnName(column),
    })),
  ];

  const featureOptions = selectableColumns
    .filter(column => column !== labelColumn)
    .map(column => ({value: column, label: columnName(column)}));

  const onLabelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setLabelColumn(event.target.value));
  };

  const onFeatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {value, checked} = event.target;
    dispatch(
      checked ? addSelectedFeature(value) : removeSelectedFeature(value),
    );
  };

  const onTrain = () => {
    train.init(store);
    train.onClickTrain();
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
                  hideControls
                />
              </DropdownProviderWrapper>
            </div>
          </div>
          <PredictionSentence
            label={labelColumn}
            features={selectedFeatures}
            className={styles.sentence}
          />
          {!hasTrainingResult && (
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
