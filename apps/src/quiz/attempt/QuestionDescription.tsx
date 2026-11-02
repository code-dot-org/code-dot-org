import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import styles from './question-description.module.scss';

const QuestionDescription: React.FunctionComponent<{
  markdown?: string | null;
}> = ({markdown}) =>
  markdown ? (
    <Typography variant="body2" component="div" className={styles.description}>
      <SafeMarkdown markdown={markdown} />
    </Typography>
  ) : null;

export default QuestionDescription;
