import React from 'react';
import { connect } from 'react-redux';
import { stageShape } from './types';
import _ from 'lodash';
import CourseProgressRow from './course_progress_row.jsx';

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgress = React.createClass({
  propTypes: {
    currentLevelId: React.PropTypes.string,
    display: React.PropTypes.oneOf(['dots', 'list']).isRequired,
    stages: React.PropTypes.arrayOf(stageShape)
  },

  render() {
    const groups = _.groupBy(this.props.stages, stage => (stage.flex_category || 'Content'));

    const rows = _.map(groups, (stages, group) =>
      <div className="flex-wrapper" key={group}>
        <div className="flex-category">
          <h4>{group}</h4>
          {stages.map(stage => <CourseProgressRow stage={stage} key={stage.name} currentLevelId={this.props.currentLevelId} />)}
        </div>
      </div>
    );

    return (
      <div className='user-stats-block'>
        {rows}
      </div>
    );
  }
});

export default connect(state => ({
  currentLevelId: state.currentLevelId,
  display: state.display,
  stages: state.stages
}))(CourseProgress);
