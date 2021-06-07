import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ChatBubble from './ChatBubble';
import {convertXmlToBlockly} from './utils';
import SafeMarkdown from '../SafeMarkdown';

class InlineFeedback extends Component {
  static propTypes = {
    borderColor: PropTypes.string,
    extra: PropTypes.string,
    message: PropTypes.string.isRequired,
    styles: PropTypes.object,
    isMinecraft: PropTypes.bool,
    skinId: PropTypes.string,
    textToSpeechEnabled: PropTypes.bool
  };

  /**
   * Note: InlineFeedback will only convert XML to blockly when it is initially mounted, not on
   * subsequent updates.  Recommended workaround while we are on React 15 is to add a changing `key`
   * prop when rendering the component which will force it to re-mount.
   * Once we are on React 16, it may be possible to convert on componentDidUpdate, which would
   * make the workaround unnecessary.
   * @see https://github.com/facebook/react/issues/7363
   */
  componentDidMount() {
    convertXmlToBlockly(ReactDOM.findDOMNode(this));
  }

  render() {
    const {borderColor, extra, message, styles} = this.props;

    // We add a classname to this element exclusively so that UI tests can
    // easily detect its presence. This class should NOT be used for
    // styling.
    return (
      <ChatBubble
        borderColor={borderColor}
        ttsMessage={message}
        isMinecraft={this.props.isMinecraft}
        skinId={this.props.skinId}
        textToSpeechEnabled={this.props.textToSpeechEnabled}
      >
        <div className="uitest-topInstructions-inline-feedback">
          <SafeMarkdown markdown={message} />
        </div>
        {extra && <p style={styles.message}>{extra}</p>}
      </ChatBubble>
    );
  }
}

export default Radium(InlineFeedback);
