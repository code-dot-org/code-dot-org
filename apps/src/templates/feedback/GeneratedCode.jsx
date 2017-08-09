/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

var GeneratedCode = createReactClass({

  propTypes: {
    message: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
  },

  render: function () {
    return (<div className="generated-code-container">
      <p className="generatedCodeMessage" dangerouslySetInnerHTML={{__html: this.props.message}} />

      {/* code container should be LTR even in RTL mode */}
      <pre className="generatedCode" dir="ltr" dangerouslySetInnerHTML={{ __html: this.props.code }} />
    </div>);
  }
});
module.exports = GeneratedCode;
