/* global $ */

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

  /**
   * Create a draggable item as we drag an item from the toolbox.
   */
  makeDraggable: function () {
    $(ReactDOM.findDOMNode(this)).find('.new-design-element').draggable({
      // Create an item (without an id) for dragging that looks identical to the
      // element that will ultimately be dropped. Note, this item has no
      // containment, and doesn't snap to a grid as we drag (but does on drop)
      helper: function (event) {
        var elementType = this.getAttribute('data-element-type');
        if (elementType === library.ElementType.SCREEN) {
          return $(this).clone();
        }
        var element = library.createElement(elementType, 0, 0, true);
        element.style.position = 'static';

        var div = document.getElementById('designModeViz');
        var xScale = div.getBoundingClientRect().width / div.offsetWidth;
        var yScale = div.getBoundingClientRect().height / div.offsetHeight;

        var parent = $('<div/>').addClass('draggingParent');

        parent[0].style.transform = "scale(" + xScale + ", " + yScale + ")";
        parent[0].style.webkitTransform = "scale(" + xScale + ", " + yScale + ")";
        parent[0].style.backgroundColor = 'transparent';

        // Have the cursor be in the center of the dragged item.
        // element.width/height() returns 0 for canvas (probably because it
        // hasn't actually been renderd yet)
        var elementWidth = $(element).width() ||
          parseInt(element.getAttribute('width'), 10);
        var elementHeight = $(element).height() ||
          parseInt(element.getAttribute('height'), 10);
        // phantom/FF seem to not have event.offsetY, so go calculate it
        var offsetY = (event.offsetY || event.pageY - $(event.target).offset().top);
        $(this).draggable('option', 'cursorAt', {
          left: elementWidth / 2,
          top: Math.min(offsetY, elementHeight)
        });

        return parent.append(element)[0];
      },
      containment: 'document',
      appendTo: '#codeApp',
      revert: 'invalid',
      // Make sure the dragged element appears in front of #belowVisualization,
      // which has z-index 1.
      zIndex: 2,
      start: this.props.handleDragStart
    });
  }
});
