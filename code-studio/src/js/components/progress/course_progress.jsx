/* global React, dashboard */

window.dashboard = window.dashboard || {};

/**
 * Stage progress component used in level header and course overview.
 */
window.dashboard.CourseProgress = (function (React) {
  return React.createClass({
    propTypes: {
      stages: React.PropTypes.arrayOf(React.PropTypes.shape({
        name: React.PropTypes.string,
        lesson_plan_html_url: React.PropTypes.string,
        levels: dashboard.STAGE_PROGRESS_TYPE
      }))
    },

    render: function () {
      var rows = this.props.stages.map(function (stage) {
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
            <window.dashboard.StageProgress levels={stage.levels} outerClass='games' />
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
})(React);
