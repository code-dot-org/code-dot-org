import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import styles from './question-description.module.scss';

const shiftedHeading = (tagName: 'h3' | 'h4' | 'h5' | 'h6') => {
  const Heading: React.FunctionComponent<
    React.HTMLAttributes<HTMLHeadingElement>
  > = props => React.createElement(tagName, props);
  return Heading;
};

const DESCRIPTION_HEADING_MAP = {
  h1: shiftedHeading('h3'),
  h2: shiftedHeading('h4'),
  h3: shiftedHeading('h5'),
  h4: shiftedHeading('h6'),
  h5: shiftedHeading('h6'),
  h6: shiftedHeading('h6'),
};

const QuestionDescription: React.FunctionComponent<{
  markdown?: string | null;
}> = ({markdown}) =>
  markdown ? (
    <Typography variant="body2" component="div" className={styles.description}>
      <SafeMarkdown markdown={markdown} rehypeMap={DESCRIPTION_HEADING_MAP} />
    </Typography>
  ) : null;

export default QuestionDescription;
