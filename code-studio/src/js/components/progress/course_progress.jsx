/* global React, dashboard */

var STAGE_TYPE = require('./types').STAGE_TYPE;
var CourseProgressRow = require('./course_progress_row');
var StageDetails = require('./stage_details');

/**
 * Stage progress component used in level header and course overview.
 */
var CourseProgress = React.createClass({
  propTypes: {
    display: React.PropTypes.oneOf(['dots', 'list']).isRequired,
    stages: React.PropTypes.arrayOf(STAGE_TYPE)
  },

  getRow: function (stage) {
    if (this.props.display === 'dots') {
      return <CourseProgressRow stage={stage} key={stage.name}/>;
    } else {
      return <StageDetails  stage={stage} key={stage.name}/>;
    }
  },

  render: function () {
    var rows = [], stages = this.props.stages;

    // Iterate through each stage. When a stage with a flex_category is found,
    // greedily add stages with the same flex_category until finding a stage
    // with a different (or no) flex_category.
    for (var i = 0; i < stages.length; ) {

      if (stages[i].flex_category) {
        var flexRows = [], previous = stages[i].flex_category;
        for ( ; i < stages.length && stages[i].flex_category === previous; i++) {
          flexRows.push(this.getRow(stages[i]));
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
        rows.push(this.getRow(stages[i]));
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
