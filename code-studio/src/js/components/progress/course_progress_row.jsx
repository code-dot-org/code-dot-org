/* global React, dashboard */

var STAGE_TYPE = require('./types').STAGE_TYPE;
var StageProgress = require('./stage_progress');

/**
 * Stage progress component used in level header and course overview.
 */
var CourseProgressRow = React.createClass({
  propTypes: {
    stage: STAGE_TYPE
  },

  render: function () {
    var stage = this.props.stage;

    return (
      <div className='game-group'>
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
  }
});
module.exports = CourseProgressRow;
