window.dashboard = window.dashboard || {};

window.dashboard.ExclamationBox = (function (React) {

  return React.createClass({
    propTypes: {
      children: React.PropTypes.node.isRequired,
      className: React.PropTypes.string,
      style: React.PropTypes.string
    },
    render: function () {
      var className = "exclamation-box " + this.props.className;

      var cyan = '#0094ca';
      var style = $.extend({}, {
        backgroundColor: cyan,
        color: 'white',
        maxWidth: 600,
        margin: '0 auto',
        marginTop: 20,
        borderRadius: 15
      }, this.props.style);

      var circleStyle = {
        width: 100,
        height: 100,
        background: 'gold',
        borderRadius: 50,
        MozBorderRadius: 50,
        WebkitBorderRadius: 50,
        margin: 20,
        position: 'relative'
      };

      var exclamationStyle = {
        fontSize: 80,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };


      var bodyStyle = {
        paddingLeft: 0,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 20
      };

      return (
        <table className={className} style={style}>
          <tr>
            <td>
              <div style={circleStyle}>
                <div style={exclamationStyle}>!</div>
              </div>
            </td>
            <td style={bodyStyle}>
              {this.props.children}
            </td>
          </tr>
        </table>
      );
    }
  });
})(React);
