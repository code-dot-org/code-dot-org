import Tags from '@code-dot-org/component-library/tags';
import {Card, CardContent, Box, CardHeader, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import noResponsesText from '@cdo/static/pd/no-responses-text.png';

import {EmptyState} from './EmptyState';

import styles from '../../workshop.module.scss';

interface FreeResponseCardProps {
  title: string;
  tagText?: string;
  items?: string[];
  statusColor?: 'success' | 'warning';
  size?: 's' | 'l';
}

export const FreeResponseCard: FC<FreeResponseCardProps> = ({
  title,
  tagText,
  items = [],
  statusColor,
  size = 'l',
}) => {
  return (
    <Card
      className={classNames(
        styles.card,
        styles.questionCard,
        styles.freeResponse
      )}
    >
      <CardHeader
        className={styles.cardHeader}
        title={
          <Box className={styles.cardHeaderRow}>
            {/* TODO_visualAppearance_dynamic: "size === 's' ? 'body-two' : 'body-one'" */}
            <Typography variant="h2">
              <Typography variant="strong" gutterBottom>
                {title}
              </Typography>
            </Typography>
            {tagText && (
              <Tags
                size="s"
                tagsList={[{label: tagText}]}
                className={classNames(styles.workshopTag, styles.questionTag)}
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
