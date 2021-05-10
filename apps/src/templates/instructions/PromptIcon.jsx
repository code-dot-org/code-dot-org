import PropTypes from 'prop-types';
import React from 'react';

/**
 * Simple component for our icon for hints.
 */
export default class PromptIcon extends React.Component {
  static propTypes = {
    src: PropTypes.string.isRequired
  };

  render() {
    return <img src={this.props.src} id="prompt-icon" style={styles.main} />;
  }
}

const styles = {
  main: {
    // The outer container gets sized at either 50px or 80px depending on
    // whether or not we have authored hints. In both cases, we want to display
    // this icon at 50px.
    maxWidth: 50
  }
};
