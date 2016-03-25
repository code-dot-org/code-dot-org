/* global React, dashboard */

var STAGE_PROGRESS_TYPE = require('./stage_progress_type');

/**
 * Stage progress component used in level header and course overview.
 */
var StageProgress = React.createClass({
  propTypes: {
    levels: STAGE_PROGRESS_TYPE,
    currentLevelIndex: React.PropTypes.number,
    largeDots: React.PropTypes.bool
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

      var isUnplugged = isNaN(level.title);
      var dotStyle = {};
      if (this.props.largeDots) {
        if (isUnplugged) {
          dotStyle = {fontSize: '13px', padding: '4px 10px', margin: '1px'};
        } else {
          dotStyle = {padding: '5px 4px 3px 4px', margin: '1px'};
        }
      }

      return ([
        <div className={outerClass}>
          <a
            href={level.url}
            className={innerClass + ' level-' + level.id}
            style={dotStyle}>
            {level.title}
          </a>
        </div>,
        ' '
      ]);
    }.bind(this));

    return (
      <div className={this.props.largeDots ? 'games' : 'progress_container'}>
        {progressDots}
      </div>
    );
  }
});
module.exports = StageProgress;
