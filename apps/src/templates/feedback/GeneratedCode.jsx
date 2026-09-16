import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';

export default class GeneratedCode extends React.Component {
  static propTypes = {
    message: PropTypes.node,
    code: PropTypes.string.isRequired,
    style: PropTypes.object,
  };

  render() {
    return (
      <div className="generated-code-container" style={this.props.style}>
        {this.props.message && (
          <div className="generatedCodeMessage">
            <Typography variant="body3" component="p">
              {this.props.message}
            </Typography>
          </div>
        )}

        {/* code container should be LTR even in RTL mode */}
        <pre className="generatedCode" dir="ltr">
          {this.props.code}
        </pre>
      </div>
    );
  }
}
