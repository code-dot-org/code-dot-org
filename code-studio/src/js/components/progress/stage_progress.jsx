import React from 'react';
import { stageProgressShape } from './types';
import ProgressDot from './progress_dot.jsx';
import color from '../../color';

const styles = {
  courseOverviewContainer: {
    display: 'table-cell',
    verticalAlign: 'middle',
    paddingRight: 10
  },
  headerContainer: {
    padding: 5,
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const StageProgress = React.createClass({
  propTypes: {
    levels: stageProgressShape,
    currentLevelId: React.PropTypes.string,
    largeDots: React.PropTypes.bool,
    saveAnswersFirst: React.PropTypes.bool.isRequired
  },

  render() {
    const progressDots = this.props.levels.map((level, index) =>
      <ProgressDot
        key={index}
        level={level}
        currentLevelId={this.props.currentLevelId}
        largeDots={this.props.largeDots}
        saveAnswersFirst={this.props.saveAnswersFirst}
      />
    );

    return (
      <div className='react_stage' style={this.props.largeDots ? styles.courseOverviewContainer : styles.headerContainer}>
        {progressDots}
      </div>
    );
  }
});
module.exports = StageProgress;
