import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import {connect} from 'react-redux';

// TODO: Delete
class VariableDisplay extends React.Component {
  static propTypes = {
    watchedExpressions: PropTypes.instanceOf(Immutable.List).isRequired,
  };

  renderAsString(value) {
    // Check for null or undefined
    if (value === null || value === undefined) {
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
          const yPos = 40 * (index + 1);

          return (
            <React.Fragment key={wv.get('uuid')}>
              {/* Black oval/ellipse background */}
              <ellipse
                cx="100" // Center x position
                cy={yPos} // Center y position, aligning with text
                rx="150" // Horizontal radius (half the width of the oval)
                ry="48" // Vertical radius (half the height of the oval)
                fill="black"
              />

              <text
                x="10"
                y={yPos}
                fill="white"
                fontSize="32"
                dominantBaseline="middle" // Vertically center text
                textAnchor="start" // Start text at x position
              >
                {`${variableName}: ${this.renderAsString(variableValue)}`}
              </text>
            </React.Fragment>
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
)(VariableDisplay);
