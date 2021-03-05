import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {scriptDataPropType} from '../sectionProgressConstants';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {
  getCurrentScriptData,
  setLessonOfInterest
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import ProgressTableContainer from './ProgressTableContainer';
import ProgressTableDetailCell from './ProgressTableDetailCell';
import ProgressTableLevelIcon from './ProgressTableLevelIcon';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';

// This component displays progress bubbles for all levels in all lessons
// for each student in the section. It combines detail-specific components such as
// ProgressTableLevelIcon, ProgressTableDetailCell with shared progress view
// components like ProgressTableContainer. An equivalent compact
// ProgressTableSummaryView component also exists
class ProgressTableDetailView extends React.Component {
  static propTypes = {
    // redux
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.levelIconHeaderFormatter = this.levelIconHeaderFormatter.bind(this);
    this.detailCellFormatter = this.detailCellFormatter.bind(this);
    this.timeSpentCellFormatter = this.timeSpentCellFormatter.bind(this);
    this.lastUpdatedCellFormatter = this.lastUpdatedCellFormatter.bind(this);
  }

  levelIconHeaderFormatter(_, {columnIndex}) {
    return (
      <ProgressTableLevelIcon
        levels={this.props.scriptData.stages[columnIndex].levels}
      />
    );
  }

  detailCellFormatter(lesson, student) {
    const studentProgress = this.props.levelProgressByStudent[student.id];
    return (
      <ProgressTableDetailCell
        studentId={student.id}
        sectionId={this.props.section.id}
        stageExtrasEnabled={this.props.section.stageExtras}
        levels={lesson.levels}
        studentProgress={studentProgress}
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
          lessonCellFormatters={[
            this.detailCellFormatter,
            this.timeSpentCellFormatter,
            this.lastUpdatedCellFormatter
          ]}
          includeHeaderArrows={true}
          extraHeaderFormatters={[this.levelIconHeaderFormatter]}
          extraHeaderLabels={[i18n.levelType()]}
        />
        <ProgressLegend excludeCsfColumn={!this.props.scriptData.csf} />
      </div>
    );
  }
}
export default connect(
  state => ({
    section: state.sectionData.section,
    scriptData: getCurrentScriptData(state),
    levelProgressByStudent:
      state.sectionProgress.studentLevelProgressByScript[
        state.scriptSelection.scriptId
      ]
  }),
  dispatch => ({
    onClickLesson(lessonPosition) {
      dispatch(setLessonOfInterest(lessonPosition));
    }
  })
)(ProgressTableDetailView);
