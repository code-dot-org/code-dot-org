import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProgressDot from './ProgressDot';
import { levelProgressShape } from './types';
import { ViewType } from '../../stageLockRedux';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { SignInState, statusForLevel } from '../../progressRedux';
import { lessonIsLockedForAllStudents } from '@cdo/apps/templates/progress/progressHelpers';

/**
 * Wrapper around ProgressDot that owns determining the correct status for the
 * underlying component.
 */
export const StatusProgressDot = React.createClass({
  propTypes: {
    // non-redux provided
    level: levelProgressShape.isRequired,
    courseOverviewPage: PropTypes.bool,
    stageId: PropTypes.number,

    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    postMilestoneDisabled: PropTypes.bool.isRequired,
    signInState: PropTypes.oneOf(Object.values(SignInState)).isRequired,
    levelProgress: PropTypes.object.isRequired,
    lessonIsLockedForAllStudents: PropTypes.func.isRequired
  },

  render() {
    const {
      level,
      courseOverviewPage,
      stageId,
      viewAs,
      postMilestoneDisabled,
      signInState,
      levelProgress,
      lessonIsLockedForAllStudents
    } = this.props;

    let status = statusForLevel(level, levelProgress);

    // If we're a teacher viewing as a student, we want to render lockable stages
    // to have a lockable item only if the stage is fully locked.
    if (stageId !== undefined && viewAs === ViewType.Student) {
      if (lessonIsLockedForAllStudents(stageId)) {
        status = LevelStatus.locked;
      }
    }

    const showProgress = !postMilestoneDisabled || signInState !== SignInState.Unknown;
    const grayProgress = postMilestoneDisabled && signInState === SignInState.SignedIn;

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

export default connect(state => ({
  // If milestone posts are disabled, don't show progress (i.e. leave bubbles
  // white) until we know whether we're signed in or not.
  postMilestoneDisabled: state.progress.postMilestoneDisabled,
  signInState: state.progress.signInState,
  viewAs: state.stageLock.viewAs,
  levelProgress: state.progress.levelProgress,
  lessonIsLockedForAllStudents: lessonId => lessonIsLockedForAllStudents(lessonId, state)
}))(StatusProgressDot);
