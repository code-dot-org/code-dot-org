var AbuseError = require('./abuse_error');
var SendToPhone = require('./send_to_phone');

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
    onClickExport: React.PropTypes.func.isRequired,
  },

  getInitialState: function () {
    return {
      showSendToPhone: false
    };
  },

  showSendToPhone: function (event) {
    this.setState({showSendToPhone: true });
    event.preventDefault();
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

    var horzPadding = {
      paddingLeft: 1,
      paddingRight: 1
    };

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

    var exportButton;
    if (this.props.appType === 'applab') {
      exportButton = (
        <a className="export-button" onClick={this.props.onClickExport}>
          Export project
        </a>
      );
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
          {/* Awkward that this is called continue-button, when text is
              close, but id is (unfortunately) used for styling */}
          <button
              id="continue-button"
              style={{float: 'right'}}
              onClick={this.props.onClickClose}>
            {this.props.closeText}
          </button>
          <div className="social-buttons">
            <a href={facebookShareUrl} target="_blank" onClick={this.props.onClickPopup.bind(this)} style={horzPadding}>
              <i className="fa fa-facebook"></i>
            </a>
            <a href={twitterShareUrl} target="_blank" onClick={this.props.onClickPopup.bind(this)} style={horzPadding}>
              <i className="fa fa-twitter"></i>
            </a>
            <a id="sharing-phone" href="" style={horzPadding} onClick={this.showSendToPhone}>
              <i className="fa fa-mobile-phone" style={{fontSize: 36}}></i>
            </a>
          </div>
          {exportButton}
          {sendToPhone}
        </div>
      </div>
    );
  }
});
module.exports = ShareDialogBody;
