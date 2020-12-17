import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
  statusPercentsForLevels,
  stageIsAllAssessment
} from '@cdo/apps/templates/progress/progressHelpers';
import {scriptDataPropType, scrollbarWidth} from '../sectionProgressConstants';
import {
  getCurrentScriptData,
  jumpToLessonDetails
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import ProgressTableContainer from './ProgressTableContainer';
import ProgressTableSummaryCell from './ProgressTableSummaryCell';
import progressTableStyles from './progressTableStyles.scss';
import SummaryViewLegend from './SummaryViewLegend';

const MIN_COLUMN_WIDTH = 40;
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

  getTableWidth(lessons) {
    return lessons.length * MIN_COLUMN_WIDTH;
  }

  summaryCellFormatter(lesson, student, studentProgress) {
    const statusPercents = statusPercentsForLevels(
      studentProgress,
      lesson.levels
    );
    const assessmentStage = stageIsAllAssessment(lesson.levels);
    return (
      <ProgressTableSummaryCell
        studentId={student.id}
        statusPercents={statusPercents}
        assessmentStage={assessmentStage}
        onSelectDetailView={() => this.props.onClickLesson(lesson.position)}
      />
    );
  }

  render() {
    const width = Math.max(
      MIN_COLUMN_WIDTH,
      (progressTableStyles.CONTENT_VIEW_WIDTH - scrollbarWidth) /
        this.props.scriptData.stages.length
    );
    return (
      <ProgressTableContainer
        onClickLesson={this.props.onClickLesson}
        getTableWidth={lessons => this.getTableWidth(lessons)}
        columnWidths={new Array(this.props.scriptData.stages.length).fill(
          width
        )}
        lessonCellFormatter={this.summaryCellFormatter}
      >
        <SummaryViewLegend showCSFProgressBox={this.props.scriptData.csf} />
      </ProgressTableContainer>
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
