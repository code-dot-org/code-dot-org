window.dashboard = window.dashboard || {};

window.dashboard.AbuseError = (function (React) {

  return React.createClass({
    propTypes: {
      i18n: React.PropTypes.shape({
        abuse: React.PropTypes.shape({
          tos: React.PropTypes.string.isRequired,
          contact_us: React.PropTypes.string.isRequired
        }).isRequired
      }).isRequired,
      className: React.PropTypes.string,
      style: React.PropTypes.object,
      textStyle: React.PropTypes.object
    },
    render: function () {
      return (
        <div className={this.props.className} style={this.props.style}>
          <p style={this.props.textStyle}
              dangerouslySetInnerHTML={{__html: this.props.i18n.abuse.tos}}>
          </p>
          <p style={this.props.textStyle}
            dangerouslySetInnerHTML={{__html: this.props.i18n.abuse.contact_us}}>
          </p>
        </div>
      );
    }
  });
})(React);
