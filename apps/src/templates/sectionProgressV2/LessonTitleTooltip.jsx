import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import styles from './progress-table-v2.module.scss';

export const getTooltipId = lesson => `tooltip-${lesson.id}`;

export default function LessonTitleTooltip({lesson}) {
  const tooltipId = getTooltipId(lesson);
  return (
    <ReactTooltip id={tooltipId} key={tooltipId} role="tooltip" wrapper="div">
      <div className={styles.lessonHeaderTooltip}>{lesson.title}</div>
    </ReactTooltip>
  );
}

LessonTitleTooltip.propTypes = {
  lesson: PropTypes.object.isRequired,
};
