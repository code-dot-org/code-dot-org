/* The "Predict … based on …" sentence, with the label and features as tags. */
import classNames from 'classnames';
import type {ReactNode} from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';

import SentenceTag from './SentenceTag';

import appStyles from '../app.module.scss';
import styles from './predictionSentence.module.scss';

const OUTPUT_KEY = '__CDO_OUTPUT__';
const INPUTS_KEY = '__CDO_INPUTS__';

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
            text={label && columnName(label)}
            placeholder="label"
            variant="label"
            size={size}
          />
        );
      }
      if (part === INPUTS_KEY) {
        return features.length > 0 ? (
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
            key={index}
            text={undefined}
            placeholder="feature"
            variant="feature"
            size={size}
          />
        );
      }
      return (
        <span key={index} aria-hidden="true" className={styles.text}>
          {part.trim()}
        </span>
      );
    });

  // The visual pieces have no text between them, so screen readers get the
  // whole sentence as one string instead.
  const readableSentence =
    I18n.t('predictionStatement', {
      output: label ? columnName(label) : 'label',
      inputs:
        features.length > 0 ? features.map(columnName).join(', ') : 'feature',
    }) || '';

  return (
    <div
      className={classNames(
        styles.sentence,
        size === 'm' && styles.mediumSentence,
        className,
      )}
    >
      <span className={appStyles.visuallyHidden}>{readableSentence}</span>
      {sentenceParts}
    </div>
  );
};

export default PredictionSentence;
