/* eslint-disable react/no-danger */
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import ReadOnlyBlockSpace from '../ReadOnlyBlockSpace';
import ChatBubble from './ChatBubble';
import { convertXmlToBlockly } from './utils';

const InlineHint = React.createClass({

  propTypes: {
    block: React.PropTypes.object, // XML
    borderColor: React.PropTypes.string,
    content: React.PropTypes.string.isRequired,
    ttsUrl: React.PropTypes.string,
    ttsMessage: React.PropTypes.string,
  },

  componentDidMount() {
    convertXmlToBlockly(ReactDOM.findDOMNode(this));
  },

  render() {
    return (
      <ChatBubble borderColor={this.props.borderColor} ttsUrl={this.props.ttsUrl} ttsMessage={this.props.ttsMessage}>
        <div
          dangerouslySetInnerHTML={{ __html: this.props.content }}
        />
        {this.props.block && <ReadOnlyBlockSpace block={this.props.block} />}
      </ChatBubble>
    );
  }

});

export default Radium(InlineHint);
