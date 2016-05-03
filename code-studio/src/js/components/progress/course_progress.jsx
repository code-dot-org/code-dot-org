/* global React, dashboard */

var STAGE_PROGRESS_TYPE = require('./stage_progress_type');
var CourseProgressRow = require('./course_progress_row');

/**
 * Stage progress component used in level header and course overview.
 */
var CourseProgress = React.createClass({
  propTypes: {
    stages: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      lesson_plan_html_url: React.PropTypes.string,
      levels: STAGE_PROGRESS_TYPE
    }))
  },

  render: function () {
    var rows = this.props.stages.map(function (stage) {
      return <CourseProgressRow stage={stage} key={stage.name}/>;
    });

    return (
      <div className='user-stats-block'>
        {rows}
      </div>
    );
  }
});
module.exports = CourseProgress;
