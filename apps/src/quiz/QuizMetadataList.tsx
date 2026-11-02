import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {pluralize} from './utils';

import styles from './quiz-metadata-list.module.scss';

interface QuizMetadataListProps {
  questionCount: number;
  // Omit for an untimed quiz.
  timeLimitMinutes?: number;
  allowMultipleAttempts: boolean;
  className?: string;
  iconClassName?: string;
}

const QuizMetadataList: React.FunctionComponent<QuizMetadataListProps> = ({
  questionCount,
  timeLimitMinutes,
  allowMultipleAttempts,
  className,
  iconClassName,
}) => {
  const items = [
    {icon: 'circle-question', text: pluralize(questionCount, 'question')},
    ...(timeLimitMinutes
      ? [{icon: 'clock', text: pluralize(timeLimitMinutes, 'minute')}]
      : []),
    {
      icon: 'bullseye-arrow',
      text: allowMultipleAttempts ? 'Unlimited attempts' : '1 attempt',
    },
  ];

  return (
    <ul
      className={classNames(styles.list, className)}
      aria-label="Quiz details"
    >
      {items.map(({icon, text}) => (
        <li key={icon} className={styles.item}>
          <FontAwesomeV6Icon iconName={icon} className={iconClassName} />
          <Typography variant="body3" component="span">
            {text}
          </Typography>
        </li>
      ))}
    </ul>
  );
};

export default QuizMetadataList;
