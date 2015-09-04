//= require ./abuse_error
//= require ./exclamation_box

window.dashboard = window.dashboard || {};

window.dashboard.AbuseBox = (function (React) {

  var AbuseError = window.dashboard.AbuseError;
  var ExclamationBox = window.dashboard.ExclamationBox;

  return React.createClass({
    propTypes: {
      i18n: React.PropTypes.shape({
        tos: React.PropTypes.string.isRequired,
        contact_us: React.PropTypes.string.isRequired,
        edit_project: React.PropTypes.string.isRequired,
        go_to_code_studio: React.PropTypes.string.isRequired
      }).isRequired,
      isOwner: React.PropTypes.bool.isRequired
    },
    render: function () {
      var textStyle = {
        fontSize: 18,
        lineHeight: '24px',
        padding: 5
      };

      var finalLink, finalLinkText;
      if (this.props.isOwner) {
        finalLink = 'edit';
        finalLinkText = this.props.i18n.edit_project
      } else {
        finalLink = 'https:/studio.code.org';
        finalLinkText = this.props.i18n.go_to_code_studio;
      }

      // TODO - may make sense to combine this with exclamation box?
      return (
        <ExclamationBox>
          <AbuseError
              i18n={this.props.i18n}
              className="exclamation-abuse"
              textStyle={textStyle}/>
          <p className="exclamation-abuse" style={textStyle}>
            <a href={finalLink}>{finalLinkText}</a>
          </p>
        </ExclamationBox>
      );
    }
  });
})(React);
