import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

import { levelProgressShape } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';
import color from '../../../color';
import progressStyles, { createOutline } from './progressStyles';

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
    cursor: 'default'
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
      backgroundColor: color.level_review_accepted
    }
  }
};

function dotClicked(url, e) {
  e.preventDefault();
  saveAnswersAndNavigate(url);
}

export const BubbleInterior = React.createClass({
  propTypes: {
    courseOverviewPage: React.PropTypes.bool,
    showingIcon: React.PropTypes.bool,
    showingLevelName: React.PropTypes.bool,
    title: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
  },

  render() {
    let bubbleInterior;

    if (this.props.courseOverviewPage && this.props.showingLevelName) {
      if (this.props.showingIcon) {
        bubbleInterior = '';
      } else {
        bubbleInterior = '\u00a0';
      }
    } else {
      bubbleInterior = !this.props.showingIcon && this.props.title;
    }

    return (
      <span>
        {bubbleInterior}
      </span>
    );
  }
});

/**
 * Stage progress component used in level header and course overview.
 */
export const ProgressDot = React.createClass({
  propTypes: {
    level: levelProgressShape.isRequired,
    currentLevelId: React.PropTypes.string,
    courseOverviewPage: React.PropTypes.bool,
    saveAnswersBeforeNavigation: React.PropTypes.bool.isRequired
  },

  getIconForLevelStatus(level) {
    if (level.locked) {
      return 'fa-lock';
    } else if (level.status === 'perfect') {
      return 'fa-check';
    } else {
      return null;
    }
  },

  render() {
    const level = this.props.level;
    const onCurrent = this.props.currentLevelId &&
        ((level.ids && level.ids.map(id => id.toString()).indexOf(this.props.currentLevelId) !== -1) ||
        level.uid === this.props.currentLevelId);

    const isUnplugged = isNaN(level.title);
    const showUnplugged = isUnplugged && (this.props.courseOverviewPage || onCurrent);
    const outlineCurrent = this.props.courseOverviewPage && onCurrent;
    const smallDot = !this.props.courseOverviewPage && !onCurrent;
    const showLevelName = /(named_level|peer_review)/.test(level.kind) && this.props.courseOverviewPage;
    const isPeerReview = level.kind === 'peer_review';
    const iconForLevelStatus = !isUnplugged && this.props.courseOverviewPage && this.getIconForLevelStatus(level);
    const levelUrl = level.locked ? undefined : level.url + location.search;

    return (
      <a
        key="link"
        href={levelUrl}
        onClick={this.props.saveAnswersBeforeNavigation && (levelUrl ? dotClicked.bind(null, levelUrl) : false)}
        style={[
          styles.outer,
          (showLevelName || isPeerReview) && {display: 'table-row'},
           level.locked && styles.disabledLevel
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
              level.status && level.status !== 'not_tried' && styles.dot.icon_complete,
              outlineCurrent && {textShadow: createOutline(color.level_current)}
            ]}
          /> :
          <div
            className={`level-${level.id}${iconForLevelStatus ? ` fa ${iconForLevelStatus}` : ''}`}
            style={[
              styles.dot.common,
              level.locked ? styles.dot.lockedReview : styles.dot.puzzle,
              this.props.courseOverviewPage && styles.dot.overview,
              smallDot && styles.dot.small,
              level.kind === 'assessment' && styles.dot.assessment,
              outlineCurrent && {borderColor: color.level_current},
              showUnplugged && styles.dot.unplugged,
              styles.status[level.status || 'not_tried'],
            ]}
          >
            <BubbleInterior
              courseOverviewPage={this.props.courseOverviewPage}
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
              style={[styles.levelName, level.locked && {color: color.charcoal}]}
            >
              {level.name}
            </span>
        }
      </a>
    );
  }
});

export default connect(state => ({
  currentLevelId: state.progress.currentLevelId,
  saveAnswersBeforeNavigation: state.progress.saveAnswersBeforeNavigation
}))(Radium(ProgressDot));
