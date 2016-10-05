import React from 'react';
import Immutable from 'immutable';
import {connect} from 'react-redux';

/**
 * A "watchers" window for our debugger.
 */
const DebugWatch = React.createClass({
  propTypes: {
    debugButtons: React.PropTypes.bool,
    watchedExpressions: React.PropTypes.instanceOf(Immutable.List)
  },

  render() {
    let classes = 'debug-watch';
    return (
        <div id="debug-watch" className={classes}>
          <ul>
          {
              this.props.watchedExpressions.map(wv => <li key={wv.get('uuid')}>{wv.get('expression')}: {wv.get('lastValue')}</li>)
          }
          </ul>
        </div>
    );
  }
});

export default connect(state => {
  return {
    watchedExpressions: state.watchedExpressions,
  };
})(DebugWatch);

