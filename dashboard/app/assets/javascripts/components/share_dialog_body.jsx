//= require ./abuse_error

window.dashboard = window.dashboard || {};

/**
 * The body of our share project dialog.
 */
window.dashboard.ShareDialogBody = (function (React) {
  return React.createClass({
    propTypes: {
      icon: React.PropTypes.string,
      title: React.PropTypes.string.isRequired,
      shareCopyLink: React.PropTypes.string.isRequired,
      shareUrl: React.PropTypes.string.isRequired,
      encodedShareUrl: React.PropTypes.string.isRequired,
      closeText: React.PropTypes.string.isRequired,
      isAbusive: React.PropTypes.bool.isRequired,
      abuseTos: React.PropTypes.string.isRequired,
      abuseContact: React.PropTypes.string.isRequired
    },

    render: function () {
      var image;
      var modalClass = 'modal-content';
      if (this.props.icon) {
        image = <img className="modal-image" src={this.props.icon}/>
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
        abuseContents = <window.dashboard.AbuseError
          i18n={{
            tos: this.props.abuseTos,
            contact_us: this.props.abuseContact
          }}
          className='alert-error'
          style={abuseStyle}
          textStyle={abuseTextStyle}/>;
      }

      return (
        <div>
          {image}
          <div id="project-share" className={modalClass}>
            <p className="dialog-title">{this.props.title}</p>
            {abuseContents}
            <p>{this.props.shareCopyLink}</p>
            {/*TODO: de-dup with apps code once JS common-core work is done.*/}
            <div>
              <input
                type="text"
                id="sharing-input"
                readOnly="true"
                value={this.props.shareUrl}
                style={{cursor: 'copy', width: 465}}/>
            </div>
            <button
                id="continue-button"
                style={{float: 'right'}}>
              {this.props.closeText}
            </button>
            <div className="social-buttons">
              <a href={facebookShareUrl} target="_blank" className="popup-window" style={horzPadding}>
                <i className="fa fa-facebook"></i>
              </a>
              <a href={twitterShareUrl} target="_blank" className="popup-window" style={horzPadding}>
                <i className="fa fa-twitter"></i>
              </a>
              <a id="sharing-phone" href="" style={horzPadding}>
                <i className="fa fa-mobile-phone" style={{fontSize: 28}}></i>
              </a>
            </div>
            <div id="send-to-phone" className="sharing" style={{display: 'none'}}>
              <label htmlFor="phone">Enter a US phone number:</label>
              <input type="text" id="phone" name="phone"></input>
              <button id="phone-submit">Send</button>
              <div id="phone-charges">
                A text message will be sent via <a href="http://twilio.com">Twilio</a>.
                Charges may apply to the recipient.
              </div>
            </div>
          </div>
        </div>
      );
    }
  });
})(React);
