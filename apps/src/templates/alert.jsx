/* global $ */


/**
 * Simple boot-strapped style alert.
 */
module.exports = React.createClass({
  propTypes: {
    body: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ]).isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    onClose: React.PropTypes.func.isRequired
  },

  render: function () {
    var style = $.extend({}, {
      position: 'absolute',
      zIndex: 1000
    }, this.props.style);

    return (
      <div style={style}>
        <div className={"alert fade in " + (this.props.className || '')}>
          <button type="button"
            className="alert-button close"
            style={{ margin: 0 }}>
            <span onClick={this.props.onClose}>&times;</span>
          </button>
          {this.props.body}
        </div>
      </div>
    );
  }
});
