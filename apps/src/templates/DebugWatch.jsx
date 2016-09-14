import React from 'react';

/**
 * A "watchers" window for our debugger.
 */
const DebugWatch = React.createClass({
  propTypes: {
    debugButtons: React.PropTypes.bool
  },

  render() {
    let classes = 'debug-watch';
    if (!this.props.debugButtons) {
      classes += 'no-commands';
    }
    return (
        <div id="debug-watch" className={classes}/>
    );
  }
});

export default DebugWatch;
