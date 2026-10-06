/* The "Predict … based on …" sentence, with the label and features as tags. */
import classNames from 'classnames';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';

import SentenceTag from './SentenceTag';

import appStyles from '../app.module.scss';
import styles from './predictionSentence.module.scss';

interface PredictionSentenceProps {
  label: string | undefined;
  features: string[];
  size?: 's' | 'm';
  className?: string;
}

const PredictionSentence = ({
  label,
  features,
  size = 's',
  className,
}: PredictionSentenceProps) => {
  const datasetId = useAppSelector(state => state.metadata?.name || '');

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);

  const labelName = label && columnName(label);
  const readableSentence = `Predict ${labelName || 'label'} based on ${
    features.map(columnName).join(', ') || 'feature'
  }`;

  return (
    <div
      className={classNames(
        styles.sentence,
        size === 'm' && styles.mediumSentence,
        className,
      )}
    >
      <span className={appStyles.visuallyHidden}>{readableSentence}</span>
      <span aria-hidden="true" className={styles.text}>
        Predict
      </span>
      <SentenceTag
        text={labelName}
        placeholder="label"
        variant="label"
        size={size}
      />
      <span aria-hidden="true" className={styles.text}>
        based on
      </span>
      {features.length > 0 ? (
        features.map(feature => (
          <SentenceTag
            key={feature}
            text={columnName(feature)}
            placeholder="feature"
            variant="feature"
            size={size}
          />
        ))
      ) : (
        <SentenceTag
          text={undefined}
          placeholder="feature"
          variant="feature"
          size={size}
        />
      )}
    </div>
  );
};

export default PredictionSentence;
