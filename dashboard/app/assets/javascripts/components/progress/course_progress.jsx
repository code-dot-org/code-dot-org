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
        lessonPlanLink: React.PropTypes.string,
        levels: dashboard.STAGE_PROGRESS_TYPE
      }))
    },

    render: function () {
      var rows = this.props.stages.map(function (stage) {
        return <window.dashboard.StageProgress levels={stage.levels} />;
      });

      return (
        <div className="user-stats-block">
          {rows}
        </div>
      );
    }
  });
})(React);
