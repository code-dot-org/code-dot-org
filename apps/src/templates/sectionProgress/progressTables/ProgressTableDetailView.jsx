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
import ProgressTableLevelIconSet from './ProgressTableLevelIconSet';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {lastUpdatedFormatter, timeSpentFormatter} from './progressTableHelpers';
import ProgressTableLevelSpacer from './ProgressTableLevelSpacer';

// This component displays progress bubbles for all levels in all lessons
// for each student in the section. It combines detail-specific components such as
// ProgressTableLevelIconSet, ProgressTableDetailCell with shared progress view
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
      <ProgressTableLevelIconSet
        levels={this.props.scriptData.stages[columnIndex].levels}
      />
    );
  }

  getStudentProgress(student) {
    return this.props.levelProgressByStudent[student.id];
  }

  detailCellFormatter(lesson, student) {
    const studentProgress = this.getStudentProgress(student);
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

  expandedCellFormatter(lesson, student, textFormatter) {
    const studentProgress = this.getStudentProgress(student);
    const levelItems = lesson.levels.map(level => ({
      node: textFormatter(studentProgress[level.id]),
      sublevelCount: level.sublevels && level.sublevels.length
    }));
    return <ProgressTableLevelSpacer items={levelItems} />;
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

export const UnconnectedProgressTableDetailView = ProgressTableDetailView;

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
