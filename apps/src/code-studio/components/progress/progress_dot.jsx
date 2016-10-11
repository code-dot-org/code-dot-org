import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

import { levelProgressShape } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';
import color from '../../../color';
import progressStyles, { createOutline } from './progressStyles';
import { LevelStatus } from '../../activityUtils';
import { ViewType, fullyLockedStageMapping } from '../../stageLockRedux';

const dotSize = 24;
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
  status: {
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
    }
  }
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

    // redux provdied
    overrideLevelStatus: React.PropTypes.oneOf(Object.keys(LevelStatus)),
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
    const levelStatus = this.props.overrideLevelStatus || level.status;
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

export default connect((state, ownProps) => {
  // If we're a teacher viewing as a student, we want to render lockable stages
  // to have a lockable item only if the stage is fully locked.
  // Do this by providing an overrideLevelStatus, which will take precedence
  // over level.status
  const stageId = ownProps.stageId;
  let overrideLevelStatus;
  const { selectedSection } = state.sections;
  const fullyLocked = fullyLockedStageMapping(state.stageLock[selectedSection]);
  if (stageId !== undefined && state.stageLock.viewAs === ViewType.Student &&
      !!fullyLocked[stageId]) {
    overrideLevelStatus = LevelStatus.locked;
  }
  return {
    currentLevelId: state.progress.currentLevelId,
    saveAnswersBeforeNavigation: state.progress.saveAnswersBeforeNavigation,
    overrideLevelStatus
  };
})(ProgressDot);




if (BUILD_STYLEGUIDE) {
  ProgressDot.styleGuideExamples = storybook => {
    storybook
      .storiesOf('ProgressDot', module)
      .addStoryTable([
        {
          name: 'assessment in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [5275],
                kind: 'assessment',
                next: [2, 1],
                position: 1,
                previous: false,
                status: 'not_tried',
                title: 1,
                uid: '5275_0',
                url: 'http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1'
              }}
            />
          )
        },
        {
          name: 'locked assessment in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [5275],
                kind: 'assessment',
                next: [2, 1],
                position: 1,
                previous: false,
                status: 'locked',
                title: 1,
                uid: '5275_0',
                url: 'http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1'
              }}
            />
          )
        },
        {
          name: 'submitted assessment in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [5275],
                kind: 'assessment',
                next: [2, 1],
                position: 1,
                previous: false,
                status: 'submitted',
                title: 1,
                uid: '5275_0',
                url: 'http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1'
              }}
            />
          )
        },
        {
          name: 'attempted puzzle in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [5275],
                kind: 'puzzle',
                next: [2, 1],
                position: 1,
                previous: [7,15],
                status: 'attempted',
                title: 1,
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1'
              }}
            />
          )
        },
        {
          name: 'imperfect completed puzzle in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [2288],
                kind: 'puzzle',
                next: [2, 1],
                position: 6,
                status: 'passed',
                title: 6,
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/11/puzzle/6'
              }}
            />
          )
        },
        {
          name: 'completed puzzle in course overview',
          description: 'Note: Center of the circle should be a number rather than an checkmark',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [2288],
                kind: 'puzzle',
                next: [2, 1],
                position: 6,
                status: 'perfect',
                title: 6,
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/11/puzzle/6'
              }}
            />
          )
        },
        {
          name: 'current puzzle in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              currentLevelId="2288"
              level={{
                icon: null,
                ids: [2288],
                kind: 'puzzle',
                position: 6,
                status: 'not_tried',
                title: 6,
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/11/puzzle/6'
              }}
            />
          )
        },
        {
          name: 'unlplugged puzzle in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [2094],
                kind: 'unplugged',
                previous: [1, 2],
                position: 1,
                status: 'not_tried',
                title: 'Unplugged Activity',
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/2/puzzle/1'
              }}
            />
          )
        },
        {
          name: 'puzzle with icon in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: 'fa-file-text',
                ids: [1379],
                kind: 'puzzle',
                name: 'CSP Pre-survey',
                position: 2,
                status: 'not_tried',
                title: 2,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/2'
              }}
            />
          )
        },
        {
          name: 'named level in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: 'fa-file-text',
                ids: [5442],
                kind: 'named_level',
                name: 'CSP Pre-survey',
                position: 1,
                previous: [1,1],
                status: 'not_tried',
                title: 1,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/1'
              }}
            />
          )
        },
        {
          name: 'completed named video level in course overview',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: 'fa-video-camera',
                ids: [5078],
                kind: 'named_level',
                name: 'Computer Science is Changing Everything',
                position: 3,
                previous: [1,1],
                status: 'perfect',
                title: 3,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/3'
              }}
            />
          )
        },
        {
          name: 'rejected peer review in course overview',
          description: 'Note: Center of circle should have an exclamation point',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                ids: [1073563865],
                position: 7,
                kind: "named_level",
                icon: null,
                title: 7,
                url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
                name: "Peer Review Level 1 - Tuesday Report",
                status: "review_rejected"
              }}
            />
          )
        },
        {
          name: 'accepted peer review in course overview',
          description: 'Note: Center of circle should have a checkmark',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                ids: [1073563865],
                position: 7,
                kind: "named_level",
                icon: null,
                title: 7,
                url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
                name: "Peer Review Level 1 - Tuesday Report",
                status: "review_accepted"
              }}
            />
          )
        },
        {
          name: 'submitted but unreviewed peer review in course overview',
          description: 'Note: Center of circle should have no icon',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                ids: [1073563865],
                position: 7,
                kind: "named_level",
                icon: null,
                title: 7,
                url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
                name: "Peer Review Level 1 - Tuesday Report",
                status: "submitted"
              }}
            />
          )
        },
        {
          name: 'locked peer review in course overview',
          description: 'Note: Center of circle should have a locked icon',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                ids: [0],
                kind: "peer_review",
                title: "",
                url: "",
                name: "Reviews unavailable at this time",
                icon: "fa-lock",
                locked: true
              }}
            />
          )
        },
        {
          name: 'named video level in course overview with no icon',
          story: () => (
            <ProgressDot
              courseOverviewPage={true}
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [5096],
                kind: 'named_level',
                name: 'Internet Simulator: sending binary messages',
                position: 2,
                status: 'not_tried',
                title: 2,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/3/puzzle/2'
              }}
            />
          )
        },
        {
          name: 'small named level in header',
          story: () => (
            <ProgressDot
              courseOverviewPage={false}
              currentLevelId="1379"
              saveAnswersBeforeNavigation={false}
              level={{
                icon: 'fa-file-text',
                ids: [5442],
                kind: 'named_level',
                name: 'CSP Pre-survey',
                position: 1,
                previous: [1,1],
                status: 'not_tried',
                title: 1,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/1'
              }}
            />
          )
        },
        {
          name: 'completed small named video level in header',
          story: () => (
            <ProgressDot
              courseOverviewPage={false}
              currentLevelId="1379"
              saveAnswersBeforeNavigation={false}
              level={{
                icon: 'fa-video-camera',
                ids: [5078],
                kind: 'named_level',
                name: 'Computer Science is Changing Everything',
                position: 3,
                previous: [1,1],
                status: 'perfect',
                title: 3,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/3'
              }}
            />
          )
        },
        {
          name: 'small puzzle in header',
          story: () => (
            <ProgressDot
              courseOverviewPage={false}
              currentLevelId="1379"
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [2049],
                kind: 'puzzle',
                position: 4,
                next: [3,1],
                status: 'not_tried',
                title: 4,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/4'
              }}
            />
          )
        },
        {
          name: 'current level puzzle in header',
          story: () => (
            <ProgressDot
              courseOverviewPage={false}
              currentLevelId="2049"
              saveAnswersBeforeNavigation={false}
              level={{
                icon: null,
                ids: [2049],
                kind: 'puzzle',
                position: 4,
                next: [3,1],
                status: 'not_tried',
                title: 4,
                url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/4'
              }}
            />
          )
        },
      ]);
  };
}
