import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProgressDot from './progress_dot';
import { levelProgressShape } from './types';
import { ViewType, fullyLockedStageMapping } from '../../stageLockRedux';
import { LevelStatus } from '../../activityUtils';

const LockableProgressDot = React.createClass({
  propTypes: {
    // non-redux provided
    level: levelProgressShape.isRequired,
    courseOverviewPage: PropTypes.bool,
    stageId: PropTypes.number,

    // redux provided
    currentSection: PropTypes.object, // TODO
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,

  },

  render() {
    const { level, courseOverviewPage, stageId, currentSection, viewAs } = this.props;

    // If we're a teacher viewing as a student, we want to render lockable stages
    // to have a lockable item only if the stage is fully locked.
    // Do this by providing an overrideLevelStatus, which will take precedence
    // over level.status
    let status;
    const fullyLocked = fullyLockedStageMapping(currentSection);
    if (stageId !== undefined && viewAs === ViewType.Student && !!fullyLocked[stageId]) {
      status = LevelStatus.locked;
    }

    return (
      <ProgressDot
        level={level}
        courseOverviewPage={courseOverviewPage}
        stageId={stageId}
        overrideLevelStatus={status}
      />
    );
  }
});

export default connect(state => ({
  currentSection: state.stageLock.stagesBySectionId[state.sections.selectedSectionId],
  viewAs: state.stageLock.viewAs
}))(LockableProgressDot);
