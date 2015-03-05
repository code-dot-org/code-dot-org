// ProgressBox: stage={} selected=id progress={}
components.ProgressBox = React.createClass({
  render: function() {
    var cs = React.addons.classSet;
    var P = this.props || {};

    var stage = P.stage || {};
    var levels = stage.levels || [];
    if (!levels.length)
      return false;

    var levelProgress = P.progress.levels || {};

    var els = $.map(levels, function(level, index) {
      var status = levelProgress[level.id] || {};

      var href = Frame.linkTo({
        script: stage.script_name,
        stage: stage.position,
        level: level.position
      });

      var classes1 = {
        'puzzle_outer_level': level.kind != 'assessment',
        'puzzle_outer_assessment': level.kind == 'assessment',
        'puzzle_outer_current': level.id == P.selected,
        'last': index === levels.length - 1
      };

      var classes2 = {
        'level_link': true,
        'unplugged_level': level.kind == 'unplugged'
      };
      classes2[status.status || 'not_tried'] = true;

      return (
          <div className={cs(classes1)} key={level.id}>
            <a className={cs(classes2)} href={href}>{level.title}</a>
          </div>
        );
    });
    return <div className="progress_container">{els}</div>;
  }
});
