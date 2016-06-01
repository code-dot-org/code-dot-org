import Radium from 'radium';
import React from 'react';
import { STAGE_PROGRESS_TYPE } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';
import color from '../../color';

var style = {
  overviewContainer: {
    display: 'table-cell',
    verticalAlign: 'middle',
    paddingRight: '10px'
  },
  headerContainer: {
    padding: '5px 8px',
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: '5px'
  },
  dot: {
    puzzle: {
      display: 'inline-block',
      width: '24px',
      height: '24px',
      fontSize: '14px',
      textAlign: 'center',
      lineHeight: '24px',
      borderRadius: '24px',
      borderWidth: '2px',
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
      fontSize: '13px',
      padding: '0 10px'
    },
    assessment: {
      borderColor: color.assessment
    },
    small: {
      width: '7px',
      height: '7px',
      borderRadius: '7px',
      lineHeight: 'inherit',
      fontSize: 0
    },
    overview: {
      height: '30px',
      width: '30px',
      margin: '2px',
      fontSize: '16px',
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
var StageProgress = React.createClass({
  propTypes: {
    levels: STAGE_PROGRESS_TYPE,
    currentLevelIndex: React.PropTypes.number,
    largeDots: React.PropTypes.bool,
    saveAnswersFirst: React.PropTypes.bool.isRequired
  },

  dotClicked(url) {
    if (saveAnswersAndNavigate) {
      saveAnswersAndNavigate(url);
    }
  },

  render() {
    var progressDots = this.props.levels.map((level, index) => {

      var dotStyle = Object.assign({}, style.dot.puzzle);
      if (this.props.largeDots) {
        Object.assign(dotStyle, style.dot.overview);
      } else if (index !== this.props.currentLevelIndex) {
        Object.assign(dotStyle, style.dot.small);
      }

      var isUnplugged = isNaN(level.title);
      if (isUnplugged) {
        Object.assign(dotStyle, style.dot.unplugged);
      }

      if (level.kind === 'assessment') {
        Object.assign(dotStyle, style.dot.assessment);
      }

      var onClick = null;
      if (this.props.saveAnswersFirst) {
        dotStyle.cursor = 'pointer';
        onClick = (e) => {this.dotClicked(level.url); e.preventDefault();};
      }

      return ([
        <a
          key={index}
          href={level.url}
          onClick={onClick}
          style={[dotStyle, style.status[level.status || 'not_tried']]}>
            {level.title}
        </a>,
        ' '
      ]);
    });

    return (
      <div style={this.props.largeDots ? style.overviewContainer : style.headerContainer}>
        {progressDots}
      </div>
    );
  }
});
module.exports = Radium(StageProgress);
