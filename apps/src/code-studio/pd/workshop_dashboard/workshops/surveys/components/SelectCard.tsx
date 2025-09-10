import {
  BodyThreeText,
  Heading2,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, CardHeader} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import {Breakdown} from '../../../WorkshopFormTemplate/types';

import {PercentageBarGroup} from './PercentageBarGroup';

import styles from '../../workshop.module.scss';

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
        <PercentageBarGroup items={items} barLabel={barLabel} />
      </CardContent>
    </Card>
  );
};
