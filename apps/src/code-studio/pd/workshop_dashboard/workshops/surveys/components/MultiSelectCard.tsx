import {
  BodyThreeText,
  Heading2,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, Box, CardHeader} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useEffect, useState} from 'react';

import noResponsesBars from '@cdo/static/pd/no-responses-bars.png';

import {MultiSelectBreakdown} from '../../../WorkshopFormTemplate/types';

import {EmptyState} from './EmptyState';

import styles from '../../workshop.module.scss';

interface MultiSelectCardProps {
  title: string;
  description: string;
  items: MultiSelectBreakdown[];
  barLabel?: string;
}

interface PercentageBarProps {
  percentage: number;
}

export const MultiSelectCard: FC<MultiSelectCardProps> = ({
  title,
  description,
  items,
  barLabel = '',
}) => {
  return (
    <Card
      className={classNames(
        styles.card,
        styles.questionCard,
        styles.multiSelect
      )}
    >
      <CardHeader
        className={styles.cardHeader}
        title={
          <>
            <Heading2 visualAppearance="body-one" noMargin>
              <StrongText>{title}</StrongText>
            </Heading2>
            <BodyThreeText noMargin className={styles.subHeader}>
              {description}
            </BodyThreeText>
          </>
        }
      />
      <CardContent className={styles.cardContent}>
        {items.length > 0 ? (
          <Box className={styles.column}>
            {items.map(item => (
              <Box key={item.label}>
                <BodyThreeText noMargin>
                  <StrongText>{item.label}</StrongText>
                </BodyThreeText>
                <Box className={styles.barRow}>
                  <PercentageBar percentage={item.percentage} />
                  <BodyThreeText noMargin className={styles.barLabel}>{`${
                    item.count
                  }${barLabel ? ` ${barLabel}` : ''}`}</BodyThreeText>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyState
            title="No data available yet."
            description="Check back after responses are submitted."
            imageProps={{src: noResponsesBars}}
          />
        )}
      </CardContent>
    </Card>
  );
};

const PercentageBar: FC<PercentageBarProps> = ({percentage}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // A tiny delay ensures the browser has painted the initial 0% width
    // before transitioning to the final percentage.
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 10);

    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <Box className={styles.barContainer}>
      <Box
        className={styles.indicator}
        style={{
          width: `${width}%`,
        }}
      />
    </Box>
  );
};
