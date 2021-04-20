import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {lessonIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {
  studentLessonProgressType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';
import {
  getCurrentScriptData,
  jumpToLessonDetails
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import ProgressTableContainer from './ProgressTableContainer';
import ProgressTableSummaryCell from './ProgressTableSummaryCell';
import ProgressTableDetailCell from './ProgressTableDetailCell';
import ProgressTableLevelIconSet from './ProgressTableLevelIconSet';
import ProgressTableLevelSpacer from './ProgressTableLevelSpacer';
import SummaryViewLegend from '@cdo/apps/templates/sectionProgress/progressTables/SummaryViewLegend';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {lastUpdatedFormatter, timeSpentFormatter} from './progressTableHelpers';
import {ViewType, scriptDataPropType} from '../sectionProgressConstants';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

const SUMMARY_VIEW_COLUMN_WIDTH = 40;

class ProgressTableDoubleView extends React.Component {
  static propTypes = {
    currentView: PropTypes.string.isRequired, // will be either detail or summary view
    // redux
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLessonProgressType)
    ).isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.levelIconHeaderFormatter = this.levelIconHeaderFormatter.bind(this);
    this.mainCellFormatter = this.mainCellFormatter.bind(this);
    this.summaryCellFormatter = this.summaryCellFormatter.bind(this);
    this.detailCellFormatter = this.detailCellFormatter.bind(this);
    this.timeSpentCellFormatter = this.timeSpentCellFormatter.bind(this);
    this.lastUpdatedCellFormatter = this.lastUpdatedCellFormatter.bind(this);
  }

  // returns formatter for main cell
  mainCellFormatter(lesson, student) {
    return this.props.currentView === ViewType.DETAIL
      ? this.detailCellFormatter(lesson, student)
      : this.summaryCellFormatter(lesson, student);
  }

  // renders summary view main cell
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

  // renders detail view main cell
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

  // returns formatter for time spent cell
  timeSpentCellFormatter(lesson, student) {
    return this.props.currentView === ViewType.DETAIL
      ? this.detailExpandedCellFormatter(lesson, student, timeSpentFormatter)
      : this.summaryExpandedCellFormatter(lesson, student, timeSpentFormatter);
  }

  // returns formatter for last updated cell
  lastUpdatedCellFormatter(lesson, student) {
    return this.props.currentView === ViewType.DETAIL
      ? this.detailExpandedCellFormatter(lesson, student, lastUpdatedFormatter)
      : this.summaryExpandedCellFormatter(
          lesson,
          student,
          lastUpdatedFormatter
        );
  }

  // summary view for time spent or last updated cell
  summaryExpandedCellFormatter(lesson, student, textFormatter) {
    const progress = this.getLessonProgress(lesson, student);
    return <span style={progressStyles.flex}>{textFormatter(progress)}</span>;
  }

  // detail view for time spent or last updated cell
  detailExpandedCellFormatter(lesson, student, textFormatter) {
    const studentProgress = this.getStudentProgress(student);
    const levelItems = lesson.levels.map(level => ({
      node: textFormatter(studentProgress[level.id]),
      sublevelCount: level.sublevels && level.sublevels.length
    }));
    return <ProgressTableLevelSpacer items={levelItems} />;
  }

  levelIconHeaderFormatter(_, {columnIndex}) {
    return (
      <ProgressTableLevelIconSet
        levels={this.props.scriptData.stages[columnIndex].levels}
      />
    );
  }

  getLessonProgress(lesson, student) {
    return this.props.lessonProgressByStudent[student.id][lesson.id];
  }

  getStudentProgress(student) {
    return this.props.levelProgressByStudent[student.id];
  }

  renderLegend() {
    return this.props.currentView === ViewType.DETAIL ? (
      <ProgressLegend excludeCsfColumn={!this.props.scriptData.csf} />
    ) : (
      <SummaryViewLegend showCSFProgressBox={this.props.scriptData.csf} />
    );
  }

  render() {
    const isDetailView = this.props.currentView === ViewType.DETAIL;

    const summaryViewColumnWidths = new Array(
      this.props.scriptData.stages.length
    ).fill(SUMMARY_VIEW_COLUMN_WIDTH);

    return (
      <div>
        <ProgressTableContainer
          onClickLesson={this.props.onClickLesson}
          columnWidths={isDetailView ? undefined : summaryViewColumnWidths}
          lessonCellFormatters={[
            this.mainCellFormatter,
            this.timeSpentCellFormatter,
            this.lastUpdatedCellFormatter
          ]}
          includeHeaderArrows={isDetailView}
          extraHeaderFormatters={
            isDetailView ? [this.levelIconHeaderFormatter] : undefined
          }
          extraHeaderLabels={isDetailView ? [i18n.levelType()] : undefined}
        />
        {this.renderLegend()}
      </div>
    );
  }
}

export const UnconnectedProgressTableSummaryView = ProgressTableDoubleView;

export default connect(
  state => ({
    section: state.sectionData.section,
    scriptData: getCurrentScriptData(state),
    lessonProgressByStudent:
      state.sectionProgress.studentLessonProgressByScript[
        state.scriptSelection.scriptId
      ],
    levelProgressByStudent:
      state.sectionProgress.studentLevelProgressByScript[
        state.scriptSelection.scriptId
      ]
  }),
  dispatch => ({
    onClickLesson(lessonPosition) {
      dispatch(jumpToLessonDetails(lessonPosition));
    }
  })
)(ProgressTableDoubleView);
