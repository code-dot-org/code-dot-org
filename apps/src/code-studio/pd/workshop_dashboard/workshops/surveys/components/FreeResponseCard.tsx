import Tags from '@code-dot-org/component-library/tags';
import {
  BodyThreeText,
  Heading2,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, Box, CardHeader} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import styles from '../../workshop.module.scss';

interface FreeResponseCardProps {
  title: string;
  tagText?: string;
  items: string[];
}

export const FreeResponseCard: FC<FreeResponseCardProps> = ({
  title,
  tagText,
  items,
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
            <Heading2 visualAppearance="body-one" noMargin>
              <StrongText>{title}</StrongText>
            </Heading2>
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
        <Box className={styles.textCardContainer}>
          {items.map(item => (
            <Box key={item} className={styles.textCard}>
              <BodyThreeText noMargin>{item}</BodyThreeText>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
