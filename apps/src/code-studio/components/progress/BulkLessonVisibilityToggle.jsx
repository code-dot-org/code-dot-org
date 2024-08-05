import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import {toggleHiddenLesson} from '@cdo/apps/code-studio/hiddenLessonRedux';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {getStore} from '@cdo/apps/redux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import i18n from '@cdo/locale';

import style from './bulk-lesson-visibility-toggle.module.scss';

function toggleHiddenLessons(unitName, sectionId, lessons, hidden) {
  lessons.forEach(lesson => {
    // For some reason, sectionId is a number here, and needs to be a string
    // for the redux toggle stuff to work.
    getStore().dispatch(
      toggleHiddenLesson(unitName, sectionId.toString(), lesson.id, hidden)
    );
  });
}

function BulkLessonVisibilityToggle({lessons, sectionId, unitName}) {
  const tooltipId = _.uniqueId();

  return (
    <div className={style.container}>
      <Button
        text={i18n.showAllLessons()}
        icon="eye"
        color={Button.ButtonColor.gray}
        onClick={() => toggleHiddenLessons(unitName, sectionId, lessons, false)}
      />
      <Button
        text={i18n.hideAllLessons()}
        icon="eye-slash"
        color={Button.ButtonColor.gray}
        onClick={() => toggleHiddenLessons(unitName, sectionId, lessons, true)}
      />
      <span data-tip data-for={tooltipId}>
        <FontAwesome icon="info-circle" className={style.infoTipIcon} />
      </span>
      <ReactTooltip id={tooltipId} effect="solid">
        <p>{i18n.bulkLessonVisibilityToggleTip()}</p>
      </ReactTooltip>
    </div>
  );
}

BulkLessonVisibilityToggle.propTypes = {
  lessons: PropTypes.arrayOf(unitCalendarLesson),

  // redux provided
  sectionId: PropTypes.number.isRequired,
  unitName: PropTypes.string.isRequired,
};

export const UnconnectedBulkLessonVisibilityToggle = BulkLessonVisibilityToggle;
export default connect(state => ({
  sectionId: state.teacherSections.selectedSectionId,
  unitName: state.progress.scriptName,
}))(BulkLessonVisibilityToggle);
