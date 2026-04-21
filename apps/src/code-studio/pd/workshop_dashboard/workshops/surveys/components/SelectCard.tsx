import {Card, CardContent, CardHeader, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import {Breakdown} from '../../types';

import {PercentageBarGroup} from './PercentageBarGroup';

import styles from '../../WorkshopLayout.module.scss';

interface SelectCardProps {
  title: string;
  description: string;
  items: Breakdown[];
  totalRespondents?: number;
  barLabel?: string;
}

export const SelectCard: FC<SelectCardProps> = ({
  title,
  description,
  items,
  totalRespondents = 0,
  barLabel = '',
}) => {
  if (!totalRespondents) {
    return null;
  }
  return (
    <Card
      className={classNames(
        styles.card,
        styles.questionCard,
        styles.selectCard
      )}
    >
      <CardHeader
        className={styles.cardHeader}
        title={
          <>
            <Typography component="h2" variant="body1">
              <Typography variant="strong">{title}</Typography>
            </Typography>
            <Typography className={styles.subHeader} variant="body3">
              {description}
            </Typography>
          </>
        }
      />
      <CardContent className={styles.cardContent}>
        <PercentageBarGroup items={items} barLabel={barLabel} />
      </CardContent>
    </Card>
  );
};
