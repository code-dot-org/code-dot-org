import PropTypes from 'prop-types';
import React from 'react';
import Lightbulb from './Lightbulb';

import {connect} from 'react-redux';

class HintDisplayLightbulb extends React.Component {
  static propTypes = {
    unseenHints: PropTypes.arrayOf(PropTypes.object),
    isMinecraft: PropTypes.bool
  };

  state = {
    shouldAnimate: false
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const receivingNewHints = nextProps.unseenHints.length > this.getCount();
    this.setState({
      shouldAnimate: receivingNewHints
    });
  }

  getCount() {
    return this.props.unseenHints.length;
  }

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
  }
}

export default connect(function propsFromStore(state) {
  return {
    isMinecraft: !!state.pageConstants.isMinecraft,
    unseenHints: state.authoredHints.unseenHints
  };
})(HintDisplayLightbulb);
