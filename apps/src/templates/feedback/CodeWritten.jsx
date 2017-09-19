import Radium from 'radium';
import React, {PropTypes} from 'react';
import msg from '@cdo/locale';

const styles = {
  summary: {
    fontSize: 18,
    lineHeight: '20px',
    fontWeight: 'normal',
    outline: 'none',
    padding: 5,
  },
  challengeLineCounts: {
    fontSize: 16,
  },
  challengeSummary: {
    fontColor: 'black',
    fontSize: 14,
    marginLeft: 40,
  },
  details: {
    textAlign: 'left',
  },
};

export default Radium(React.createClass({

  propTypes: {
    numLinesWritten: PropTypes.number.isRequired,
    totalNumLinesWritten: PropTypes.number.isRequired,
    children: PropTypes.node,
    useChallengeStyles: PropTypes.bool,
  },

  render() {
    const lines = (
      <p
        id="num-lines-of-code"
        className="lines-of-code-message"
        style={this.props.useChallengeStyles ? styles.challengeLineCounts : null}
      >
        {msg.numLinesOfCodeWritten({ numLines: this.props.numLinesWritten })}
      </p>);

    let totalLines;
    if (this.props.totalNumLinesWritten !== 0) {
      totalLines = (
      <p
        id="total-num-lines-of-code"
        className="lines-of-code-message"
        style={this.props.useChallengeStyles ? styles.challengeLineCounts : null}
      >
        {msg.totalNumLinesOfCodeWritten({ numLines: this.props.totalNumLinesWritten })}
      </p>);
    }

    const showCode = (
      <details
        className="show-code"
        style={this.props.useChallengeStyles ? styles.details : null}
      >
        <summary
          role="button"
          style={{
            ...styles.summary,
            ...(this.props.useChallengeStyles ? styles.challengeSummary : {})
          }}
        >
          <b>{msg.showGeneratedCode()}</b>
        </summary>
        {this.props.children}
      </details>);

    return (
      <div>
        {lines}
        {totalLines}
        {showCode}
      </div>
    );
  }
}));
