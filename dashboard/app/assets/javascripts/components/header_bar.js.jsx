components.HeaderBar = React.createClass({
  getInitialState: function() {
    return { popped: false };
  },

  render: function() {
    var P = this.props || {};
    var state = this.state || {};

    var thisLevel = P.level || {};
    var progress = P.progress || {};
    var script = thisLevel.script || {};
    var stage = thisLevel.stage || {};
    var level = thisLevel.level || {};

    // Don't render the progress buttons unless we are initialized with a script
    if (!script)
      return;

    // This is a bit of a hack.  Level.level.id gets overwritten when blockly initializes, so it's been cached in another
    // location until we can fix that.
    var level_id = level.level_id;
    if (!level_id && level.level)
      level_id = level.level.id;

    // Title
    var titleBox;
    if (stage.title) {
      titleBox = <div className="header_text header_level_text">{stage.title}</div>;
    }

    // Finished link
    var finishLink;
    if (stage.finishText) {
      var href = Frame.linkTo({
        complete: stage.script_name
      });

      finishLink = (
          <div className="header_finished_link">
            <a href={href}>{stage.finishText}</a>
          </div>
      );
    }

    // Trophies
    var trophyLink;
    if (progress.trophies) {
      trophyLink = (
          <span className="header_trophy_link" onClick={this.onTrophyClick}>
            <div className="header_text">{dashboard.i18n.trophies}</div>
            <div className="header_status_bar current_trophies">{progress.trophies.current}</div>
            <div className="header_text max_trophies">{progress.trophies.of + ' ' + progress.trophies.max}</div>
          </span>
      );
    }

    // More less toggle
    var popupToggle;
    if (stage.script_stages > 1 || progress.trophies) {
      var arrow, label;

      if (state.popped) {
        arrow = <div className="header_popup_link_glyph">&#x25B2;</div>; // ▲
        label = dashboard.i18n.less;
      } else {
        arrow = <div className="header_popup_link_glyph">&#x25BC;</div>; // ▼
        label = dashboard.i18n.more;
      }

      popupToggle = (
          <span className="header_popup_link" onClick={this.onTogglePopup}>
                { arrow }
            <div className="header_popup_link_text">{label}</div>
          </span>
      );
    }

    // Popup stage navigation
    var headerPopup;
    if (state.popped)
      headerPopup = <components.HeaderPopup script_id={stage.script_id} progress={progress} selected={level_id} jumpToTrophies={state.jumpToTrophies} onShow={this.showPopup} />;

    return (
        <div>
          <div className="header_level">
            <div className="header_level_container">
              { titleBox }
              <components.ProgressBox stage={stage} selected={level_id} progress={progress} />
              { finishLink }
              { trophyLink }
              { popupToggle }
            </div>
          </div>
          { headerPopup }
        </div>
    );
  },

  componentDidUpdate: function() {
    if (this.state.popped) {
      // Catch clicks anywhere else and close the popup
      $(document).on('click', this.onModalClick);
    } else {
      $(document).off('click', this.onModalClick);
    }
  },

  getInitialState: function() {
    return {
      popped: false,
      jumpToTrophies: false
    };
  },

  // Three possible arguments: true, false, or "trophies" (the last one autoscrolls the page to the bottom of the popup)
  showPopup: function(show) {
    this.setState({
      popped: !!show,
      jumpToTrophies: show == 'trophies'
    });
  },

  onTrophyClick: function(ev) {
    this.showPopup("trophies");
    ev.stopPropagation();
  },
  onTogglePopup: function(ev) {
    this.showPopup(!this.state.popped);
    ev.stopPropagation();
  },

  onModalClick: function(ev) {
    var el;

    // Clicks outside the popup close it
    el = $(ev.target).closest('.header_popup, .header_popup_link');
    if (!el.length) {
      this.showPopup(false);
    }
  }
});
