import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {submitLessonInsightFeedback} from './lessonInsightFeedbackApi';

import styles from './lessonInsightFeedback.module.scss';

interface LessonInsightFeedbackProps {
  unitId: number;
  lessonId: number;
  studentId: number;
  sectionId: number;
}

/**
 * "Was this helpful?" thumbs up / thumbs down. Clicking the selected thumb
 * again clears the rating.
 */
const LessonInsightFeedback: React.FC<LessonInsightFeedbackProps> = ({
  unitId,
  lessonId,
  studentId,
  sectionId,
}) => {
  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);

  const handleClick = (clicked: boolean) => {
    const next = thumbsUp === clicked ? null : clicked;
    setThumbsUp(next);
    submitLessonInsightFeedback({
      unitId,
      lessonId,
      studentId,
      sectionId,
      thumbsUp: next,
    });
  };

  const renderThumb = (isUp: boolean) => {
    const selected = thumbsUp === isUp;
    return (
      <MuiIconButton
        variant="text"
        color="secondary"
        size="extraSmall"
        className={classNames(
          isUp ? styles.thumbsUp : styles.thumbsDown,
          selected && styles.selected
        )}
        onClick={() => handleClick(isUp)}
        aria-label={isUp ? 'Helpful' : 'Not helpful'}
        aria-pressed={selected}
        type="button"
      >
        <FontAwesomeV6Icon
          iconName={isUp ? 'thumbs-up' : 'thumbs-down'}
          iconStyle={selected ? 'solid' : 'regular'}
        />
      </MuiIconButton>
    );
  };

  return (
    <span className={styles.container}>
      <Typography variant="body4" component="span">
        Was this helpful?
      </Typography>
      {renderThumb(true)}
      {renderThumb(false)}
    </span>
  );
};

export default LessonInsightFeedback;
