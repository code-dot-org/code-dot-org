/* global React */

window.dashboard = window.dashboard || {};

/**
 * Stage progress component used in level header and course overview.
 */
window.dashboard.StageProgress = (function (React) {
  return React.createClass({
    propTypes: {
      levels: React.PropTypes.arrayOf(React.PropTypes.shape({
        title: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
        status: React.PropTypes.string,
        kind: React.PropTypes.oneOf(['unplugged', 'assessment', 'puzzle']),
        link: React.PropTypes.string,
        id: React.PropTypes.number
      })),
      currentLevelIndex: React.PropTypes.number
    },

    render: function () {
      var lastIndex = this.props.levels.length - 1;
      var progressDots = this.props.levels.map(function (level, index) {

        var innerClass = 'level_link ' + level.status;
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
            <a id={'header-level-' + level.id} href={level.link} className={innerClass}>{level.title}</a>
          </div>,
          ' '
        ]);
      }.bind(this));

      return (
        <div className="progress_container">
          {progressDots}
        </div>
      );
    }
  });
})(React);
