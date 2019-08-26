import React from "react";
import $ from 'jquery';
import 'jquery-ui/ui/effects/effect-drop';
import 'jquery-ui/ui/widgets/droppable';
import * as PropTypes from "react/lib/ReactPropTypes";
window.jQuery = $;
require('jquery-ui-touch-punch');

module.exports = class ImageRecognition extends React.Component {
  componentDidMount() {
    $(this.droppableDiv).droppable({
      classes: {
        "ui-droppable-active": "ui-state-active",
        "ui-droppable-hover": "ui-state-hover"
      },
      tolerance: "touch",
      drop: (event, ui) => {
        this.props.onDrop(ui.draggable.data('guid'));
      }
    });
  }

  render() {
    return (
      <div style={{display: 'block'}} ref={(element) => this.droppableDiv = element}>
        {this.props.children}
      </div>
    );
  }
};

module.exports.propTypes = {
  children: PropTypes.node,
  onDrop: PropTypes.func
};
