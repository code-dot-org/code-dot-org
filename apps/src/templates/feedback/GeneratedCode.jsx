/* eslint-disable react/no-danger */
import React, {PropTypes} from 'react';

export default class GeneratedCode extends React.Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    style: PropTypes.object,
  };

  render() {
    return (
      <div className="generated-code-container" style={this.props.style}>
        <p
          className="generatedCodeMessage"
          dangerouslySetInnerHTML={{__html: this.props.message}}
        />

        {/* code container should be LTR even in RTL mode */}
        <pre
          className="generatedCode"
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: this.props.code }}
        />
      </div>
    );
  }
}
