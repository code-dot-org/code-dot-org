// HeaderPopup: script="" progress={} selected=id onShow=fn
// + scriptStore
components.HeaderPopup = React.createClass({
  getInitialState: function() {
    return {
      jumpToTrophies: this.props.jumpToTrophies  // props is the initial state
    };
  },

  componentDidMount: function() {
    window.scriptStore.subscribe(TEMP_UPDATE.bind(this));
    window.userInfoStore.subscribe(TEMP_UPDATE.bind(this));

    // Ask the script store to load a particular script.
    window.scriptStore.load({
      script_id: this.props.script_id
    });
  },

  render: function() {
    var cs = React.addons.classSet;
    var P = this.props || {};

    var progress = P.progress || {};
    var levelProgress = progress.levels || {};
    var script = window.scriptStore.value;
    var user = window.userInfoStore.value || {};

    var body;
    if (!script) {
      body = <div className="loading" />;
    } else {

      var stages = $.map(script.stages || [], function(stage) {
        var lessonPlan;

        if (stage.lesson_plan_html_url && user.teacher) {
          lessonPlan = (
              <div className="stage-lesson-plan-link">
                <a href={stage.lesson_plan_html_url}>{dashboard.i18n.view_lesson_plan}</a>
              </div>
          );
        }

        var levels = $.map(stage.levels, function(level, index) {
          var status = levelProgress[level.id] || {};

          var href = Frame.linkTo({
            script: script.name,
            stage: stage.position,
            level: level.position
          });

          if (level.kind == 'unplugged') {
            contents = <span className="puzzle-named">{level.title}</span>;
          } else if (status.status == 'perfect' || status.status == 'perfect') {
            contents = <img src={Frame.assetUrl('white-checkmark.png')} />;
          } else {
            contents = <span className="puzzle-number">{level.title}</span>;
          }

          var classes1 = {
            'puzzle_outer_level': true,
            'puzzle_outer_assessment': level.kind == 'assessment',
            'puzzle_outer_current': level.id == P.selected,
            'last': index === stage.levels.length - 1
          };

          var classes2 = {
            'level_link': true
          };
          classes2[status.status || 'not_tried'] = true;

          return (
              <div className="level" key={level.position}>
                <span className={cs(classes1)}>
                  <a className={cs(classes2)} href={href}>
                    { contents }
                  </a>
                </span>
              </div>
          );
        });

        return (
            <div className="game-group" key={stage.position}>
              <div className="stage">
                <span>{stage.title}</span>
                { lessonPlan }
              </div>
              <div className="games">
                { levels }
              </div>
            </div>
        );
      });

      var stages_key;
      if (stages.length)
        stages_key = <components.HeaderPopupKey />;

      var trophies;
      if (script.trophies) {
        var trophy_progress = P.progress.trophies || {};

        var centered = { textAlign: 'center' };
        trophy_progress = $.map(script.trophies, function(trophy) {

          var completion = trophy_progress[trophy.id];
          if (!completion)
            completion = 0;

          var bronze = Math.max(0, Math.min(100, Math.floor( completion * 10.0 / trophy.bronze) * 10));
          var silver = Math.max(0, Math.min(100, Math.floor( (completion - trophy.bronze) * 10.0 / (trophy.silver - trophy.bronze)) * 10));
          var gold = Math.max(0, Math.min(100, Math.floor( (completion - trophy.silver) * 10.0 / (trophy.gold - trophy.silver)) * 10));

          return (
              <tr height="55px">
                <td width="100px">
                  { trophy.name }
                </td>
                <td style={centered} width="55px">
                  <img className="trophy_image" src={Frame.assetUrl('bronze_', bronze, '.png')} />
                </td>
                <td style={centered} width="55px">
                  <img className="trophy_image" src={Frame.assetUrl('silver_', silver, '.png')} />
                </td>
                <td style={centered} width="55px">
                  <img className="trophy_image" src={Frame.assetUrl('gold_', gold, '.png')} />
                </td>
              </tr>
          );
        });

        var blocked = {
          display: 'inline-block',
          width: 290,
          position: 'relative',
          overflow: 'hidden',
          padding: 10
        };
        trophies = (
            <div id="trophies">
              <div style={blocked}>
                <h4>{dashboard.i18n.nav.popup.mastery}</h4>
                <table style={{ maxWidth: 290 }}>
                  {trophy_progress}
                </table>
              </div>
            </div>
        );
      }

      body = (
          <div className="user-stats-block">
            { stages }
            { stages_key }
            { trophies }
          </div>
      );
    }

    var style = {
      'float': 'right'
    };

    return (
        <div className="header_popup">
          <div className="header_popup_header">
            <span>{dashboard.i18n.nav.popup.progress}</span>
            <div className="header_text" style={style}>{progress.linesOfCodeText}</div>
          </div>
          <div className="header_popup_body">
            {body}
          </div>
          <div className="header_popup_footer">
            <div className="header_popup_close" onClick={this.handleClose}>{dashboard.i18n.nav.popup.close}</div>
          </div>
        </div>
    );
  },

  componentDidUpdate: function() {
    if (this.state.jumpToTrophies) {
      var el = $('#trophies');
      if (el.length) {
        var off = el.offset();
        if (off)
          window.scrollTo(0, +off.top);
        this.setState({ jumpToTrophies: false });
      }
    }
  },

  handleClose: function(ev) {
    this.props.onShow(false);
  }
});
