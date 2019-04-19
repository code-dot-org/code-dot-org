import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ChatBubble from './ChatBubble';
import {convertXmlToBlockly} from './utils';
import UnsafeRenderedMarkdown from '../UnsafeRenderedMarkdown';

class InlineFeedback extends Component {
  static propTypes = {
    borderColor: PropTypes.string,
    extra: PropTypes.string,
    message: PropTypes.string.isRequired,
    styles: PropTypes.object
  };

  componentDidMount() {
    convertXmlToBlockly(ReactDOM.findDOMNode(this));
  }

  render() {
    const {borderColor, extra, message, styles} = this.props;

    // We add a classname to this element exclusively so that UI tests can
    // easily detect its presence. This class should NOT be used for
    // styling.
    return (
      <ChatBubble borderColor={borderColor} ttsMessage={message}>
        <div className="uitest-topInstructions-inline-feedback">
          <UnsafeRenderedMarkdown markdown={message} />
        </div>
        {extra && <p style={styles.message}>{extra}</p>}
      </ChatBubble>
    );
  }
}

export default Radium(InlineFeedback);
