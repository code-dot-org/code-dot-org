import React from 'react';
import { connect } from 'react-redux';
import { stageShape } from './types';
import _ from 'lodash';
import CourseProgressRow from './course_progress_row.jsx';
import StageDetails from './stage_details.jsx';

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgress = React.createClass({
  propTypes: {
    currentLevelId: React.PropTypes.string,
    display: React.PropTypes.oneOf(['dots', 'list']).isRequired,
    stages: React.PropTypes.arrayOf(stageShape)
  },

  getRow(stage) {
    if (this.props.display === 'dots') {
      return <CourseProgressRow stage={stage} key={stage.name} currentLevelId={this.props.currentLevelId} />;
    } else {
      return <StageDetails stage={stage} key={stage.name} />;
    }
  },

  render() {
    const groups = _.groupBy(this.props.stages, stage => (stage.flex_category || 'Content'));

    const rows = _.map(groups, (stages, group) =>
      <div className="flex-wrapper" key={group}>
        <div className="flex-category">
          <h4>{group}</h4>
          {stages.map(this.getRow)}
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
