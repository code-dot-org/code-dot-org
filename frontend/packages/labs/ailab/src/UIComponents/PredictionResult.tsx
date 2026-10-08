/* The model's latest prediction and, for a decision tree, the path to it. */
import {Typography} from '@mui/material';
import classNames from 'classnames';
import {Fragment} from 'react';

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

import appStyles from '../app.module.scss';
import styles from './predictionResult.module.scss';

const PredictionResult = () => {
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const labelColumn = useAppSelector(state => state.labelColumn || '');
  const predictedLabel = useAppSelector(getConvertedPredictedLabel);
  const trace = useAppSelector(getPredictionTrace);
  const currentStep = useAppSelector(getPredictionStep);
  const steppedByHand = useAppSelector(state => state.predictionStepByHand);

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

  const hasPrediction = predictedLabel !== undefined;
  const predictionText = hasPrediction ? valueText(predictedLabel) : '';
  const steps =
    trace && trace.steps.length > 0
      ? [
          ...trace.steps.map(step =>
            stepText(step.column, conditionText(step)),
          ),
          stepText(labelColumn, predictionText),
        ]
      : [];

  const stepAnnouncement = (index: number) => (
    <>
      Step {index + 1} of {steps.length}: {steps[index]}
    </>
  );

  // Read the path whole: a screen reader cuts off each step if playback announces it.
  const announcement = () => {
    if (!hasPrediction) {
      return null;
    }
    if (steppedByHand) {
      return stepAnnouncement(currentStep);
    }
    return (
      <>
        AI predicts {predictionText}
        {steps.map((_, index) => (
          <Fragment key={index}>. {stepAnnouncement(index)}</Fragment>
        ))}
      </>
    );
  };

  return (
    <>
      {/* Always mounted: a live region speaks only changes made after it appears. */}
      <span role="status" className={appStyles.visuallyHidden}>
        {announcement()}
      </span>
      {hasPrediction && (
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
              <TraceStepper step={currentStep} stepCount={steps.length} />
            </>
          )}
        </section>
      )}
    </>
  );
};

export default PredictionResult;
