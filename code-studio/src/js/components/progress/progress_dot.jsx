import Radium from 'radium';
import React from 'react';
import { levelProgressShape } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';
import color from '../../color';

const dotSize = 24;
const styles = {
  dot: {
    puzzle: {
      display: 'inline-block',
      width: dotSize,
      height: dotSize,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: dotSize + 'px',
      borderRadius: dotSize,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: color.lighter_gray,
      margin: '0 2px',
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
      margin: '2px 4px',
      fontSize: 16,
      lineHeight: '32px'
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
const ProgressDot = React.createClass({
  propTypes: {
    levels: levelProgressShape,
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
    const level = this.props.level;
    const uid = level.uid || level.id.toString();

    let dotStyle = Object.assign({}, styles.dot.puzzle);
    if (level.kind === 'assessment') {
      Object.assign(dotStyle, styles.dot.assessment);
    }

    if (this.props.largeDots) {
      Object.assign(dotStyle, styles.dot.overview);
      if (uid === this.props.currentLevelId) {
        Object.assign(dotStyle, {borderColor: color.level_current});
      }
    } else if (uid !== this.props.currentLevelId) {
      Object.assign(dotStyle, styles.dot.small);
    }

    const isUnplugged = isNaN(level.title);
    if (isUnplugged && (this.props.largeDots || uid === this.props.currentLevelId)) {
      Object.assign(dotStyle, styles.dot.unplugged);
    }

    let onClick = null;
    if (this.props.saveAnswersFirst) {
      dotStyle.cursor = 'pointer';
      onClick = (e) => {this.dotClicked(level.url); e.preventDefault();};
    }

    return (
      <a
        className={`level-${level.id}`}
        href={level.url}
        onClick={onClick}
        style={[dotStyle, styles.status[level.status || 'not_tried']]}>
          {level.title}
      </a>
    );
  }
});
module.exports = Radium(ProgressDot);
