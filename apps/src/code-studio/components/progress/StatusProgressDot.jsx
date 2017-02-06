import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProgressDot from './progress_dot';
import { levelProgressShape } from './types';
import { ViewType, fullyLockedStageMapping } from '../../stageLockRedux';
import { LevelStatus } from '../../activityUtils';
import { SignInState } from '../../progressRedux';

/**
 * Wrapper around ProgressDot that own determining the correct status for the
 * dot.
 */
export const StatusProgressDot = React.createClass({
  propTypes: {
    // non-redux provided
    level: levelProgressShape.isRequired,
    courseOverviewPage: PropTypes.bool,
    stageId: PropTypes.number,

    // redux provided
    currentSection: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          locked: PropTypes.bool.isRequired,
          name: PropTypes.string.isRequired,
          readonly_answers: PropTypes.bool.isRequired,
          user_level_data: PropTypes.object.isRequired
        })
      )
    ),
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
    // if false, display all progress as not tried
    showProgress: React.PropTypes.bool,
    // if true, display all progress as gray (dots_disabled)
    grayProgress: React.PropTypes.bool,
  },

  render() {
    const {
      level,
      courseOverviewPage,
      stageId,
      currentSection,
      viewAs,
      showProgress,
      grayProgress
    } = this.props;

    // If we're a teacher viewing as a student, we want to render lockable stages
    // to have a lockable item only if the stage is fully locked.
    // Do this by providing an overrideLevelStatus, which will take precedence
    // over level.status
    let status = level.status;

    const fullyLocked = fullyLockedStageMapping(currentSection);
    if (stageId !== undefined && viewAs === ViewType.Student && !!fullyLocked[stageId]) {
      status = LevelStatus.locked;
    }

    if (status !== LevelStatus.locked) {
      // During hoc we're going to disable milestone posts. If disabled, we want
      // to display dots as gray (unless the level is locked, in which case we
      // want to leave as is).
      if (!showProgress) {
        status = LevelStatus.not_tried;
      } else if (grayProgress) {
        status = LevelStatus.dots_disabled;
      }
    }

    return (
      <ProgressDot
        level={level}
        courseOverviewPage={courseOverviewPage}
        stageId={stageId}
        status={status}
      />
    );
  }
});

export default connect(state => {
  const { postMilestoneDisabled, signInState } = state.progress;

  return {
    // If milestone posts are disabled, don't show progress (i.e. leave bubbles
    // white) until we know whether we're signed in or not.
    showProgress: !postMilestoneDisabled || signInState !== SignInState.Unknown,
    grayProgress: postMilestoneDisabled && signInState === SignInState.SignedIn,
    currentSection: state.stageLock.stagesBySectionId[state.sections.selectedSectionId],
    viewAs: state.stageLock.viewAs
  };
})(StatusProgressDot);
