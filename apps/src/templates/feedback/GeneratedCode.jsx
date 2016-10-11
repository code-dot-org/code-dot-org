/* eslint-disable react/no-danger */
var React = require('react');

var GeneratedCode = React.createClass({

  propTypes: {
    message: React.PropTypes.string.isRequired,
    code: React.PropTypes.string.isRequired,
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
