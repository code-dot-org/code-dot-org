import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Lightbulb from './Lightbulb';

import { connect } from 'react-redux';

const HintDisplayLightbulb = createReactClass({
  propTypes: {
    unseenHints: PropTypes.arrayOf(PropTypes.object),
    isMinecraft: PropTypes.bool
  },

  getInitialState() {
    return {
      shouldAnimate: false
    };
  },

  getCount() {
    return this.props.unseenHints.length;
  },

  componentWillReceiveProps(nextProps) {
    const receivingNewHints = nextProps.unseenHints.length > this.getCount();
    this.setState({
      shouldAnimate: receivingNewHints
    });
  },

  render() {
    return (
      <div id="lightbulb">
        <Lightbulb
          count={this.getCount()}
          isMinecraft={this.props.isMinecraft}
          lit={this.getCount() > 0}
          shouldAnimate={this.state.shouldAnimate}
        />
      </div>
    );
  },
});

export default connect(function propsFromStore(state) {
  return {
    isMinecraft: !!state.pageConstants.isMinecraft,
    unseenHints: state.authoredHints.unseenHints
  };
})(HintDisplayLightbulb);
