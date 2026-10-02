/* Panel for choosing a model's label and features, then training it. */
import {Button, IconButton as MuiIconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import type {ChangeEvent, ReactNode} from 'react';

import {DropdownProviderWrapper} from '@code-dot-org/component-library/common/contexts';
import CheckboxDropdown from '@code-dot-org/component-library/dropdown/checkboxDropdown';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
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

import styles from './trainPanel.module.scss';

interface FieldLabelProps {
  text: string;
  tooltip: string;
}

const FieldLabel = ({text, tooltip}: FieldLabelProps) => (
  <div className={styles.fieldLabel}>
    <span aria-hidden="true">{text}</span>
    <Tooltip title={tooltip}>
      <MuiIconButton
        variant="text"
        color="tertiary"
        size="extraSmall"
        className={styles.infoButton}
        aria-label={`About ${text}`}
      >
        <FontAwesomeV6Icon iconName="circle-info" iconStyle="solid" />
      </MuiIconButton>
    </Tooltip>
  </div>
);

interface SentenceTagProps {
  text: string | undefined;
  placeholder: string;
  variant: 'label' | 'feature';
}

const SentenceTag = ({text, placeholder, variant}: SentenceTagProps) => (
  <span
    aria-hidden="true"
    className={classNames(
      styles.tag,
      text ? styles[`${variant}Tag`] : styles.placeholderTag,
    )}
  >
    {text || placeholder}
  </span>
);

const TrainPanel = () => {
  const dispatch = useAppDispatch();
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const labelColumn = useAppSelector(state => state.labelColumn);
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const labelIsPreset = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const selectableColumns = useAppSelector(getSelectableColumns, deepEqual);
  const canTrain = useAppSelector(readyToTrain);

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

  const OUTPUT_KEY = '__CDO_OUTPUT__';
  const INPUTS_KEY = '__CDO_INPUTS__';
  const sentence =
    I18n.t('predictionStatement', {output: OUTPUT_KEY, inputs: INPUTS_KEY}) ||
    '';
  const sentenceParts: ReactNode[] = sentence
    .split(new RegExp(`(${OUTPUT_KEY}|${INPUTS_KEY})`))
    .filter(part => part.trim())
    .map((part, index) => {
      if (part === OUTPUT_KEY) {
        return (
          <SentenceTag
            key={index}
            text={labelColumn && columnName(labelColumn)}
            placeholder="label"
            variant="label"
          />
        );
      }
      if (part === INPUTS_KEY) {
        return selectedFeatures.length > 0 ? (
          selectedFeatures.map(feature => (
            <SentenceTag
              key={feature}
              text={columnName(feature)}
              placeholder="feature"
              variant="feature"
            />
          ))
        ) : (
          <SentenceTag
            key={index}
            text={undefined}
            placeholder="feature"
            variant="feature"
          />
        );
      }
      return (
        <span key={index} aria-hidden="true" className={styles.sentenceText}>
          {part.trim()}
        </span>
      );
    });

  // The visual pieces have no text between them, so screen readers get the
  // whole sentence as one string instead.
  const readableSentence =
    I18n.t('predictionStatement', {
      output: labelColumn ? columnName(labelColumn) : 'label',
      inputs:
        selectedFeatures.length > 0
          ? selectedFeatures.map(columnName).join(', ')
          : 'feature',
    }) || '';

  return (
    <div id="train-panel" className={styles.panel}>
      <h2 className={styles.header}>Train</h2>
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
          <div className={styles.sentence}>
            <span className={styles.visuallyHidden}>{readableSentence}</span>
            {sentenceParts}
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default TrainPanel;
