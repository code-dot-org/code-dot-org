/* global React, dashboard */

window.dashboard = window.dashboard || {};

var STAGE_PROGRESS_TYPE = require('./stage_progress_type');

/**
 * Stage progress component used in level header and course overview.
 */
window.dashboard.StageProgress = (function (React) {
  return React.createClass({
    propTypes: {
      levels: STAGE_PROGRESS_TYPE,
      currentLevelIndex: React.PropTypes.number,
      outerClass: React.PropTypes.string
    },

    render: function () {
      var lastIndex = this.props.levels.length - 1;
      var progressDots = this.props.levels.map(function (level, index) {

        var innerClass = 'level_link ' + (level.status || 'not_tried');
        if (level.kind == 'unplugged') {
          innerClass += ' unplugged_level';
        }

        var outerClass = (level.kind === 'assessment') ? 'puzzle_outer_assessment' : 'puzzle_outer_level';
        outerClass = (index === this.props.currentLevelIndex) ? 'puzzle_outer_current' : outerClass;
        if (index === lastIndex) {
          outerClass += ' last';
        }

        return ([
          <div className={outerClass}>
            <a
              href={level.url}
              className={innerClass + ' level-' + level.id}
              style={level.url ? isNaN(level.title) ? {'font-size': '13px', padding: '4px 10px', margin: '1px'} : {padding: '5px 4px 3px 4px', margin: '1px'} : {}}>
              {level.title}
            </a>
          </div>,
          ' '
        ]);
      }.bind(this));

      return (
        <div className={this.props.outerClass || 'progress_container'}>
          {progressDots}
        </div>
      );
    }
  });
})(React);
