import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProgressLesson from './ProgressLesson';
import i18n from '@cdo/locale';
import { levelType, lessonType } from './progressTypes';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { isHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';

/**
 * A component that shows progress in a course with more detail than the summary
 * view
 */
const DetailProgressTable = React.createClass({
  propTypes: {
    lessons: PropTypes.arrayOf(lessonType).isRequired,
    levelsByLesson: PropTypes.arrayOf(
      PropTypes.arrayOf(levelType)
    ).isRequired,

    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    sectionId: PropTypes.string,
    hiddenStageState: PropTypes.object.isRequired,
  },

  render() {
    const { lessons, levelsByLesson, viewAs, sectionId, hiddenStageState } = this.props;
    if (lessons.length !== levelsByLesson.length) {
      throw new Error('Inconsistent number of lessons');
    }

    let rows = [];
    const showHidden = viewAs === ViewType.Teacher;
    lessons.forEach((lesson, index) => {
      // When viewing as a student, we'll filter out hidden rows. When viewing
      // as a teacher, we'll set hiddenForStudents and style the row differntly.
      const isHidden = isHiddenForSection(hiddenStageState, sectionId, lesson.id);
      if (isHidden && !showHidden) {
        return;
      }
      rows.push(
        <ProgressLesson
          key={index}
          hiddenForStudents={isHidden}
          title={i18n.lessonNumbered({lessonNumber: index + 1, lessonName: lesson.name})}
          levels={levelsByLesson[index]}
        />
      );
    });

    return <div>{rows}</div>;
  }
});

// Provide non-connected version for testing
DetailProgressTable.DetailProgressTable = DetailProgressTable;

export default connect(state => ({
  viewAs: state.stageLock.viewAs,
  sectionId: state.sections.selectedSectionId,
  hiddenStageState: state.hiddenStage,
}))(DetailProgressTable);
