components.HeaderActions = React.createClass({
  render: function() {
    var cs = React.addons.classSet;
    var P = this.props;
    var level = P.level || {};

    var actions = [];
    if (level.actions) {
      for (var i = 0; i < level.actions.length; i++) {
        var action = level.actions[i];

        var classes = {
          'fa': true
        };
        classes[action.icon] = true;

        actions.push(
            <a key={action.icon} className="header_status_bar level_free_play" title={action.label} href={Frame.linkTo(action.link)}>
              <i className={cs(classes)} />
            </a>
        );
      }

      actions = (
          <span className="header_actions freeplay_links">
            {actions}
          </span>
      );
    }

    return (
        <div>
          { actions }
          <components.SignInButton user={P.user} />
        </div>
    );

  },

  componentDidUpdate: function() {
    // Register the QTIP for any header actions we created
    $('.header_actions > a').qtip({
      content: {
        attr: 'title'
      },
      position: {
        my: 'top center',
        at: 'bottom center'
      }
    });
  }
});
