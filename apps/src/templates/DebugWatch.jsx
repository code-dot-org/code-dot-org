import React from 'react';
import Immutable from 'immutable';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';

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
          {
              this.props.watchedExpressions.map(wv => {
                  const varName = wv.get('expression');
                  const varValue = wv.get('lastValue');
                  return (
                  <div className="watch-expression" key={wv.get('uuid')}>
                    <span
                        className="watch-variable">{varName}</span>
                    <span
                        className="watch-separator">: </span>
                    {varValue instanceof Error &&
                    <span
                        className="watch-value watch-unavailable">{i18n.debugWatchNotAvailable()}</span>
                        }
                    {(!varValue instanceof Error) &&
                    <span className="watch-value">{varValue}</span>
                        }
                  </div>
                      );
                  })
              }
        </div>
    );
  }
});

export default connect(state => {
  return {
    watchedExpressions: state.watchedExpressions,
  };
})(DebugWatch);

