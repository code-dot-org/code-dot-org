/* eslint-disable react/no-danger */
var React = require('react');
var msg = require('@cdo/locale');

var GeneratedCode = React.createClass({

  propTypes: {
    message: React.PropTypes.string.isRequired,
    code: React.PropTypes.string.isRequired,
  },

  render: function () {
    return (<div className="generated-code-container">
      <p className="generatedCodeMessage" dangerouslySetInnerHTML={{__html: this.props.message}} />
      <pre className="generatedCode" dangerouslySetInnerHTML={{ __html: this.props.code }} />
    </div>);
  }
});
module.exports = GeneratedCode;
