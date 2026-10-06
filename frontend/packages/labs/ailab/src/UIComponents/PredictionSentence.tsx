/* The "Predict … based on …" sentence, with the label and features as tags. */
import {Typography} from '@mui/material';
import classNames from 'classnames';
import {useLayoutEffect, useRef, useState} from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';

import SentenceTag from './SentenceTag';

import appStyles from '../app.module.scss';
import styles from './predictionSentence.module.scss';

interface PredictionSentenceProps {
  label: string | undefined;
  features: string[];
  size?: 's' | 'm';
  singleLine?: boolean;
  className?: string;
}

// The ruler holds every feature tag, then the overflow tag at its widest.
function countFittingTags(
  row: HTMLElement,
  lead: HTMLElement,
  ruler: HTMLElement,
) {
  const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
  const widths = Array.from(
    ruler.children,
    tag => (tag as HTMLElement).offsetWidth,
  );
  const overflowTagWidth = widths.pop()!;
  let end = lead.offsetLeft + lead.offsetWidth;
  const tagEnds = widths.map(width => (end += gap + width));
  if (end <= row.clientWidth) {
    return widths.length;
  }
  const lastTagLimit = row.clientWidth - gap - overflowTagWidth;
  return tagEnds.filter(tagEnd => tagEnd <= lastTagLimit).length;
}

const PredictionSentence = ({
  label,
  features,
  size = 's',
  singleLine = false,
  className,
}: PredictionSentenceProps) => {
  const datasetId = useAppSelector(state => state.metadata?.name || '');
  const rowRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);
  const [fittingCount, setFittingCount] = useState(features.length);

  const columnName = (column: string) =>
    getLocalizedColumnName(datasetId, column);

  const labelName = label && columnName(label);
  const readableSentence = `Predict ${labelName || 'label'} based on ${
    features.map(columnName).join(', ') || 'feature'
  }`;

  const visibleCount = singleLine ? fittingCount : features.length;
  const overflowNames = features.slice(visibleCount).map(columnName);

  // A state update from the observer lands after paint, so fit once here too.
  useLayoutEffect(() => {
    if (!singleLine) {
      return;
    }
    const row = rowRef.current!;
    const fit = () =>
      setFittingCount(
        countFittingTags(row, leadRef.current!, rulerRef.current!),
      );
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    return () => observer.disconnect();
  }, [singleLine, labelName, features]);

  const featureTag = (feature: string) => (
    <SentenceTag
      key={feature}
      text={columnName(feature)}
      placeholder="feature"
      variant="feature"
      size={size}
    />
  );

  return (
    <div
      ref={rowRef}
      className={classNames(
        styles.sentence,
        size === 'm' && styles.mediumSentence,
        singleLine && styles.singleLine,
        className,
      )}
    >
      <span className={appStyles.visuallyHidden}>{readableSentence}</span>
      <Typography
        component="span"
        variant="body4"
        aria-hidden="true"
        className={styles.text}
      >
        Predict
      </Typography>
      <SentenceTag
        text={labelName}
        placeholder="label"
        variant="label"
        size={size}
      />
      <Typography
        ref={leadRef}
        component="span"
        variant="body4"
        aria-hidden="true"
        className={styles.text}
      >
        based on
      </Typography>
      {features.length > 0 ? (
        features.slice(0, visibleCount).map(featureTag)
      ) : (
        <SentenceTag
          text={undefined}
          placeholder="feature"
          variant="feature"
          size={size}
        />
      )}
      {overflowNames.length > 0 && (
        <SentenceTag
          text={`+${overflowNames.length}`}
          tooltip={overflowNames.join(', ')}
          placeholder="feature"
          variant="feature"
          size={size}
        />
      )}
      {singleLine && (
        <span ref={rulerRef} aria-hidden="true" className={styles.ruler}>
          {features.map(featureTag)}
          <SentenceTag
            text={`+${features.length}`}
            placeholder="feature"
            variant="feature"
            size={size}
          />
        </span>
      )}
    </div>
  );
};

export default PredictionSentence;
