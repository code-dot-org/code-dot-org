import React from 'react';
import { STAGE_PROGRESS_TYPE } from './types';
import ProgressDot from './progress_dot.jsx';
import color from '../../color';

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

  render() {
    let progressDots = this.props.levels.map(level => ([
      <ProgressDot
        level={level}
        currentLevelId={this.props.currentLevelId}
        largeDots={this.props.largeDots}
        saveAnswersFirst={this.props.saveAnswersFirst}
      />, ' '
    ]));

    return (
      <div className='react_stage' style={this.props.largeDots ? STYLES.courseOverviewContainer : STYLES.headerContainer}>
        {progressDots}
      </div>
    );
  }
});
module.exports = StageProgress;
