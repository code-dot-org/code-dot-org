/* global React, dashboard */

var STAGE_PROGRESS_TYPE = require('./stage_progress_type');
var StageProgress = require('./stage_progress.jsx');

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
      return (
        <div className='game-group' key={stage.name}>
          <div className='stage'>
            {stage.title}
            <div className='stage-lesson-plan-link' style={{display: 'none'}}>
              <a target='_blank' href={stage.lesson_plan_html_url}>
                {dashboard.i18n.t('view_lesson_plan')}
              </a>
            </div>
          </div>
          <StageProgress levels={stage.levels} largeDots={true} />
        </div>
      );
    });

    return (
      <div className='user-stats-block'>
        {rows}
      </div>
    );
  }
});
module.exports = CourseProgress;
