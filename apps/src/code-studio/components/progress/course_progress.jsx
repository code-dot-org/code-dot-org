import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import _ from 'lodash';

import { stageShape } from './types';
import CourseProgressRow from './course_progress_row.jsx';
import color from '../../../color';

const styles = {
  flexHeader: {
    padding: '8px 11px',
    margin: '20px 0 0 0',
    borderRadius: 5,
    background: color.cyan,
    color: color.white
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgress = React.createClass({
  propTypes: {
    professionalLearningCourse: React.PropTypes.bool,
    focusAreaPositions: React.PropTypes.arrayOf(React.PropTypes.number),
    stages: React.PropTypes.arrayOf(stageShape)
  },

  render() {
    const groups = _.groupBy(this.props.stages, stage => (stage.flex_category || 'Content'));
    let count = 1;

    return (
      <div className='user-stats-block'>
        {_.map(groups, (stages, group) =>
          <div key={group}>
            <h4
              id={group.toLowerCase().replace(' ', '-')}
              style={[
                this.props.professionalLearningCourse ? styles.flexHeader : {display: 'none'},
                count === 1 && {margin: '2px 0 0 0'}
              ]}
            >
              {group}
            </h4>
            {stages.map(stage =>
              <CourseProgressRow
                stage={stage}
                key={stage.name}
                isFocusArea={this.props.focusAreaPositions.indexOf(count++) > -1}
                professionalLearningCourse={this.props.professionalLearningCourse}
              />
            )}
          </div>
        )}
      </div>
    );
  }
});

export default connect(state => ({
  professionalLearningCourse: state.professionalLearningCourse,
  focusAreaPositions: state.focusAreaPositions,
  stages: state.stages
}))(Radium(CourseProgress));
