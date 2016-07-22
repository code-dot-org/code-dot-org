import React from 'react';

const styles = {
  main: {
    // The outer container gets sized at either 50px or 80px depending on
    // whether or not we have authored hints. In both cases, we want to display
    // this icon at 50px.
    maxWidth: 50
  }
};

/**
 * Simple component for our icon for hints.
 */
const PromptIcon = React.createClass({
  propTypes: {
    src: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <img
        src={this.props.src}
        id="prompt-icon"
        style={styles.main}
      />
    );
  }
});

export default PromptIcon;
