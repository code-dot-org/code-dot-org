import React from 'react';
import { STAGE_PROGRESS_TYPE } from './types';
import { saveAnswersAndNavigate } from '../../levels/saveAnswers';

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

      var innerClass = 'level_link ' + (level.status || 'not_tried');
      if (level.kind === 'unplugged') {
        innerClass += ' unplugged_level';
      }

      var outerClass = (level.kind === 'assessment') ? 'puzzle_outer_assessment' : 'puzzle_outer_level';
      outerClass = (index === this.props.currentLevelIndex) ? 'puzzle_outer_current' : outerClass;

      var isUnplugged = isNaN(level.title);
      var dotStyle = {};
      if (this.props.largeDots) {
        if (isUnplugged) {
          dotStyle = {fontSize: '13px', padding: '4px 10px', margin: '1px'};
        } else {
          dotStyle = {padding: '5px 4px 3px 4px', margin: '1px'};
        }
      }

      var onClick = null;
      if (this.props.saveAnswersFirst) {
        dotStyle.cursor = 'pointer';
        onClick = (e) => {this.dotClicked(level.url); e.preventDefault();};
      }

      return ([
        <div className={outerClass}>
          <a
            href={level.url}
            onClick={onClick}
            className={innerClass + ' level-' + level.id}
            style={dotStyle}>
              {level.title}
          </a>
        </div>,
        ' '
      ]);
    });

    return (
      <div className={this.props.largeDots ? 'games' : 'progress_container'}>
        {progressDots}
      </div>
    );
  }
});
module.exports = StageProgress;
