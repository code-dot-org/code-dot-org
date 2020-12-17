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

class ProgressTableDetailView extends React.Component {
  static propTypes = {
    // redux
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.levelIconFormatter = this.levelIconFormatter.bind(this);
    this.detailCellFormatter = this.detailCellFormatter.bind(this);
  }

  getTableWidth(lessons) {
    return lessons.reduce((lessonSum, lesson) => {
      return lessonSum + ProgressTableDetailCell.widthForLevels(lesson.levels);
    }, 0);
  }

  levelIconFormatter(_, {columnIndex}) {
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
    const columnWidths = this.props.scriptData.stages.map(lesson =>
      ProgressTableDetailCell.widthForLevels(lesson.levels)
    );
    return (
      <ProgressTableContainer
        onClickLesson={this.props.onClickLesson}
        getTableWidth={lessons => this.getTableWidth(lessons)}
        columnWidths={columnWidths}
        lessonCellFormatter={this.detailCellFormatter}
        includeHeaderArrows={true}
        extraHeaderFormatters={[this.levelIconFormatter]}
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
