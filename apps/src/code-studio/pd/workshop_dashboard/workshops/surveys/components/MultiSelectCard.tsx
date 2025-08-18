import {
  BodyThreeText,
  Heading2,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, Box, CardHeader} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {MultiSelectBreakdown} from '../../../WorkshopFormTemplate/types';

import styles from '../../workshop.module.scss';

interface MultiSelectCardProps {
  title: string;
  description: string;
  items: MultiSelectBreakdown[];
  barLabel?: string;
}

export const MultiSelectCard: React.FC<MultiSelectCardProps> = ({
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
        <Box className={styles.column}>
          {items.map(item => (
            <Box key={item.label}>
              <BodyThreeText noMargin>
                <StrongText>{item.label}</StrongText>
              </BodyThreeText>
              <Box className={styles.barRow}>
                <Box className={styles.barContainer}>
                  <Box
                    className={styles.indicator}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </Box>
                <BodyThreeText
                  noMargin
                  className={styles.barLabel}
                >{`${item.count} ${barLabel}`}</BodyThreeText>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
