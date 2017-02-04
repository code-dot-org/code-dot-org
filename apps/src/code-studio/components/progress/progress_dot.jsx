import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

import { levelProgressShape } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';
import color from "../../../util/color";
import progressStyles, { createOutline } from './progressStyles';
import { LevelStatus } from '../../activityUtils';
import { SignInState } from '../../progressRedux';

const dotSize = 24;

/**
 * Styles to color bubbles
 */
export const BUBBLE_COLORS = {
  submitted: {
    color: color.white,
    backgroundColor: color.level_submitted
  },
  perfect: {
    color: color.white,
    backgroundColor: color.level_perfect
  },
  passed: {
    color: color.white,
    backgroundColor: color.level_passed
  },
  attempted: {
    color: color.charcoal,
    backgroundColor: color.level_attempted
  },
  not_tried: {
    color: color.charcoal,
    backgroundColor: color.level_not_tried
  },
  review_rejected: {
    color: color.white,
    backgroundColor: color.level_review_rejected
  },
  review_accepted: {
    color: color.white,
    backgroundColor: color.level_perfect
  },
  dots_disabled: {
    color: color.charcoal,
    backgroundColor: color.lightest_gray
  },
  multi_level: {
    color: color.charcoal,
    backgroundColor: color.lightest_gray
  }
};

const styles = {
  outer: {
    color: color.purple
  },
  levelName: {
    display: 'table-cell',
    paddingLeft: 5,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  disabledLevel: {
    pointerEvents: 'none',
    cursor: 'default',
    color: color.charcoal
  },
  dot: {
    common: {
      display: 'inline-block',
      width: dotSize,
      height: dotSize,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: dotSize + 'px',
      borderRadius: dotSize,
      borderWidth: 2,
      borderColor: color.lighter_gray,
      margin: '0 2px',
    },
    puzzle: {
      borderStyle: 'solid',
      transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
      ':hover': {
        textDecoration: 'none',
        color: color.white,
        backgroundColor: color.level_current
      }
    },
    lockedReview: {
      borderStyle: 'dotted'
    },
    unplugged: {
      width: 'auto',
      fontSize: 13,
      padding: '0 10px'
    },
    assessment: {
      borderColor: color.assessment
    },
    small: {
      width: 7,
      height: 7,
      borderRadius: 7,
      lineHeight: 'inherit',
      verticalAlign: 'middle',
      fontSize: 0
    },
    overview: {
      height: 30,
      width: 30,
      margin: '2px 4px',
      fontSize: 16,
      lineHeight: '32px'
    },
    icon: progressStyles.dotIcon,
    icon_small: {
      width: 9,
      height: 9,
      borderWidth: 0,
      fontSize: 10,
      verticalAlign: 2
    },
    icon_complete: {
      color: color.light_gray,
      textShadow: createOutline(color.white),
      ':hover': {
        color: color.light_gray
      }
    }
  },
  status: BUBBLE_COLORS
};

function dotClicked(url, e) {
  e.preventDefault();
  saveAnswersAndNavigate(url);
}

export const BubbleInterior = React.createClass({
  propTypes: {
    showingIcon: React.PropTypes.bool,
    showingLevelName: React.PropTypes.bool,
    title: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
  },

  render() {
    if (!this.props.showingIcon) {
      if (this.props.showingLevelName) {
        // nbsp
        return <span>{'\u00a0'}</span>;
      } else {
        return <span>{this.props.title}</span>;
      }
    }
    // Icon is shown via parent div's className. No need to do anything here
    return <span/>;
  }
});

/**
 * Stage progress component used in level header and course overview.
 */
export const ProgressDot = Radium(React.createClass({
  propTypes: {
    level: levelProgressShape.isRequired,
    courseOverviewPage: React.PropTypes.bool,
    stageId: React.PropTypes.number,
    overrideLevelStatus: React.PropTypes.oneOf(Object.keys(LevelStatus)),

    // redux provdied

    // if false, display all progress as not tried
    showProgress: React.PropTypes.bool,
    // if true, display all progress as gray (dots_disabled)
    grayProgress: React.PropTypes.bool,
    currentLevelId: React.PropTypes.string,
    saveAnswersBeforeNavigation: React.PropTypes.bool.isRequired
  },

  getIconForLevelStatus(levelStatus, isLocked) {
    if (isLocked) {
      return 'fa-lock';
    } else if (levelStatus === LevelStatus.perfect || levelStatus === LevelStatus.review_accepted) {
      return 'fa-check';
    } else if (levelStatus === LevelStatus.review_rejected) {
      return 'fa-exclamation';
    } else {
      return null;
    }
  },

  render() {
    const level = this.props.level;
    let levelStatus = this.props.overrideLevelStatus || level.status;
    if (levelStatus !== LevelStatus.locked) {
      // During hoc we're going to disable milestone posts. If disabled, we want
      // to display dots as gray (unless the level is locked, in which case we
      // want to leave as is).
      if (!this.props.showProgress) {
        levelStatus = LevelStatus.not_tried;
      } else if (this.props.grayProgress) {
        levelStatus = LevelStatus.dots_disabled;
      }
    }
    const onCurrent = this.props.currentLevelId &&
        ((level.ids && level.ids.map(id => id.toString()).indexOf(this.props.currentLevelId) !== -1) ||
        level.uid === this.props.currentLevelId);

    const isUnplugged = isNaN(level.title);
    const showUnplugged = isUnplugged && (this.props.courseOverviewPage || onCurrent);
    const outlineCurrent = this.props.courseOverviewPage && onCurrent;
    const smallDot = !this.props.courseOverviewPage && !onCurrent;
    const showLevelName = /(named_level|peer_review)/.test(level.kind) && this.props.courseOverviewPage;
    const isPeerReview = level.kind === 'peer_review';
    // Account for both the level based concept of locked, and the progress based concept.
    const isLocked = level.locked || levelStatus === LevelStatus.locked;
    const iconForLevelStatus = (isLocked || showLevelName) && !isUnplugged &&
      this.props.courseOverviewPage && this.getIconForLevelStatus(levelStatus, isLocked);
    const levelUrl = isLocked ? undefined : level.url + location.search;

    return (
      <a
        key="link"
        href={levelUrl}
        onClick={this.props.saveAnswersBeforeNavigation && (levelUrl ? dotClicked.bind(null, levelUrl) : false)}
        style={[
          styles.outer,
          (showLevelName || isPeerReview) && {display: 'table-row'},
          isLocked && styles.disabledLevel
         ]}
      >
        {(level.icon && !isPeerReview) ?
          <i
            className={`fa ${level.icon}`}
            style={[
              styles.dot.common,
              styles.dot.puzzle,
              this.props.courseOverviewPage && styles.dot.overview,
              styles.dot.icon,
              smallDot && styles.dot.icon_small,
              levelStatus && levelStatus !== LevelStatus.not_tried && styles.dot.icon_complete,
              outlineCurrent && {textShadow: createOutline(color.level_current)}
            ]}
          /> :
          <div
            className={`level-${level.id}${iconForLevelStatus ? ` fa ${iconForLevelStatus}` : ''}`}
            style={[
              styles.dot.common,
              isLocked ? styles.dot.lockedReview : styles.dot.puzzle,
              this.props.courseOverviewPage && styles.dot.overview,
              smallDot && styles.dot.small,
              level.kind === 'assessment' && styles.dot.assessment,
              outlineCurrent && {borderColor: color.level_current},
              showUnplugged && styles.dot.unplugged,
              styles.status[levelStatus || LevelStatus.not_tried],
            ]}
          >
            <BubbleInterior
              showingIcon={!!iconForLevelStatus}
              showingLevelName={showLevelName}
              title={level.title || undefined}
            />
          </div>
        }
        {
          showLevelName &&
            <span
              key="named_level"
              style={[styles.levelName, isLocked && {color: color.charcoal}]}
            >
              {level.name}
            </span>
        }
      </a>
    );
  }
}));

export default connect(state => {
  const { postMilestoneDisabled, signInState } = state.progress;

  return {
    currentLevelId: state.progress.currentLevelId,
    saveAnswersBeforeNavigation: state.progress.saveAnswersBeforeNavigation,
    // If milestone posts are disabled, don't show progress (i.e. leave bubbles
    // white) until we know whether we're signed in or not.
    showProgress: !postMilestoneDisabled || signInState !== SignInState.Unknown,
    grayProgress: postMilestoneDisabled && signInState === SignInState.SignedIn,
  };
})(ProgressDot);
