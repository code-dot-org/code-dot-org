//= require ./share_dialog_body
//= require ./dialog

window.dashboard = window.dashboard || {};

/**
 * Share Dialog used by projects
 */
window.dashboard.ShareDialog = (function (React) {
  var Dialog = window.dashboard.Dialog;
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
      channelId: React.PropTypes.string.isRequired,
      appType: React.PropTypes.string.isRequired,
      onClickPopup: React.PropTypes.func.isRequired,
    },

    getInitialState: function () {
      return { isOpen: true };
    },

    componentWillReceiveProps: function (newProps) {
      this.setState({isOpen: true});
    },

    close: function () {
      this.setState({isOpen: false});
    },

    render: function () {
      // TODO - Can we now make SendToPhone completely Reactified?
      return (
        <Dialog isOpen={this.state.isOpen} handleClose={this.close}>
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
            channelId={this.props.channelId}
            appType={this.props.appType}
            onClickPopup={this.props.onClickPopup}
            onClickClose={this.close}
            />
        </Dialog>
      );
    }
  });
})(React);
