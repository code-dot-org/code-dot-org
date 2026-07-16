import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';

export default class GeneratedCode extends React.Component {
  static propTypes = {
    message: PropTypes.node,
    code: PropTypes.string.isRequired,
    style: PropTypes.object,
    codeStyle: PropTypes.object,
  };

  render() {
    return (
      <div className="generated-code-container" style={this.props.style}>
        {this.props.message && (
          <Typography variant="body2" component="p">
            {this.props.message}
          </Typography>
        )}

        {/* code container should be LTR even in RTL mode */}
        <pre className="generatedCode" dir="ltr" style={this.props.codeStyle}>
          {this.props.code}
        </pre>
      </div>
    );
  }
}
