import React from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import styles from './progress-table-v2.module.scss';

export const getTooltipId = lesson => `tooltip-${lesson.id}`;

export default function LessonTitleTooltip({lesson}) {
  const tooltipId = getTooltipId(lesson);
  return (
    <ReactTooltip
      id={tooltipId}
      key={tooltipId}
      role="tooltip"
      wrapper="div"
      effect="solid"
    >
      <div className={styles.lessonHeaderTooltip}>
        {i18n.lessonNumbered({
          lessonNumber: lesson.relative_position,
          lessonName: lesson.name,
        })}
      </div>
    </ReactTooltip>
  );
}

LessonTitleTooltip.propTypes = {
  lesson: PropTypes.object.isRequired,
};
