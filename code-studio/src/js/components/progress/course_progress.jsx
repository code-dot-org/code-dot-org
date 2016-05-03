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
      flex_category: React.PropTypes.string,
      levels: STAGE_PROGRESS_TYPE
    }))
  },

  render: function () {
    var rows = [], stages = this.props.stages;
    for (var i = 0; i < stages.length; ) {

      if (stages[i].flex_category) {
        var flexRows = [], previous = stages[i].flex_category;
        for ( ; i < stages.length && stages[i].flex_category === previous; i++) {
          flexRows.push(<CourseProgressRow stage={stages[i]} key={stages[i].name}/>);
        }
        rows.push(
          <div className="flex-wrapper">
            <div key={previous} className="flex-category">
              <h4>{previous}</h4>
              {flexRows}
            </div>
          </div>
        );
      } else {
        rows.push(<CourseProgressRow stage={stages[i]} key={stages[i].name}/>);
        i++;
      }
    }

    return (
      <div className='user-stats-block'>
        {rows}
      </div>
    );
  }
});
module.exports = CourseProgress;
