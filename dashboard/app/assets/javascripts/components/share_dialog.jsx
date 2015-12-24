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

    closeDialog: function () {
      // TODO - we want this setting state in parent dialog component
      console.log('close dialog');
    },

    render: function () {
      return (
        <div>
          <div className="modal-backdrop in"></div>
          <div tabindex="-1" className="modal dash_modal in" aria-hidden={false}>
            <div className="modal-body dash_modal_body">
              <div id="x-close" className="x-close" data-dismiss="modal">
              </div>
            </div>
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
      );
    }
  });
})(React);
