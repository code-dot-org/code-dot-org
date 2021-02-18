import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {scriptDataPropType} from '../sectionProgressConstants';
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
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.levelIconHeaderFormatter = this.levelIconHeaderFormatter.bind(this);
    this.detailCellFormatter = this.detailCellFormatter.bind(this);
  }

  levelIconHeaderFormatter(_, {columnIndex}) {
    return (
      <ProgressTableLevelIcon
        levels={this.props.scriptData.stages[columnIndex].levels}
      />
    );
  }

  detailCellFormatter(lesson, student, studentProgress) {
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

  render() {
    return (
      <ProgressTableContainer
        onClickLesson={this.props.onClickLesson}
        lessonCellFormatter={this.detailCellFormatter}
        includeHeaderArrows={true}
        extraHeaderFormatters={[this.levelIconHeaderFormatter]}
        extraHeaderLabels={[i18n.levelType()]}
      >
        <ProgressLegend excludeCsfColumn={!this.props.scriptData.csf} />
      </ProgressTableContainer>
    );
  }
}
export default connect(
  state => ({
    section: state.sectionData.section,
    scriptData: getCurrentScriptData(state)
  }),
  dispatch => ({
    onClickLesson(lessonPosition) {
      dispatch(setLessonOfInterest(lessonPosition));
    }
  })
)(ProgressTableDetailView);
