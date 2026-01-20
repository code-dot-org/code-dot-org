import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classnames from 'classnames';
import React from 'react';

import styles from './studentCFUWidgetHeader.module.scss';

interface CfuWidgetHeaderProps {
  completed: number;
  total: number;
  accuracy: number;
  counts: {
    correct: number;
    partially_correct: number;
    incorrect: number;
    incomplete: number;
  };
}

const LargeCard: React.FC<{value: string | number; label: string}> = ({
  value,
  label,
}) => (
  <div className={classnames(styles.summaryCard, styles.largeCard)}>
    <div className={styles.summaryCardContent}>
      <Typography variant="h4" className={styles.cardValue}>
        {value}
      </Typography>
      <Typography variant="overline3" className={styles.cardLabel}>
        {label}
      </Typography>
    </div>
  </div>
);

const SmallCard: React.FC<{
  count: number;
  label: string;
  iconName: string;
  cardStyle: string;
}> = ({count, label, iconName, cardStyle}) => (
  <div className={classnames(styles.summaryCard, styles.smallCard, cardStyle)}>
    <div className={styles.iconContainer}>
      <FontAwesomeV6Icon iconName={iconName} className={styles.icon} />
    </div>
    <Typography variant="overline3" className={styles.cardText}>
      {count} {label}
    </Typography>
  </div>
);

const CfuWidgetHeader: React.FC<CfuWidgetHeaderProps> = ({
  completed,
  total,
  accuracy,
  counts,
}) => {
  return (
    <div className={styles.studentCFUWidgetSummaryHeader}>
      <div className={styles.titleRow}>
        <Typography variant="h3">
          <Typography variant="strong">
            Check For Understanding Questions
          </Typography>
        </Typography>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryLabel}>
          <Typography variant="body3">
            <strong>Summary</strong>
          </Typography>
        </div>

        <div className={styles.summaryCards}>
          <div className={styles.metricsContainer}>
            <LargeCard value={`${completed} of ${total}`} label="completed" />
            <LargeCard value={`${accuracy}%`} label="Accuracy" />
          </div>
          <div className={styles.correctnessContainer}>
            <div className={styles.smallCardsRow}>
              <SmallCard
                count={counts.correct}
                label="Correct"
                iconName="check"
                cardStyle={styles.correctCard}
              />
              <SmallCard
                count={counts.partially_correct}
                label="Partially correct"
                iconName="circle-half-stroke"
                cardStyle={styles.partiallyCorrectCard}
              />
            </div>
            <div className={styles.smallCardsRow}>
              <SmallCard
                count={counts.incorrect}
                label="Incorrect"
                iconName="xmark"
                cardStyle={styles.incorrectCard}
              />
              <SmallCard
                count={counts.incomplete}
                label="Incomplete"
                iconName="empty-set"
                cardStyle={styles.incompleteCard}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CfuWidgetHeader;
