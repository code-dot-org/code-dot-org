import {Button} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  Heading2,
  Heading3,
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
            <Heading2 visualAppearance="overline-two" noMargin>
              <StrongText>{title}</StrongText>
            </Heading2>
            <BodyFourText className={commonStyles.description} noMargin>
              {responseBasedDescription}
            </BodyFourText>
          </Box>

          <Box
            className={classNames(styles.scoreBox, styles[status])}
            data-status={status}
          >
            {insufficientData ? (
              <FontAwesomeV6Icon iconName="question" />
            ) : (
              <BodyThreeText noMargin visualAppearance="heading-lg">
                {score}
              </BodyThreeText>
            )}
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
