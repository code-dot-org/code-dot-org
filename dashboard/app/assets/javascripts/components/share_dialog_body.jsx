//= require ./abuse_error

/* global React */

window.dashboard = window.dashboard || {};

/**
 * The body of our share project dialog.
 * Note: The only consumer of this calls renderToStaticMarkup, so any events
 * will be lost.
 */
window.dashboard.ShareDialogBody = (function (React) {
  var preventDefault = function(event) {
    event.preventDefault();
  };

  var select = function (event) {
    event.target.select();
  };

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
      abuseContact: React.PropTypes.string.isRequired,

      onClickPopup: React.PropTypes.func.isRequired,
      onClickClose: React.PropTypes.func.isRequired
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
                onClick={select}
                readOnly="true"
                value={this.props.shareUrl}
                style={{cursor: 'copy', width: 465}}/>
            </div>
            {/* TODO -rename button, since text is close */}
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
              <a id="sharing-phone" href="" style={horzPadding} onClick={preventDefault}>
                <i className="fa fa-mobile-phone" style={{fontSize: 36}}></i>
              </a>
            </div>
            <window.dashboard.SendToPhone/>
          </div>
        </div>
      );
    }
  });
})(React);
