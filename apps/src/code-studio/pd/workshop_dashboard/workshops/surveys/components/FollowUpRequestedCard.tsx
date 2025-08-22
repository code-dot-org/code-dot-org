import {
  BodyThreeText,
  Heading2,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, Box, CardHeader} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import noResponsesEmail from '@cdo/static/pd/no-responses-email.png';

import {EmptyState} from './EmptyState';

import styles from '../../workshop.module.scss';

interface FollowUp {
  name: string;
  email: string;
}

interface FollowUpRequestedCardProps {
  title: string;
  description: string;
  items: FollowUp[];
}

export const FollowUpRequestedCard: FC<FollowUpRequestedCardProps> = ({
  title,
  description,
  items,
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
              <Box key={item.email}>
                {/* TODO: https://codedotorg.atlassian.net/browse/ACQ-3460 render result rows */}
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
