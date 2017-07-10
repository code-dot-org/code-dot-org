// TODO: rename file now that it wraps ProgressBubble instead of dot

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProgressDot from './ProgressDot';
import { levelProgressShape } from './types';
import { ViewType } from '../../stageLockRedux';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { SignInState, statusForLevel } from '../../progressRedux';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import { lessonIsLockedForAllStudents } from '@cdo/apps/templates/progress/progressHelpers';
import experiments from '@cdo/apps/util/experiments';

/**
 * Wrapper around ProgressDot that owns determining the correct status for the
 * underlying component.
 */
export const StatusProgressDot = React.createClass({
  propTypes: {
    // non-redux provided
    level: levelProgressShape.isRequired,
    stageId: PropTypes.number,

    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    postMilestoneDisabled: PropTypes.bool.isRequired,
    signInState: PropTypes.oneOf(Object.values(SignInState)).isRequired,
    levelProgress: PropTypes.object.isRequired,
    currentLevelId: React.PropTypes.string,
    lessonIsLockedForAllStudents: PropTypes.func.isRequired
  },

  render() {
    const {
      level,
      stageId,
      viewAs,
      postMilestoneDisabled,
      signInState,
      levelProgress,
      currentLevelId,
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

    if (experiments.isEnabled('progressBubbles')) {
      const onCurrent = currentLevelId &&
        ((level.ids && level.ids.map(id => id.toString()).indexOf(currentLevelId) !== -1) ||
        level.uid === currentLevelId);

      return (
        <ProgressBubble
          number={level.position}
          status={status}
          url={level.url}
          disabled={false}
          levelName={level.name}
          levelIcon={(level.icon || '').slice(3)}
          smallBubble={!onCurrent}
        />
      );
    } else {
      return (
        <ProgressDot
          level={level}
          stageId={stageId}
          status={status}
        />
      );
    }
  }
});

export default connect(state => ({
  // If milestone posts are disabled, don't show progress (i.e. leave bubbles
  // white) until we know whether we're signed in or not.
  postMilestoneDisabled: state.progress.postMilestoneDisabled,
  signInState: state.progress.signInState,
  viewAs: state.stageLock.viewAs,
  levelProgress: state.progress.levelProgress,
  currentLevelId: state.progress.currentLevelId,
  lessonIsLockedForAllStudents: lessonId => lessonIsLockedForAllStudents(lessonId, state)
}))(StatusProgressDot);
