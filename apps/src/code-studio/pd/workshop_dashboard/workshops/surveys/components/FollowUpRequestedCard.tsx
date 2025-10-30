import {Card, CardContent, Box, CardHeader, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import noResponsesEmail from '@cdo/static/pd/no-responses-email.png';

import {CopyButton} from '../../components/CopyButton';
import {FollowUpRequestedItem} from '../../types';

import {EmptyState} from './EmptyState';

import styles from './FollowUpRequestedCard.module.scss';
import commonStyles from '../../WorkshopLayout.module.scss';

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
            <Typography component="h2" variant="body1">
              <Typography variant="strong">{title}</Typography>
            </Typography>
            <Typography className={commonStyles.subHeader} variant="body3">
              {description}
            </Typography>
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
                <Typography variant="body3">
                  <Typography variant="strong">{item.name}</Typography>
                </Typography>
                <Typography variant="body3">{item.email}</Typography>
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
