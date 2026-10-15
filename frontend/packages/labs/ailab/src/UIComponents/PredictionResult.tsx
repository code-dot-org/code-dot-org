/* The model's latest prediction and, for a decision tree, the path to it. */
import {Typography} from '@mui/material';
import classNames from 'classnames';
import {useState} from 'react';
import {createPortal} from 'react-dom';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {formatNumber, thresholdText} from '../helpers/displayTree';
import type {DisplayTreeStep} from '../helpers/displayTreeTrace';
import {getConvertedPredictedLabel} from '../helpers/valueConversion';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {
  getPredictionStep,
  getPredictionTrace,
} from '../selectors/visualizationSelectors';
import {useTrainingData} from '../TrainingDataContext';

import TraceStepper from './TraceStepper';

import appStyles from '../app.module.scss';
import styles from './predictionResult.module.scss';

const PredictionResult = () => {
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const {project} = useProject();
  const labelColumn = project.labelColumn || '';
  const predictedLabel = useAppSelector(state =>
    getConvertedPredictedLabel(state, project)
  );
  const {trainedModel} = useTrainingData();
  const trace = useAppSelector(state =>
    getPredictionTrace(state, project, trainedModel)
  );
  const currentStep = useAppSelector(state =>
    getPredictionStep(state, project, trainedModel)
  );
  const steppedByHand = useAppSelector(state => state.predictionStepByHand);
  const predictionCount = useAppSelector(state => state.predictionCount);
  const [replays, setReplays] = useState(0);

  const valueText = (value: string | number): string =>
    typeof value === 'number'
      ? formatNumber(value)
      : String(getLocalizedValue(value, datasetId));

  const conditionText = ({branch, value}: DisplayTreeStep): string =>
    branch.kind === 'values' ? valueText(value ?? '') : thresholdText(branch);

  const hasPrediction = predictedLabel !== undefined;
  const predictionText = hasPrediction ? valueText(predictedLabel) : '';
  const steps =
    trace && trace.steps.length > 0
      ? [
          ...trace.steps.map(step => ({
            column: getLocalizedColumnName(datasetId, step.column),
            condition: conditionText(step),
          })),
          {
            column: getLocalizedColumnName(datasetId, labelColumn),
            condition: predictionText,
          },
        ]
      : [];

  const stepAnnouncement = (index: number): string => {
    const {column, condition} = steps[index];
    return `Step ${index + 1} of ${steps.length}: ${column} is ${condition}`;
  };

  // VoiceOver reads only the text node that changed and skips a repeat, so this is one string with a flipping invisible tail.
  const repeatMark = '\u200B'.repeat(((predictionCount + replays) % 2) + 1);

  // Read the path whole: a screen reader cuts off each step if playback announces it.
  const announcement = (): string => {
    if (!hasPrediction) {
      return '';
    }
    const text = steppedByHand
      ? stepAnnouncement(currentStep)
      : [
          `AI predicts ${predictionText}`,
          ...steps.map((_, index) => stepAnnouncement(index)),
        ].join('. ');
    return text + repeatMark;
  };

  return (
    <>
      {hasPrediction && (
        <section className={styles.card}>
          <Typography variant="body1" component="h2" className={styles.header}>
            AI predicts <strong>{predictionText}</strong>
          </Typography>
          {steps.length > 0 && (
            <>
              {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- list-style: none strips VoiceOver's list semantics */}
              <ol role="list" className={styles.steps}>
                {steps.map(({column, condition}, index) => (
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
                      {column} is <strong>{condition}</strong>
                    </Typography>
                  </li>
                ))}
              </ol>
              <TraceStepper
                key={predictionCount}
                step={currentStep}
                stepCount={steps.length}
                onReplay={() => setReplays(count => count + 1)}
              />
            </>
          )}
        </section>
      )}
      {/* Always mounted, and last on the page so arrowing never crosses it: a live region speaks only changes made after it appears. */}
      {createPortal(
        <span role="status" className={appStyles.visuallyHidden}>
          {announcement()}
        </span>,
        document.body
      )}
    </>
  );
};

export default PredictionResult;
