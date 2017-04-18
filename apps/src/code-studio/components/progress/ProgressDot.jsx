import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import _ from 'lodash';
import { levelProgressShape } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';
import color from '@cdo/apps/util/color';
import { createOutline } from './progressStyles';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';

const dotSize = 24;

/**
 * Styles to color bubbles
 */
export const BUBBLE_COLORS = {
  [LevelStatus.submitted]: {
    color: color.white,
    backgroundColor: color.level_submitted
  },
  [LevelStatus.perfect]: {
    color: color.white,
    backgroundColor: color.level_perfect
  },
  [LevelStatus.passed]: {
    color: color.white,
    backgroundColor: color.level_passed
  },
  [LevelStatus.attempted]: {
    color: color.charcoal,
    backgroundColor: color.level_attempted
  },
  [LevelStatus.not_tried]: {
    color: color.charcoal,
    backgroundColor: color.level_not_tried
  },
  [LevelStatus.review_rejected]: {
    color: color.white,
    backgroundColor: color.level_review_rejected
  },
  [LevelStatus.review_accepted]: {
    color: color.white,
    backgroundColor: color.level_perfect
  },
  [LevelStatus.dots_disabled]: {
    color: color.charcoal,
    backgroundColor: color.lightest_gray
  },
  multi_level: {
    color: color.charcoal
  },
  [LevelStatus.locked]: {
    color: color.charcoal,
    backgroundColor: color.white
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
  iconBasedDot: {
    display: 'inline-block'
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
    icon: {
      borderColor: 'transparent',
      fontSize: 24,
      verticalAlign: -4,
      color: color.white,
      textShadow: createOutline(color.lighter_gray),
      ':hover': {
        color: color.white,
        backgroundColor: 'transparent'
      }
    },
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
  // In our redesign we want locked levels to have a white background, but we
  // don't want this in non-redesigned dots. Accomplish this not having a
  // bubble color for locked.
  status: _.omit(BUBBLE_COLORS, LevelStatus.locked)
};

// Longer term, I'd like the server to provide us an icon type, instead of a
// className. For now, I'm going to use the className in level.icon as if it
// were actually a type key.
const iconClassFromIconType = {
  'fa-file-text': 'fa fa-file-text',
  // Explicitly don't want to use an icon for this type
  'fa-list-ol': undefined,
  'fa-external-link-square': 'fa fa-external-link-square',
  'fa-video-camera': 'fa fa-video-camera',
  'fa-stop-circle': 'fa fa-stop-circle',
  'fa-map': 'fa fa-map',
};

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
    // More accurately, something like allStages. True on the overview page, but
    // also when we select dropdown from header.
    courseOverviewPage: React.PropTypes.bool,
    stageId: React.PropTypes.number,
    status: React.PropTypes.oneOf(Object.keys(LevelStatus)).isRequired,

    // redux provdied
    currentLevelId: React.PropTypes.string,
    saveAnswersBeforeNavigation: React.PropTypes.bool.isRequired
  },

  onClick(event) {
    const { saveAnswersBeforeNavigation } = this.props;
    const href = ReactDOM.findDOMNode(this).href;
    if (!saveAnswersBeforeNavigation || !href) {
      return;
    }

    event.preventDefault();
    saveAnswersAndNavigate(href);
  },

  iconClassName() {
    const { level, status } = this.props;
    if (status === LevelStatus.locked) {
      return 'fa fa-lock';
    }

    if (level.kind === LevelKind.peer_review) {
      if (status === LevelStatus.perfect ||
          status === LevelStatus.review_accepted) {
        return 'fa fa-check';
      } else if (status === LevelStatus.review_rejected) {
        return 'fa fa-exclamation';
      } else {
        return '';
      }
    }

    if (level.icon) {
      return iconClassFromIconType[level.icon];
    }
    return '';
  },

  tooltipContent() {
    const { level } = this.props;
    if (level.name === undefined) {
      return level.title;
    }
    return level.title +". "+ level.name;
  },

  renderTooltip(tooltipId) {
    const { courseOverviewPage } = this.props;
    if (!courseOverviewPage) {
      return (
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          effect="solid"
        >
          {this.tooltipContent()}
        </ReactTooltip>
      );
    }
  },

  render() {

    const { level, status, courseOverviewPage, currentLevelId } = this.props;

    const onCurrent = currentLevelId &&
        ((level.ids && level.ids.map(id => id.toString()).indexOf(currentLevelId) !== -1) ||
        level.uid === currentLevelId);

    const isUnplugged = level.kind === LevelKind.unplugged;
    const showUnplugged = isUnplugged && (courseOverviewPage || onCurrent);
    const outlineCurrent = courseOverviewPage && onCurrent;
    const smallDot = !courseOverviewPage && !onCurrent;
    const showLevelName = courseOverviewPage && !!level.name;
    const isPeerReview = level.kind === LevelKind.peer_review;
    // Account for both the level based concept of locked, and the progress based concept.
    const isLocked = status === LevelStatus.locked;

    const tooltipId = _.uniqueId();

    return (
      <a
        key="link"
        href={isLocked ? undefined : level.url + location.search}
        onClick={this.onClick}
        style={[
          styles.outer,
          (showLevelName || isPeerReview) && {display: 'table-row'},
          isLocked && styles.disabledLevel
         ]}
      >
        {(iconClassFromIconType[level.icon] && !isPeerReview) ?
          <div
            data-tip
            data-for={tooltipId}
            aria-describedby={tooltipId}
            style={styles.iconBasedDot}
          >
            <i
              className={this.iconClassName()}
              style={[
                styles.dot.common,
                styles.dot.puzzle,
                courseOverviewPage && styles.dot.overview,
                styles.dot.icon,
                smallDot && styles.dot.icon_small,
                status && status !== LevelStatus.not_tried && styles.dot.icon_complete,
                outlineCurrent && {textShadow: createOutline(color.level_current)}
              ]}
            />
            {this.renderTooltip(tooltipId)}
          </div> :

          <div
            className={this.iconClassName()}
            style={[
              styles.dot.common,
              isLocked ? styles.dot.lockedReview : styles.dot.puzzle,
              courseOverviewPage && styles.dot.overview,
              smallDot && styles.dot.small,
              level.kind === LevelKind.assessment && styles.dot.assessment,
              outlineCurrent && {borderColor: color.level_current},
              showUnplugged && styles.dot.unplugged,
              styles.status[status || LevelStatus.not_tried],
            ]}
          >

          <div
            data-tip
            data-for={tooltipId}
            aria-describedby={tooltipId}
          >
            <BubbleInterior
              showingIcon={!!this.iconClassName()}
              showingLevelName={showLevelName}
              title={this.props.level.title || undefined}
            />
            {this.renderTooltip(tooltipId)}
          </div>

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

export default connect(state => ({
  currentLevelId: state.progress.currentLevelId,
  saveAnswersBeforeNavigation: state.progress.saveAnswersBeforeNavigation
}))(ProgressDot);
