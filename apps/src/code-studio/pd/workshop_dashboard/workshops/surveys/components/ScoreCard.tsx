import {Button} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Card, CardContent, Box, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useMemo, useState} from 'react';

import {Breakdown} from '../../types';
import {CRITICAL_CONCERN_LIMIT, NEEDS_ATTENTION_LIMIT} from '../constants';

import {SimpleBarChart} from './BarChartGroup';
import {PercentageBarGroup} from './PercentageBarGroup';

import styles from './ScoreCard.module.scss';
import commonStyles from '../../WorkshopLayout.module.scss';

interface ScoreCardProps {
  title: string;
  longTitle: string;
  description: string;
  footer: string | null;
  questionType: 'likert' | 'promoter';
  score?: number;
  responseCount?: number;
  minResponseCount: number;
  breakdown?: Breakdown[];
}

export const ScoreCard: FC<ScoreCardProps> = ({
  title,
  longTitle,
  description,
  footer,
  questionType,
  score = 0,
  responseCount = 0,
  minResponseCount,
  breakdown,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const insufficientData = responseCount < minResponseCount;

  const responseBasedDescription = insufficientData
    ? `Insufficient data (<${minResponseCount} responses)`
    : description;

  const status = useMemo(() => {
    if (insufficientData) {
      return 'insufficientData';
    }
    if (score < CRITICAL_CONCERN_LIMIT) {
      return 'criticalConcern';
    }
    if (score < NEEDS_ATTENTION_LIMIT) {
      return 'needsAttention';
    }
    return 'good';
  }, [insufficientData, score]);

  if (!responseCount) {
    return null;
  }

  return (
    <>
      <Card
        className={classNames(commonStyles.card, commonStyles.questionCard)}
      >
        <CardContent className={commonStyles.cardContent}>
          <Box>
            <Typography component="h2" variant="overline2">
              <Typography variant="strong">{title}</Typography>
            </Typography>
            <Typography className={commonStyles.description} variant="body4">
              {responseBasedDescription}
            </Typography>
          </Box>

          <Box
            className={classNames(styles.scoreBox, styles[status])}
            data-status={status}
          >
            {insufficientData ? (
              <FontAwesomeV6Icon iconName="question" />
            ) : (
              <Typography component="p" variant="h3">
                {score}
              </Typography>
            )}
          </Box>
        </CardContent>
        <Box className={styles.scoreCardFooter}>
          <Box className={styles.scoreCardFooterText}>
            <FontAwesomeV6Icon iconName="info-circle" />
            <Typography variant="body4">{footer}</Typography>
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
          <Typography id="response-breakdown" variant="h3">
            Response breakdown
          </Typography>
          <Box className={styles.breakdownContentContainer}>
            <Box
              id="dsco-dialog-description"
              className={styles.longTitleContainer}
            >
              <Typography variant="body3">
                <Typography variant="strong">{longTitle}</Typography>
              </Typography>
              <Typography variant="body4">{`${responseCount} responses received`}</Typography>
            </Box>
            {questionType === 'likert' && (
              <PercentageBarGroup
                className={styles.breakdownBarGroup}
                items={breakdown}
                barLabel="Teachers"
              />
            )}
            {questionType === 'promoter' && (
              <Box className={styles.breakdownBarChartGroup}>
                <SimpleBarChart
                  data={breakdown.map(({count, label, color}) => ({
                    value: count,
                    label,
                    color,
                  }))}
                  xAxisLabel="NPS SCALE"
                  yAxisLabel="RESPONSES"
                  width={620}
                  height={250}
                  barSize={20}
                  animate={true}
                />
              </Box>
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
