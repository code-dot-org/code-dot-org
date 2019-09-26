import React from 'react';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import * as PropTypes from 'react/lib/ReactPropTypes';
window.jQuery = $;
require('jquery-ui-touch-punch');

module.exports = class ImageRecognition extends React.Component {
  componentDidMount() {
    $(this.draggableDiv).draggable({revert: true});
  }

  render() {
    return (
      <div
        data-guid={this.props.guid}
        style={{display: 'inline-block', cursor: 'pointer'}}
        ref={element => (this.draggableDiv = element)}
      >
        {this.props.children}
      </div>
    );
  }
};

module.exports.propTypes = {
  children: PropTypes.node,
  guid: PropTypes.string
};
