/* global $ */

var React = require('react');
var library = require('./designElements/library');

module.exports = React.createClass({
  propTypes: {
    imageUrl: React.PropTypes.string.isRequired,
    desc: React.PropTypes.string.isRequired,
    elementType: React.PropTypes.string.isRequired,
    handleDragStart: React.PropTypes.func.isRequired
  },

  render: function() {
    var styles = {
      outerContainer: {
        // The icon images are 120px wide and depend on this width for scaling.
        width: 120,
        display: 'inline-block',
        textAlign: 'center',
        paddingBottom: 15
      },
      innerContainer: {
        textAlign: 'center'
      },
      image: {
        marginBottom: 5
      }
    };

    return (
      <div style={styles.outerContainer}>
        <div style={styles.innerContainer}
          data-element-type={this.props.elementType}
          className='new-design-element'>
          <img src={this.props.imageUrl}
              className='design-element-image'
              style={styles.image}>
          </img>
          <div >{this.props.desc}</div>
        </div>
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
      helper: function () {
        var elementType = this.getAttribute('data-element-type');
        if (elementType === library.ElementType.SCREEN) {
          return $(this).clone();
        }
        setTimeout(function () {
          console.log('can break here if you want');
        }, 1000);
        var element = library.createElement(elementType, 0, 0, true);
        element.style.position = 'static';

        var div = document.getElementById('divApplab');
        var xScale = div.getBoundingClientRect().width / div.offsetWidth;
        var yScale = div.getBoundingClientRect().height / div.offsetHeight;

        var parent = $('<div/>').addClass('draggingParent');

        parent[0].style.transform = "scale(" + xScale + ", " + yScale + ")";

        // TODO
        // Dragged elements have a white background whereas drop + drag is transparent
        // Radio button/checkbox/text are all offset from cursor
        // When dropping all elements, it actually gets dropped a few pixels off
        // from where it was when released

        return parent.append(element)[0];
      },
      appendTo: '#codeApp',
      revert: 'invalid',
      // Make sure the dragged element appears in front of #belowVisualization,
      // which has z-index 1.
      zIndex: 2,
      start: this.props.handleDragStart
    });
  }
});
