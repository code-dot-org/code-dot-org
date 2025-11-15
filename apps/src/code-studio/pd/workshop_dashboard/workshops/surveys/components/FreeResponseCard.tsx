import Tags from '@code-dot-org/component-library/tags';
import {Card, CardContent, Box, CardHeader, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import noResponsesText from '@cdo/static/pd/no-responses-text.png';

import {EmptyState} from './EmptyState';

import styles from './FreeResponseCard.module.scss';
import commonStyles from '../../WorkshopLayout.module.scss';

interface FreeResponseCardProps {
  title: string;
  tagText?: string;
  items?: string[];
  statusColor?: 'success' | 'warning';
  size?: 's' | 'l';
  useFlexTextCardContainer?: boolean;
}

export const FreeResponseCard: FC<FreeResponseCardProps> = ({
  title,
  tagText,
  items = [],
  statusColor,
  size = 'l',
  useFlexTextCardContainer = false,
}) => {
  return (
    <Card className={classNames(commonStyles.card, styles.freeResponse)}>
      <CardHeader
        className={commonStyles.cardHeader}
        title={
          <Box className={styles.cardHeaderRow}>
            <Typography
              component="h2"
              variant={size === 's' ? 'body2' : 'body1'}
            >
              <Typography variant="strong">{title}</Typography>
            </Typography>
            {tagText && (
              <Tags
                size="s"
                tagsList={[{label: tagText}]}
                className={classNames(
                  commonStyles.workshopTag,
                  commonStyles.questionTag
                )}
              />
            )}
          </Box>
        }
      />
      <CardContent className={styles.cardContent}>
        {items.length > 0 ? (
          <Box
            className={classNames(styles.textCardContainer, {
              [styles.small]: size === 's',
              [styles.flexTextCardContainer]: useFlexTextCardContainer,
            })}
          >
            {items.map((item, i) => (
              <Box
                key={`${item}-${i}`}
                className={classNames(
                  styles.textCard,
                  statusColor && styles[statusColor]
                )}
              >
                <Typography variant="body3">{item}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyState
            title="No responses submitted yet."
            description="Responses will appear here once participants complete the survey."
            imageProps={{src: noResponsesText}}
          />
        )}
      </CardContent>
    </Card>
  );
};
