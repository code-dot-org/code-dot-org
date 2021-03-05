import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {lessonIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
import {scriptDataPropType} from '../sectionProgressConstants';
import {studentLessonProgressType} from '@cdo/apps/templates/progress/progressTypes';
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
    lessonProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLessonProgressType)
    ).isRequired,
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.summaryCellFormatter = this.summaryCellFormatter.bind(this);
    this.timeSpentCellFormatter = this.timeSpentCellFormatter.bind(this);
    this.lastUpdatedCellFormatter = this.lastUpdatedCellFormatter.bind(this);
  }

  summaryCellFormatter(lesson, student) {
    const studentLessonProgress = this.props.lessonProgressByStudent[
      student.id
    ][lesson.id];
    return (
      <ProgressTableSummaryCell
        studentId={student.id}
        studentLessonProgress={studentLessonProgress}
        isAssessmentLesson={lessonIsAllAssessment(lesson.levels)}
        onSelectDetailView={() => this.props.onClickLesson(lesson.position)}
      />
    );
  }

  timeSpentCellFormatter(lesson, student) {
    return '10';
  }

  lastUpdatedCellFormatter(lesson, student) {
    return '1/1';
  }

  render() {
    return (
      <div>
        <ProgressTableContainer
          onClickLesson={this.props.onClickLesson}
          columnWidths={new Array(this.props.scriptData.stages.length).fill(
            COLUMN_WIDTH
          )}
          lessonCellFormatters={[
            this.summaryCellFormatter,
            this.timeSpentCellFormatter,
            this.lastUpdatedCellFormatter
          ]}
        />
        <SummaryViewLegend showCSFProgressBox={this.props.scriptData.csf} />
      </div>
    );
  }
}

export default connect(
  state => ({
    scriptData: getCurrentScriptData(state),
    lessonProgressByStudent:
      state.sectionProgress.studentLessonProgressByScript[
        state.scriptSelection.scriptId
      ]
  }),
  dispatch => ({
    onClickLesson(lessonPosition) {
      dispatch(jumpToLessonDetails(lessonPosition));
    }
  })
)(ProgressTableSummaryView);
