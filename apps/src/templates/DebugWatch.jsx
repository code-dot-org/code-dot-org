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

  // http://stackoverflow.com/a/7390612
  nonValueDescriptor(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
  },

  /**
   * Gets text to display for given value
   * @param obj
   * @returns {*}
   */
  renderValue(obj) {
    const descriptor = this.nonValueDescriptor(obj);
    const isError = obj instanceof Error;

    if (isError) {
      return <span
        className="watch-value watch-unavailable">{i18n.debugWatchNotAvailable()}</span>;
    }

    switch(descriptor) {
      case 'null':
      case 'undefined':
        return <span className="watch-value">{descriptor}</span>;
      case 'regexp':
        return <span className="watch-value">[regexp]</span>;
      case 'function':
        // [function MyFunctionName]
        return <span className="watch-value">{`[${obj.toString().match(/(.*)\(/)[1]}]`}</span>;
      default:
        return <span className="watch-value">{obj.toString()}</span>;
    }
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
                  <div className="debug-watch-item" key={wv.get('uuid')}>
                    <span
                        className="watch-variable">{varName}</span>
                    <span
                        className="watch-separator">: </span>
                    {this.renderValue(varValue)}
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

