/* Panel for trying a trained model on new inputs. */
import {Button, Typography} from '@mui/material';
import type {ChangeEvent} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getRandomPredictInputs} from '../helpers/randomPredictInputs';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import {getPredictAvailable, setTestData, setTestDataValues} from '../redux';
import {
  getDecimalPlacesByColumn,
  getExtremaByColumn,
  getSelectedCategoricalFeatures,
  getSelectedNumericalFeatures,
  getUniqueOptionsByColumn,
} from '../selectors';
import train from '../train';

import PredictionResult from './PredictionResult';

import styles from './testPanel.module.scss';

const TestPanel = () => {
  const dispatch = useAppDispatch();
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const testData = useAppSelector(state => state.testData);
  const numericalFeatures = useAppSelector(getSelectedNumericalFeatures);
  const categoricalFeatures = useAppSelector(getSelectedCategoricalFeatures);
  const extremaByColumn = useAppSelector(getExtremaByColumn);
  const decimalPlacesByColumn = useAppSelector(getDecimalPlacesByColumn);
  const uniqueOptionsByColumn = useAppSelector(getUniqueOptionsByColumn);
  const predictAvailable = useAppSelector(getPredictAvailable);

  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    feature: string,
  ) => {
    dispatch(setTestData(feature, event.target.value));
  };

  const onClickRandom = () => {
    dispatch(
      setTestDataValues(
        getRandomPredictInputs({
          numericalFeatures,
          categoricalFeatures,
          extremaByColumn,
          decimalPlacesByColumn,
          uniqueOptionsByColumn,
        }),
      ),
    );
  };

  const renderField = (feature: string) => {
    const name = `ailab-test-${feature}`;
    const label = getLocalizedColumnName(datasetId, feature);

    if (numericalFeatures.includes(feature)) {
      const decimalPlaces = decimalPlacesByColumn[feature];
      const {min, max} = extremaByColumn[feature];
      return (
        <TextField
          key={feature}
          name={name}
          label={label}
          inputType="number"
          size="s"
          className={styles.field}
          value={testData[feature] ?? ''}
          placeholder={`min ${+min.toFixed(decimalPlaces)}, max ${+max.toFixed(decimalPlaces)}`}
          onChange={event => onChange(event, feature)}
        />
      );
    }

    const items = [
      {value: '', text: 'Choose one', disabled: true},
      ...uniqueOptionsByColumn[feature].map(option => ({
        value: option,
        text: String(getLocalizedValue(option, datasetId)),
      })),
    ];
    return (
      <SimpleDropdown
        key={feature}
        name={name}
        labelText={label}
        dropdownTextThickness="thin"
        size="s"
        className={styles.field}
        items={items}
        selectedValue={String(testData[feature] ?? '')}
        onChange={event => onChange(event, feature)}
      />
    );
  };

  return (
    <div id="test-panel" className={styles.panel}>
      <section className={styles.card}>
        <Typography
          variant="label3"
          component="h2"
          className={styles.cardHeader}
        >
          Make a prediction
        </Typography>
        <div className={styles.fields}>{selectedFeatures.map(renderField)}</div>
        <div className={styles.actionRow}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={!predictAvailable}
            onClick={train.onClickPredict}
          >
            Predict
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={
              <FontAwesomeV6Icon iconName="shuffle" aria-hidden="true" />
            }
            onClick={onClickRandom}
          >
            Random
          </Button>
        </div>
      </section>
      <div aria-live="polite">
        <PredictionResult />
      </div>
    </div>
  );
};

export default TestPanel;
