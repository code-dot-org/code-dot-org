import {Button} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  Heading3,
  OverlineTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, Box} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useMemo, useState} from 'react';

import {Breakdown} from '../../../WorkshopFormTemplate/types';
import {CRITICAL_CONCERN_LIMIT, NEEDS_ATTENTION_LIMIT} from '../constants';

import {PercentageBarGroup} from './PercentageBarGroup';

import styles from './ScoreCardStyles.module.scss';
import commonStyles from '../../workshop.module.scss';

interface ScoreCardProps {
  title: string;
  longTitle: string;
  description: string;
  footer: string | null;
  questionType: 'likert' | 'promoter';
  score?: number | null;
  responseCount?: number;
  minResponseCount?: number;
  breakdown?: Breakdown[];
}

export const ScoreCard: FC<ScoreCardProps> = ({
  title,
  longTitle,
  description,
  footer,
  questionType,
  score,
  responseCount,
  minResponseCount,
  breakdown,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const insufficientData = useMemo(
    () =>
      (typeof responseCount === 'number' &&
        typeof minResponseCount === 'number' &&
        responseCount < minResponseCount) ||
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
    <>
      <Card
        className={classNames(commonStyles.card, commonStyles.questionCard)}
      >
        <CardContent className={commonStyles.cardContent}>
          <Box>
            <OverlineTwoText noMargin>
              <StrongText>{title}</StrongText>
            </OverlineTwoText>
            <BodyFourText className={commonStyles.description} noMargin>
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
          <Box className={styles.scoreCardFooterText}>
            <FontAwesomeV6Icon iconName="info-circle" />
            <BodyFourText noMargin>{footer}</BodyFourText>
          </Box>
          {breakdown && !insufficientData && (
            <Button
              className={styles.breakdownButton}
              text="See breakdown"
              type="tertiary"
              size="s"
              onClick={() => setShowBreakdown(true)}
            />
          )}
        </Box>
      </Card>
      {showBreakdown && breakdown && (
        <CustomDialog
          aria-labelledby="response-breakdown"
          className={commonStyles.customDialog}
          onClose={() => setShowBreakdown(false)}
        >
          <Heading3 id="response-breakdown" noMargin>
            Response breakdown
          </Heading3>
          <Box className={styles.breakdownContentContainer}>
            <Box
              id="dsco-dialog-description"
              className={styles.longTitleContainer}
            >
              <BodyThreeText noMargin>
                <StrongText>{longTitle}</StrongText>
              </BodyThreeText>
              <BodyFourText
                noMargin
              >{`${responseCount} responses received`}</BodyFourText>
            </Box>
            {questionType === 'likert' && (
              <PercentageBarGroup
                className={styles.breakdownBarGroup}
                items={breakdown}
                barLabel="Teachers"
              />
            )}
          </Box>
          <Button
            className={styles.breakdownCloseButton}
            text="Return to dashboard"
            onClick={() => setShowBreakdown(false)}
          />
        </CustomDialog>
      )}
    </>
  );
};
