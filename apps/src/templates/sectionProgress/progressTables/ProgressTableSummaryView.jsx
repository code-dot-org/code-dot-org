import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
  progressForLesson,
  lessonIsAllAssessment
} from '@cdo/apps/templates/progress/progressHelpers';
import {scriptDataPropType} from '../sectionProgressConstants';
import {
  getCurrentScriptData,
  jumpToLessonDetails
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import ProgressTableContainer from './ProgressTableContainer';
import ProgressTableSummaryCell from './ProgressTableSummaryCell';
import SummaryViewLegend from '@cdo/apps/templates/sectionProgress/progressTables/SummaryViewLegend';

const COLUMN_WIDTH = 40;

// This component summarizes progress for all lessons in a script, for each student
// in a section.  It combines summary-specific components such as
// ProgressTableSummaryCell with shared progress view components
// like ProgressTableContainer. An equivalent expanded
// ProgressTableDetailView component also exists
class ProgressTableSummaryView extends React.Component {
  static propTypes = {
    // redux
    scriptData: scriptDataPropType.isRequired,
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.summaryCellFormatter = this.summaryCellFormatter.bind(this);
  }

  summaryCellFormatter(lesson, student, studentProgress) {
    const studentLessonProgress = progressForLesson(
      studentProgress,
      lesson.levels
    );
    const isAssessmentLesson = lessonIsAllAssessment(lesson.levels);
    return (
      <ProgressTableSummaryCell
        studentId={student.id}
        studentLessonProgress={studentLessonProgress}
        isAssessmentLesson={isAssessmentLesson}
        onSelectDetailView={() => this.props.onClickLesson(lesson.position)}
      />
    );
  }

  render() {
    return (
      <div>
        <ProgressTableContainer
          onClickLesson={this.props.onClickLesson}
          columnWidths={new Array(this.props.scriptData.stages.length).fill(
            COLUMN_WIDTH
          )}
          lessonCellFormatter={this.summaryCellFormatter}
        />
        <SummaryViewLegend showCSFProgressBox={this.props.scriptData.csf} />
      </div>
    );
  }
}

export default connect(
  state => ({
    scriptData: getCurrentScriptData(state)
  }),
  dispatch => ({
    onClickLesson(lessonPosition) {
      dispatch(jumpToLessonDetails(lessonPosition));
    }
  })
)(ProgressTableSummaryView);
