/* global React, dashboard */

var STAGE_TYPE = require('./types').STAGE_TYPE;

/**
 * Stage progress component used in level header and course overview.
 */
var CourseProgressRow = React.createClass({
  propTypes: {
    stage: STAGE_TYPE
  },

  render: function () {
    var items = this.props.stage.levels.map(function (level) {
      return (
        <div style={{display: 'block'}}>
          <a href={level.url}>
            <div className={`level-${level.id} level_link ${level.status || 'not_tried'}`}>
              <i className={`fa ${level.icon}`}/>
            </div>
            &nbsp;
            {level.name}
          </a>
        </div>
      );
    });

    return (
      <div>
        <div className='teacher-stage'>
          {this.props.stage.name}
        </div>
        {items}
      </div>
    );
  }
});
module.exports = CourseProgressRow;
