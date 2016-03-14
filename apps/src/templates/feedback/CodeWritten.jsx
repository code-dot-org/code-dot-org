var msg = require('../../locale');

var CodeWritten = React.createClass({
  
  propTypes: {
    numLinesWritten: React.PropTypes.number.isRequired,
    totalNumLinesWritten: React.PropTypes.number.isRequired,
  },

  render: function () {
    var lines, totalLines, showCode;

    lines = (<p id="num-lines-of-code" className="lines-of-code-message">
      {msg.numLinesOfCodeWritten({ numLines: this.props.numLinesWritten })}
    </p>);

    if (this.props.totalNumLinesWritten !== 0) {
      totalLines = (<p id="total-num-lines-of-code" className="lines-of-code-message">
        {msg.totalNumLinesOfCodeWritten({ numLines: this.props.totalNumLinesWritten })}
      </p>);
    }

    showCode = (<details className="show-code">
      <summary role="button">
        <b>{msg.showGeneratedCode()}</b>
      </summary>
      {this.props.children}
    </details>);

    return (<div>
      {lines}
      {totalLines}
      {showCode}
    </div>);
  }
});
module.exports = CodeWritten;
