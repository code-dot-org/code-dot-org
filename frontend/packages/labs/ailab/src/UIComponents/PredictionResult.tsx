/* The model's latest prediction and, for a decision tree, the path to it. */
import {Typography} from '@mui/material';
import classNames from 'classnames';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {formatNumber, thresholdText} from '../helpers/displayTree';
import type {DisplayTreeStep} from '../helpers/displayTreeTrace';
import {getConvertedPredictedLabel} from '../helpers/valueConversion';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {
  getPredictionStep,
  getPredictionTrace,
} from '../selectors/visualizationSelectors';

import TraceStepper from './TraceStepper';

import styles from './predictionResult.module.scss';

const PredictionResult = () => {
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const labelColumn = useAppSelector(state => state.labelColumn || '');
  const predictedLabel = useAppSelector(getConvertedPredictedLabel);
  const trace = useAppSelector(getPredictionTrace);
  const currentStep = useAppSelector(getPredictionStep);

  if (predictedLabel === undefined) {
    return null;
  }

  const valueText = (value: string | number): string =>
    typeof value === 'number'
      ? formatNumber(value)
      : String(getLocalizedValue(value, datasetId));

  const conditionText = ({branch, value}: DisplayTreeStep): string =>
    branch.kind === 'values' ? valueText(value ?? '') : thresholdText(branch);

  const stepText = (column: string, condition: string) => (
    <>
      {getLocalizedColumnName(datasetId, column)} is{' '}
      <strong>{condition}</strong>
    </>
  );

  const predictionText = valueText(predictedLabel);
  const steps =
    trace && trace.steps.length > 0
      ? [
          ...trace.steps.map(step =>
            stepText(step.column, conditionText(step)),
          ),
          stepText(labelColumn, predictionText),
        ]
      : [];

  return (
    <section className={styles.card}>
      <Typography variant="body1" component="h2" className={styles.header}>
        AI predicts <strong>{predictionText}</strong>
      </Typography>
      {steps.length > 0 && (
        <>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- list-style: none strips VoiceOver's list semantics */}
          <ol role="list" className={styles.steps}>
            {steps.map((text, index) => (
              <li
                key={index}
                aria-current={index === currentStep ? 'step' : undefined}
                className={classNames(styles.step, {
                  [styles.currentStep]: index === currentStep,
                })}
              >
                <Typography
                  variant="label4"
                  aria-hidden="true"
                  className={styles.stepNumber}
                >
                  {index + 1}
                </Typography>
                <Typography variant="body3" component="span">
                  {text}
                </Typography>
              </li>
            ))}
          </ol>
          <TraceStepper step={currentStep} stepLabels={steps} />
        </>
      )}
    </section>
  );
};

export default PredictionResult;
