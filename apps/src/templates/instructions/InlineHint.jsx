/* eslint-disable react/no-danger */
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import ReadOnlyBlockSpace from '../ReadOnlyBlockSpace';
import ChatBubble from './ChatBubble';
import { connect } from 'react-redux';
import { convertXmlToBlockly } from './utils';

const InlineHint = React.createClass({

  propTypes: {
    block: PropTypes.object, // XML
    borderColor: PropTypes.string,
    content: PropTypes.string.isRequired,
    ttsUrl: PropTypes.string,
    ttsMessage: PropTypes.string,
    isBlockly: PropTypes.bool
  },

  componentDidMount() {
    if (this.props.isBlockly) {
      convertXmlToBlockly(ReactDOM.findDOMNode(this));
    }
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

export const StatelessInlineHint = Radium(InlineHint);
export default connect(state => ({
  isBlockly: state.pageConstants.isBlockly
}))(Radium(InlineHint));
