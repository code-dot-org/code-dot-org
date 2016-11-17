import React from 'react';
import dom from '../dom';

import { hideOverlay } from '../redux/instructions';

import { connect } from 'react-redux';

// 1020 puts this halfway between the small footer (at 1000) and the
// video modal backdrop (at 1040)
export const Z_INDEX = 1020;

const visible_style = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  opacity: 0.4,
  backgroundColor: 'black',
  zIndex: Z_INDEX
};

const hidden_style = {
  display: 'none'
};

const Overlay = React.createClass({
  propTypes: {
    visible: React.PropTypes.bool,
    hide: React.PropTypes.func
  },

  componentDidMount() {
    var unbind = dom.addClickTouchEvent(document.body, function () {
      this.props.hide();
      unbind();
    }.bind(this));
  },

  render() {
    return (<div id="overlay" style={this.props.visible ? visible_style : hidden_style} />);
  },
});

export default connect(function propsFromStore(state) {
  return {
    visible: state.instructions.overlayVisible
  };
}, function propsFromDispatch(dispatch) {
  return {
    hide: function ()  {
      dispatch(hideOverlay());
    },
  };
})(Overlay);
