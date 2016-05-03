var AbuseError = require('./abuse_error');
var SendToPhone = require('./send_to_phone');
var AdvancedShareOptions = require('./AdvancedShareOptions');

/* global React */

var select = function (event) {
  event.target.select();
};

/**
 * The body of our share project dialog.
 * Note: The only consumer of this calls renderToStaticMarkup, so any events
 * will be lost.
 */
var ShareDialogBody = React.createClass({
  propTypes: {
    icon: React.PropTypes.string,
    title: React.PropTypes.string.isRequired,
    shareCopyLink: React.PropTypes.string.isRequired,
    shareUrl: React.PropTypes.string.isRequired,
    encodedShareUrl: React.PropTypes.string.isRequired,
    closeText: React.PropTypes.string.isRequired,
    isAbusive: React.PropTypes.bool.isRequired,
    abuseTos: React.PropTypes.string.isRequired,
    abuseContact: React.PropTypes.string.isRequired,

    // Used by SendToPhone
    channelId: React.PropTypes.string.isRequired,
    appType: React.PropTypes.string.isRequired,

    onClickPopup: React.PropTypes.func.isRequired,
    onClickClose: React.PropTypes.func.isRequired,
    onClickExport: React.PropTypes.func,
  },

  getInitialState: function () {
    return {
      showSendToPhone: false,
      exporting: false,
      exportError: null,
    };
  },

  showSendToPhone: function (event) {
    this.setState({showSendToPhone: true });
    event.preventDefault();
  },

  clickExport: function () {
    this.setState({exporting: true});
    this.props.onClickExport().then(
      this.setState.bind(this, {exporting: false}),
      function () {
        this.setState({
          exporting: false,
          exportError: 'Failed to export project. Please try again later.'
        });
      }.bind(this)
    );
  },

  render: function () {
    var image;
    var modalClass = 'modal-content';
    if (this.props.icon) {
      image = <img className="modal-image" src={this.props.icon}/>;
    } else {
      modalClass += ' no-modal-icon';
    }

    var facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + this.props.encodedShareUrl;
    var twitterShareUrl = "https://twitter.com/intent/tweet?url=" + this.props.encodedShareUrl +
      "&amp;text=Check%20out%20what%20I%20made%20@codeorg&amp;hashtags=HourOfCode&amp;related=codeorg";

    var abuseStyle = {
      border: '1px solid',
      borderRadius: 10,
      padding: 10,
      marginBottom: 20
    };

    var abuseTextStyle = {
      color: '#b94a48',
      fontSize: 14
    };

    var abuseContents;
    if (this.props.isAbusive) {
      abuseContents = <AbuseError
        i18n={{
          tos: this.props.abuseTos,
          contact_us: this.props.abuseContact
        }}
        className='alert-error'
        style={abuseStyle}
        textStyle={abuseTextStyle}/>;
    }

    var sendToPhone;
    if (this.state.showSendToPhone) {
      sendToPhone = <SendToPhone
        channelId={this.props.channelId}
        appType={this.props.appType}/>;
    }

    var advancedOptions;
    if (this.props.appType === 'applab') {
      advancedOptions = <AdvancedShareOptions onClickExport={this.props.onClickExport} />;
    }

    return (
      <div>
        {image}
        <div id="project-share" className={modalClass}>
          <p className="dialog-title">{this.props.title}</p>
          {abuseContents}
          <p>{this.props.shareCopyLink}</p>
          <div>
            <input
              type="text"
              id="sharing-input"
              onClick={select}
              readOnly="true"
              value={this.props.shareUrl}
              style={{cursor: 'copy', width: 465}}/>
          </div>
          <div className="social-buttons">
            <a id="sharing-phone" href="" onClick={this.showSendToPhone}>
              <i className="fa fa-mobile-phone" style={{fontSize: 36}}></i>
              <span>Send to phone</span>
            </a>
            <a href={facebookShareUrl}
               target="_blank"
               onClick={this.props.onClickPopup.bind(this)}>
              <i className="fa fa-facebook"></i>
            </a>
            <a href={twitterShareUrl} target="_blank" onClick={this.props.onClickPopup.bind(this)}>
              <i className="fa fa-twitter"></i>
            </a>
          </div>
          {advancedOptions}
          {/* Awkward that this is called continue-button, when text is
              close, but id is (unfortunately) used for styling */}
          <button
              id="continue-button"
              style={{position: 'absolute', right: 0, bottom: 10}}
              onClick={this.props.onClickClose}>
            {this.props.closeText}
          </button>

          {sendToPhone}
        </div>
      </div>
    );
  }
});
module.exports = ShareDialogBody;
