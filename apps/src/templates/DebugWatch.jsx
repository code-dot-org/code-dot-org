import React from 'react';
import {connect} from 'react-redux';

/**
 * A "watchers" window for our debugger.
 */
const DebugWatch = React.createClass({
  propTypes: {
    debugButtons: React.PropTypes.bool,
    watchedExpresssions: React.PropTypes.array
  },

  render() {
    let classes = 'debug-watch';
    if (!this.props.debugButtons) {
      classes += 'no-commands';
    }
    return (
        <div id="debug-watch" className={classes}>
          {
              this.props.watchedExpresssions.map(wv => <span>{wv.value}</span>)
          }
        </div>
    );
  }
});

export default connect(state => {
  return {
    watchedExpresssions: state.watchedExpresssions,
  };
})(DebugWatch);

