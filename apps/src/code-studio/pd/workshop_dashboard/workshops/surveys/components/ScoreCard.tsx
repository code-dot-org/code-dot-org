import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  OverlineTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, Box} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import styles from '../../workshop.module.scss';

interface ScoreCardProps {
  title: string | null;
  description: string | null;
  footer: string | null;
  score?: number | null;
  responseCount?: number;
  minResponseCount?: number;
}

export const CRITICAL_CONCERN_LIMIT = 50;
export const NEEDS_ATTENTION_LIMIT = 70;

export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  description,
  footer,
  score,
  responseCount,
  minResponseCount,
}) => {
  const insufficientData = useMemo(
    () =>
      (responseCount && minResponseCount && responseCount < minResponseCount) ||
      score === null ||
      score === undefined,
    [responseCount, minResponseCount, score]
  );

  const responseBasedDescription = useMemo(() => {
    if (!responseCount) {
      return 'No responses received';
    }
    if (insufficientData) {
      return `Insufficient data (<${minResponseCount} responses)`;
    }
    return description;
  }, [description, insufficientData, minResponseCount, responseCount]);

  const responseBasedScore = useMemo(() => {
    if (!responseCount) {
      return <FontAwesomeV6Icon iconName="dash" />;
    }
    if (insufficientData) {
      return <FontAwesomeV6Icon iconName="question" />;
    }
    return (
      <BodyThreeText noMargin visualAppearance="heading-lg">
        {score}
      </BodyThreeText>
    );
  }, [insufficientData, responseCount, score]);

  const status = useMemo(() => {
    if (!responseCount || insufficientData) {
      return 'insufficientData';
    }
    if ((score ?? 0) < CRITICAL_CONCERN_LIMIT) {
      return 'criticalConcern';
    }
    if ((score ?? 0) < NEEDS_ATTENTION_LIMIT) {
      return 'needsAttention';
    }
    return 'good';
  }, [score, responseCount, insufficientData]);

  return (
    <Card className={classNames(styles.card, styles.scoreCard)}>
      <CardContent className={styles.cardContent}>
        <Box>
          <OverlineTwoText noMargin>
            <StrongText>{title}</StrongText>
          </OverlineTwoText>
          <BodyFourText className={styles.description} noMargin>
            {responseBasedDescription}
          </BodyFourText>
        </Box>

        <Box
          className={classNames(styles.scoreBox, styles[status])}
          data-status={status}
        >
          {responseBasedScore}
        </Box>
      </CardContent>
      <Box className={styles.scoreCardFooter}>
        <FontAwesomeV6Icon iconName="info-circle" />
        <BodyFourText noMargin>{footer}</BodyFourText>
      </Box>
    </Card>
  );
};
