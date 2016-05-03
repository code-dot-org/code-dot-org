/**
 * A duplicate button that helps replicate elements
 */
var DuplicateElementButton = React.createClass({
  propTypes: {
    handleDuplicate: React.PropTypes.func.isRequired
  },

  handleDuplicate: function (event) {
    this.props.handleDuplicate();
  },

  render: function () {
    var buttonStyle = {
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '14px',
    };

    var duplicateButtonStyle = $.extend({}, buttonStyle, {
      backgroundColor: '#0aa',
      color: 'white'
    });

    return (
      <div style={{marginLeft: 15}}>
        <button
        style={duplicateButtonStyle}
        onClick={this.handleDuplicate}>
        Duplicate
      </button>
    </div>
    );
  }
});

module.exports = DuplicateElementButton;
