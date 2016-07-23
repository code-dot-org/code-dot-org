import React from 'react';
import { connect } from 'react-redux';

import { stageProgressShape } from './types';
import ProgressDot from './progress_dot.jsx';
import color from '../../../color';

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
    courseOverviewPage: React.PropTypes.bool
  },

  render() {
    const progressDots = this.props.levels.map((level, index) =>
      <ProgressDot
        key={index}
        level={level}
        courseOverviewPage={this.props.courseOverviewPage}
      />
    );

    return (
      <div className="react_stage" style={this.props.courseOverviewPage ? styles.courseOverviewContainer : styles.headerContainer}>
        {progressDots}
      </div>
    );
  }
});
export default connect((state, ownProps) => ({
  // When rendering StageProgress directly (in the header) only show one stage.
  levels: ownProps.levels || state.stages[0].levels
}))(StageProgress);
