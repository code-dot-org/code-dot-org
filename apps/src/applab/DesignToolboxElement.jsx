/* global $ */

var React = require('react');

module.exports = React.createClass({
  propTypes: {
    imageUrl: React.PropTypes.string.isRequired,
    desc: React.PropTypes.string.isRequired,
    elementType: React.PropTypes.string.isRequired,
    handleDragStart: React.PropTypes.func.isRequired
  },

  render: function() {
    var styles = {
      container: {
        // The icon images are 120px wide and depend on this width for scaling.
        width: 120,
        display: 'inline-block',
        textAlign: 'center',
        paddingBottom: 15
      },
      image: {
        marginBottom: 5
      }
    };
    return (
      <div style={styles.container}>
        <img src={this.props.imageUrl}
            data-element-type={this.props.elementType}
            className='new-design-element'
            style={styles.image}>
        </img>
        <div >{this.props.desc}</div>
      </div>
    );
  },

  componentDidMount: function () {
    this.makeDraggable();
  },

  componentDidUpdate: function () {
    this.makeDraggable();
  },

  makeDraggable: function () {
    $(this.getDOMNode()).find('.new-design-element').draggable({
      containment: '#codeApp',
      helper: 'clone',
      appendTo: '#codeApp',
      revert: 'invalid',
      zIndex: 2,
      start: this.props.handleDragStart
    });
  }
});