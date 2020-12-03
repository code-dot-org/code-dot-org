import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import {
  getCurrentScriptData,
  setLessonOfInterest
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {DetailViewContainer} from './ProgressTableContainer';

class DetailView extends Component {
  static whyDidYouRender = true;
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ),
    onClickLesson: PropTypes.func.isRequired
  };

  // Re-attaches mouse handlers on tooltip targets to tooltips.  Called
  // after the virtualized MultiGrid component scrolls, which may cause
  // target cells to be created or destroyed.
  afterScroll = _.debounce(ReactTooltip.rebuild, 10);

  render() {
    return (
      <div>
        <DetailViewContainer {...this.props} />
        <ProgressLegend excludeCsfColumn={!this.props.scriptData.csf} />
      </div>
    );
  }
}

export const UnconnectedDetailView = DetailView;

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
      dispatch(setLessonOfInterest(lessonPosition));
    }
  })
)(DetailView);
