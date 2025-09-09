import {
  BodyThreeText,
  Heading2,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, Box, CardHeader} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import noResponsesEmail from '@cdo/static/pd/no-responses-email.png';

import {FollowUpRequestedItem} from '../../../WorkshopFormTemplate/types';
import {CopyButton} from '../../components/CopyButton';

import {EmptyState} from './EmptyState';

import styles from './FollowUpRequestedCardStyles.module.scss';
import commonStyles from '../../workshop.module.scss';

interface FollowUpRequestedCardProps {
  title: string;
  description: string;
  items: FollowUpRequestedItem[];
}

export const FollowUpRequestedCard: FC<FollowUpRequestedCardProps> = ({
  title,
  description,
  items,
}) => {
  return (
    <Card className={classNames(commonStyles.card, styles.followUpCard)}>
      <CardHeader
        className={commonStyles.cardHeader}
        title={
          <>
            <Heading2 visualAppearance="body-one" noMargin>
              <StrongText>{title}</StrongText>
            </Heading2>
            <BodyThreeText noMargin className={commonStyles.subHeader}>
              {description}
            </BodyThreeText>
          </>
        }
      />
      <CardContent className={classNames(styles.cardContent)}>
        {items.length > 0 ? (
          <Box
            className={classNames(commonStyles.column, styles.emailContainer)}
          >
            {items.map(item => (
              <Box key={item.email} className={styles.emailRow}>
                <BodyThreeText noMargin>
                  <StrongText>{item.name}</StrongText>
                </BodyThreeText>
                <BodyThreeText noMargin>{item.email}</BodyThreeText>
                <CopyButton
                  buttonText="Copy email"
                  textToCopy={item.email}
                  ariaLabel={`copy ${item.email}`}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyState
            title="No teachers requested follow-up support."
            description="All participants feel confident proceeding independently."
            imageProps={{src: noResponsesEmail}}
          />
        )}
      </CardContent>
    </Card>
  );
};
