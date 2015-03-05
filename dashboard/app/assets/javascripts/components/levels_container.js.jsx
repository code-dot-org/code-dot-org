// LevelContainer user={}
components.LevelContainer = React.createClass({
  getInitialState: function() {
    return { component: null };
  },

  render: function() {
    // If the level has loaded, display it
    if (this.state.component)
      return this.state.component;

    // Otherwise display the loader-progress
    return (
        <div id="appcontainer">
          <div className="loading" />
          <div className="slow_load">
            <div>{dashboard.i18n.slow_loading}</div>
            <a href="javascript: location.reload();">{dashboard.i18n.try_reloading}</a>
          </div>
        </div>
    );
  },

  componentDidMount: function() {
    var dom = this.getDOMNode();

    // Show the slow-loading warning if it takes more than 10 seconds to initialize
    setTimeout(function() {
      $(dom).find('.slow_load').show();
    }, 10000);

    // When the levelStore gets data, update blockly
    window.levelStore.subscribe(this.onNewLevel.bind(this));
  },

  onNewLevel: function(data) {
    var opts = data.level;

    // Create .scriptPath that's used for tracking metrics on a live URL
    opts.scriptPath = Frame.linkTo({
      script: data.stage.script_name,
      stage: data.stage.position,
      level: data.level.position
    }, true);
    opts.script_name = data.stage.script_name;
    opts.level.stage = data.stage.position;
    opts.level.stage_name = data.stage.name;

    // Determine which level component to render
    switch (opts.app) {
      case 'unplugged':
        this.setState({
          component: <components.UnpluggedLevel user={this.props.user} stage={data.stage} level={data.level} app={new UnpluggedApp(opts)} />
        });
        break;

      // TODO OFFLINE: Convert these level types
      case 'multi':
      case 'match':
        break;

      // BlocklyApp is not implemented as a React component so we have to do something a bit tricky
      case 'maze':
      case 'jigsaw':
      case 'bounce':
      case 'turtle':
      case 'flappy':
      case 'unplug':
      case 'studio':
      default:
        // Store this because level.id gets overwritten by the DIV id inside blockly somewhere
        opts.level_id = opts.level.id;

        // Set up some blockly options.  baseUrl must be an absolute path.
        opts.baseUrl = Frame.getAbsolutePath('/blockly/');

        // Render a blockly app on top of our DOM
        opts.containerId = this.getDOMNode().id;
        var app = new BlocklyApp(opts);
        app.startBlockly();
        break;
    }
  }
});
