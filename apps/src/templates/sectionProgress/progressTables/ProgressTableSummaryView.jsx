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
import {lastUpdatedFormatter, timeSpentFormatter} from './progressTableHelpers';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

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

  getLessonProgress(lesson, student) {
    return this.props.lessonProgressByStudent[student.id][lesson.id];
  }

  summaryCellFormatter(lesson, student) {
    return (
      <ProgressTableSummaryCell
        studentId={student.id}
        studentLessonProgress={this.getLessonProgress(lesson, student)}
        isAssessmentLesson={lessonIsAllAssessment(lesson.levels)}
        onSelectDetailView={() => this.props.onClickLesson(lesson.position)}
      />
    );
  }

  expandedCellFormatter(lesson, student, textFormatter) {
    const progress = this.getLessonProgress(lesson, student);
    return <span style={progressStyles.flex}>{textFormatter(progress)}</span>;
  }

  timeSpentCellFormatter(lesson, student) {
    return this.expandedCellFormatter(lesson, student, timeSpentFormatter);
  }

  lastUpdatedCellFormatter(lesson, student) {
    return this.expandedCellFormatter(lesson, student, lastUpdatedFormatter);
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

export const UnconnectedProgressTableSummaryView = ProgressTableSummaryView;

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
