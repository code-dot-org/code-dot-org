import {
  BodyThreeText,
  Heading2,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, CardHeader} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import noResponsesBars from '@cdo/static/pd/no-responses-bars.png';

import {Breakdown} from '../../../WorkshopFormTemplate/types';

import {EmptyState} from './EmptyState';
import {PercentageBarGroup} from './PercentageBarGroup';

import styles from '../../workshop.module.scss';

interface MultiSelectCardProps {
  title: string;
  description: string;
  items: Breakdown[];
  barLabel?: string;
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
          <PercentageBarGroup items={items} barLabel={barLabel} />
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
