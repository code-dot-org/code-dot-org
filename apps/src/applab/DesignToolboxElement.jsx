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
      // containment: '#codeApp',
      helper: function () {
        // we want to set containment at time of first drag, in case we've been
        // resized
        // var contain = [
        //   $("#visualization").offset().left, $("#visualization").offset().top,
        //   $("#design-toolbox").offset().left + $("#design-toolbox").width(),
        //   $("#visualization").offset().top + $("#visualization").height()
        // ];
        // console.log(contain);
        // $(this).draggable('option', 'containment', contain);

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

        // parent[0].style.transform = "scale(" + xScale + ", " + yScale + ")";
        parent[0].style.backgroundColor = 'transparent';

        // TODO
        // When dropping all elements, it actually gets dropped a few pixels off
        // from where it was when released

        // element.width/height() returns 0 for canvas (probably because it
        // hasn't actually been renderd yet)
        var elementWidth = $(element).width() ||
          parseInt(element.getAttribute('width'), 10);
        var elementHeight = $(element).height() ||
          parseInt(element.getAttribute('height'), 10);
        $(this).draggable('option', 'cursorAt', {
          left: elementWidth / 2,
          top: Math.min(event.offsetY, elementHeight)
        });

        // console.log('cursorAt: ' + (elementWidth / 2) + ', ' +
        //   Math.min(event.offsetY, element.height));
        console.log(event.offsetY, elementHeight);

        return parent.append(element)[0];
      },
      // drag: function (event, ui) {
      //   var GRID_SIZE = 5;
      //   // draggables are not compatible with CSS transform-scale,
      //   // so adjust the position in various ways here.
      //
      //   // dragging
      //   var div = document.getElementById('divApplab');
      //   var xScale = div.getBoundingClientRect().width / div.offsetWidth;
      //   var yScale = div.getBoundingClientRect().height / div.offsetHeight;
      //   var changeLeft = ui.position.left - ui.originalPosition.left;
      //   var newLeft  = (ui.originalPosition.left + changeLeft) / xScale;
      //   var changeTop = ui.position.top - ui.originalPosition.top;
      //   var newTop = (ui.originalPosition.top + changeTop) / yScale;
      //
      //   // snap top-left corner to nearest location in the grid
      //   newLeft -= (newLeft + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;
      //   newTop -= (newTop + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;
      //
      //   ui.position.left = newLeft;
      //   ui.position.top = newTop;
      //
      //   ui.helper.css({
      //     top: newTop,
      //     left: newLeft
      //   });
      // },
      appendTo: '#codeApp',
      revert: 'invalid',
      // Make sure the dragged element appears in front of #belowVisualization,
      // which has z-index 1.
      zIndex: 2,
      start: this.props.handleDragStart
    });
  }
});
