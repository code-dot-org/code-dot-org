import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import library from './designElements/library';

export default class DesignToolboxElement extends React.Component {
  static propTypes = {
    imageUrl: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    elementType: PropTypes.string.isRequired,
    handleDragStart: PropTypes.func.isRequired
  };

  render() {
    const styles = {
      outerContainer: {
        // The icon images are 120px wide and depend on this width for scaling.
        width: 120,
        display: 'inline-block',
        textAlign: 'center',
        paddingBottom: 15
      },
      innerContainer: {
        textAlign: 'center',
        cursor: 'grab'
      },
      image: {
        marginBottom: 5
      }
    };

    return (
      <div style={styles.outerContainer}>
        <div
          style={styles.innerContainer}
          data-element-type={this.props.elementType}
          className="new-design-element"
        >
          <img
            src={this.props.imageUrl}
            className="design-element-image"
            style={styles.image}
          />
          <div>{this.props.desc}</div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.makeDraggable();
  }

  componentDidUpdate() {
    this.makeDraggable();
  }

  /**
   * Create a draggable item as we drag an item from the toolbox.
   */
  makeDraggable() {
    $(ReactDOM.findDOMNode(this))
      .find('.new-design-element')
      .draggable({
        // Create an item (without an id) for dragging that looks identical to the
        // element that will ultimately be dropped. Note, this item has no
        // containment, and doesn't snap to a grid as we drag (but does on drop)
        helper(event) {
          const elementType = this.getAttribute('data-element-type');
          if (elementType === library.ElementType.SCREEN) {
            return $(this).clone();
          }
          const element = library.createElement(elementType, 0, 0, true);
          element.style.position = 'static';

          const div = document.getElementById('designModeViz');
          const xScale = div.getBoundingClientRect().width / div.offsetWidth;
          const yScale = div.getBoundingClientRect().height / div.offsetHeight;

          const parent = $('<div/>').addClass('draggingParent');

          parent[0].style.transform = 'scale(' + xScale + ', ' + yScale + ')';
          parent[0].style.webkitTransform =
            'scale(' + xScale + ', ' + yScale + ')';
          parent[0].style.backgroundColor = 'transparent';

          // Have the cursor be in the center of the dragged item.
          // element.width/height() returns 0 for canvas (probably because it
          // hasn't actually been renderd yet)
          const elementWidth =
            $(element).width() || parseInt(element.getAttribute('width'), 10);
          const elementHeight =
            $(element).height() || parseInt(element.getAttribute('height'), 10);
          // phantom/FF seem to not have event.offsetY, so go calculate it
          const offsetY =
            event.offsetY || event.pageY - $(event.target).offset().top;
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
}
