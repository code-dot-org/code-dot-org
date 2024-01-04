import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import {connect} from 'react-redux';

class VariableWatcher extends React.Component {
  static propTypes = {
    watchedExpressions: PropTypes.instanceOf(Immutable.List).isRequired,
  };

  renderAsString(value) {
    // Check for null or undefined
    if (value === null) {
      return String(value);
    }

    // Check for array
    if (Array.isArray(value)) {
      return `[${value.map(this.renderAsString).join(', ')}]`;
    }

    // Check for objects
    if (typeof value === 'object') {
      try {
        // Attempt to convert to JSON string
        return JSON.stringify(value);
      } catch (e) {
        return 'Unstringifiable object';
      }
    }

    // Check for functions
    if (typeof value === 'function') {
      return 'Function';
    }

    // Fallback to using toString() for other types
    return value.toString();
  }

  render() {
    if (this.props.watchedExpressions.isEmpty()) {
      return null;
    }

    return (
      <g>
        {this.props.watchedExpressions.map((wv, index) => {
          const variableName = wv.get('expression');
          const variableValue = wv.get('lastValue');
          return (
            <text
              key={wv.get('uuid')}
              x="10"
              y={40 * (index + 1)}
              fill="black"
              fontSize="32"
            >
              {`${variableName}: ${this.renderAsString(variableValue)}`}
            </text>
          );
        })}
      </g>
    );
  }
}

export default connect(
  state => ({
    debugWatch: !!state.pageConstants.showDebugWatch,
    watchedExpressions: state.watchedExpressions,
    appType: state.pageConstants.appType,
    isRunning: state.runState.isRunning,
  }),
  {},
  null,
  {forwardRef: true}
)(VariableWatcher);
