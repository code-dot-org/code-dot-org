import PropTypes from 'prop-types';
import React from 'react';

import SafeMarkdown from '../SafeMarkdown';

export default class GeneratedCode extends React.Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    style: PropTypes.object,
    codeStyle: PropTypes.object,
  };

  render() {
    return (
      <div className="generated-code-container" style={this.props.style}>
        <div className="generatedCodeMessage">
          <SafeMarkdown markdown={this.props.message} />
        </div>

        {/* code container should be LTR even in RTL mode */}
        <pre className="generatedCode" dir="ltr" style={this.props.codeStyle}>
          {this.props.code}
        </pre>
      </div>
    );
  }
}
