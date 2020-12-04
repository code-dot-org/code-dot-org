import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  getCurrentScriptData,
  jumpToLessonDetails
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

import {scriptDataPropType} from '../sectionProgressConstants';
import SummaryViewLegend from './SummaryViewLegend';
import {SummaryViewContainer} from './ProgressTableContainer';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';

class SummaryView extends React.Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ),
    onClickLesson: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <SummaryViewContainer {...this.props} />
        <SummaryViewLegend showCSFProgressBox={this.props.scriptData.csf} />
      </div>
    );
  }
}

export const UnconnectedSummaryView = SummaryView;

export default connect(
  state => ({
    section: state.sectionData.section,
    scriptData: getCurrentScriptData(state),
    lessonOfInterest: state.sectionProgress.lessonOfInterest,
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
)(SummaryView);
