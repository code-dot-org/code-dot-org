import {Box, Card, CardContent} from '@mui/material';
import React from 'react';

import noResponsesText from '@cdo/static/pd/no-responses-text.png';

import {EmptyState} from './EmptyState';

import styles from '../../workshop.module.scss';

export const NoSurveyResponses = () => {
  return (
    <Box className={styles.surveyResultsContainer}>
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <EmptyState
            title="No survey responses submitted yet."
            description="Results will appear here once participants complete the survey."
            imageProps={{src: noResponsesText}}
            large
          />
        </CardContent>
      </Card>
    </Box>
  );
};
