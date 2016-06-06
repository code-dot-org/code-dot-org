import Radium from 'radium';
import React from 'react';
import { STAGE_PROGRESS_TYPE } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';
import color from '../../color';

const DOT_SIZE = 24;
const STYLES = {
  courseOverviewContainer: {
    display: 'table-cell',
    verticalAlign: 'middle',
    paddingRight: 10
  },
  headerContainer: {
    padding: '5px 8px',
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5
  },
  dot: {
    puzzle: {
      display: 'inline-block',
      width: DOT_SIZE,
      height: DOT_SIZE,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: DOT_SIZE + 'px',
      borderRadius: DOT_SIZE,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: color.lighter_gray,
      margin: '0 -1px',
      transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
      ':hover': {
        textDecoration: 'none',
        color: color.white,
        backgroundColor: color.level_current
      }
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
      fontSize: 0
    },
    overview: {
      height: 30,
      width: 30,
      margin: 2,
      fontSize: 16,
      lineHeight: 32
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

/**
 * Stage progress component used in level header and course overview.
 */
let StageProgress = React.createClass({
  propTypes: {
    levels: STAGE_PROGRESS_TYPE,
    currentLevelId: React.PropTypes.string,
    largeDots: React.PropTypes.bool,
    saveAnswersFirst: React.PropTypes.bool.isRequired
  },

  dotClicked(url) {
    if (saveAnswersAndNavigate) {
      saveAnswersAndNavigate(url);
    }
  },

  render() {
    let progressDots = this.props.levels.map(level => {
      let uid = level.uid || level.id.toString();

      let dotStyle = Object.assign({}, STYLES.dot.puzzle);
      if (level.kind === 'assessment') {
        Object.assign(dotStyle, STYLES.dot.assessment);
      }

      if (this.props.largeDots) {
        Object.assign(dotStyle, STYLES.dot.overview);
        if (uid === this.props.currentLevelId) {
          Object.assign(dotStyle, {borderColor: color.level_current});
        }
      } else if (uid !== this.props.currentLevelId) {
        Object.assign(dotStyle, STYLES.dot.small);
      }

      let isUnplugged = isNaN(level.title);
      if (isUnplugged) {
        Object.assign(dotStyle, STYLES.dot.unplugged);
      }

      let onClick = null;
      if (this.props.saveAnswersFirst) {
        dotStyle.cursor = 'pointer';
        onClick = (e) => {this.dotClicked(level.url); e.preventDefault();};
      }

      return ([
        <a
          key={uid}
          className={`level-${level.id}`}
          href={level.url}
          onClick={onClick}
          style={[dotStyle, STYLES.status[level.status || 'not_tried']]}>
            {level.title}
        </a>,
        ' '
      ]);
    });

    return (
      <div className='react_stage' style={this.props.largeDots ? STYLES.courseOverviewContainer : STYLES.headerContainer}>
        {progressDots}
      </div>
    );
  }
});
module.exports = Radium(StageProgress);
