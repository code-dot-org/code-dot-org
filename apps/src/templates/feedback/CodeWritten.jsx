import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import msg from '@cdo/locale';
import trackEvent from '../../util/trackEvent';

class CodeWritten extends React.Component {
  static propTypes = {
    numLinesWritten: PropTypes.number.isRequired,
    children: PropTypes.node,
    useChallengeStyles: PropTypes.bool
  };

  render() {
    const {numLinesWritten, children, useChallengeStyles} = this.props;
    const lines = (
      <p
        id="num-lines-of-code"
        className="lines-of-code-message"
        style={useChallengeStyles ? styles.challengeLineCounts : null}
      >
        {msg.numLinesOfCodeWritten({numLines: numLinesWritten})}
      </p>
    );

    const showCode = (
      <details
        className="show-code"
        style={useChallengeStyles ? styles.details : null}
      >
        <summary
          role="button"
          style={{
            ...styles.summary,
            ...(useChallengeStyles ? styles.challengeSummary : {})
          }}
          onClick={() => trackEvent('showCode', 'click', 'dialog')}
        >
          <b>{msg.showGeneratedCode()}</b>
        </summary>
        {children}
      </details>
    );

    return (
      <div>
        {lines}
        {showCode}
      </div>
    );
  }
}

const styles = {
  summary: {
    fontSize: 18,
    lineHeight: '20px',
    fontWeight: 'normal',
    outline: 'none',
    padding: 5,
    display: 'list-item'
  },
  challengeLineCounts: {
    fontSize: 16
  },
  challengeSummary: {
    fontColor: 'black',
    fontSize: 14,
    marginLeft: 40
  },
  details: {
    textAlign: 'left'
  }
};

export default Radium(CodeWritten);
