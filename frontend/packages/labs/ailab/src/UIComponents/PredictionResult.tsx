/* The model's latest prediction and, for a decision tree, the path to it. */
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {formatNumber, thresholdText} from '../helpers/displayTree';
import type {DisplayTreeStep} from '../helpers/displayTreeTrace';
import {getConvertedPredictedLabel} from '../helpers/valueConversion';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {getPredictionTrace} from '../selectors/visualizationSelectors';

import styles from './predictionResult.module.scss';

const PredictionResult = () => {
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const labelColumn = useAppSelector(state => state.labelColumn || '');
  const predictedLabel = useAppSelector(getConvertedPredictedLabel);
  const trace = useAppSelector(getPredictionTrace);

  if (predictedLabel === undefined) {
    return null;
  }

  const valueText = (value: string | number): string =>
    typeof value === 'number'
      ? formatNumber(value)
      : String(getLocalizedValue(value, datasetId));

  const conditionText = ({branch, value}: DisplayTreeStep): string =>
    branch.kind === 'values' ? valueText(value ?? '') : thresholdText(branch);

  const predictionText = valueText(predictedLabel);
  const steps =
    trace && trace.steps.length > 0
      ? [
          ...trace.steps.map(step => ({
            subject: getLocalizedColumnName(datasetId, step.column),
            condition: conditionText(step),
          })),
          {
            subject: getLocalizedColumnName(datasetId, labelColumn),
            condition: predictionText,
          },
        ]
      : [];

  return (
    <section className={styles.card}>
      <h2 className={styles.header}>
        AI predicts <strong>{predictionText}</strong>
      </h2>
      {steps.length > 0 && (
        <ol className={styles.steps}>
          {steps.map(({subject, condition}, index) => (
            <li key={index} className={styles.step}>
              <span aria-hidden="true" className={styles.stepNumber}>
                {index + 1}
              </span>
              <span>
                {subject} is <strong>{condition}</strong>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default PredictionResult;
