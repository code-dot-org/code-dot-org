//= require ./share_dialog_body

window.dashboard = window.dashboard || {};

window.dashboard.ShareDialog = (function (React) {
  var ShareDialogBody = window.dashboard.ShareDialogBody;

  return React.createClass({
    propTypes: {
      i18n: React.PropTypes.object.isRequired,
      icon: React.PropTypes.string,
      title: React.PropTypes.string.isRequired,
      shareCopyLink: React.PropTypes.string.isRequired,
      shareUrl: React.PropTypes.string.isRequired,
      encodedShareUrl: React.PropTypes.string.isRequired,
      closeText: React.PropTypes.string.isRequired,
      isAbusive: React.PropTypes.bool.isRequired,
      abuseTos: React.PropTypes.string.isRequired,
      abuseContact: React.PropTypes.string.isRequired,
      onClickPopup: React.PropTypes.func.isRequired
    },

    getInitialState: function () {
      return {
        hidden: false
      };
    },

    componentWillReceiveProps: function (newProps) {
      this.setState({hidden: false});
    },

    componentDidMount: function () {
      this.refs.dialog.getDOMNode().focus();
    },

    componentDidUpdate: function () {
      if (!this.state.hidden) {
        this.refs.dialog.getDOMNode().focus();
      }
    },

    onKeyDown: function (event) {
      if (event.key === 'Escape') {
        this.closeDialog();
      }
    },

    closeDialog: function () {
      this.setState({hidden: true});
    },

    render: function () {
      if (this.state.hidden) {
        return <div/>;
      }

      // TODO - Can we now make SendToPhone completely Reactified?
      return (
        <div>
          <div className="modal-backdrop in" onClick={this.closeDialog}/>
          <div tabIndex="-1" className="modal dash_modal in" ref="dialog" onKeyDown={this.onKeyDown}>
            <div className="modal-body dash_modal_body">
              <div id="x-close" className="x-close" onClick={this.closeDialog}></div>
              {/* TODO - do we really want this as a separate component? maybe
                if that makes separating out dialog from body easier in general */}
              <ShareDialogBody
                i18n={this.props.i18n}
                icon={this.props.icon}
                title={this.props.title}
                shareCopyLink={this.props.shareCopyLink}
                shareUrl={this.props.shareUrl}
                encodedShareUrl={this.props.encodedShareUrl}
                closeText={this.props.closeText}
                isAbusive={this.props.isAbusive}
                abuseTos={this.props.abuseTos}
                abuseContact={this.props.abuseContact}
                onClickPopup={this.props.onClickPopup}
                onClickClose={this.closeDialog}
                />
            </div>
          </div>
        </div>
      );
    }
  });
})(React);
