import React, {PropTypes} from 'react';
import marked from 'marked';

// Render links to open in a different tab
const renderer = new marked.Renderer();
renderer.link = (href, _title, text) => `<a href="${href}" target="_blank">${text}</a>`;

export default class MarkdownSpan extends React.Component {
  static propTypes = {
    children: PropTypes.string.isRequired,
    style: PropTypes.object
  };

  render() {
    const renderedText = marked.inlineLexer(this.props.children, [], {renderer});
    return (
      <span
        dangerouslySetInnerHTML={{__html: renderedText}} // eslint-disable-line react/no-danger
        style={this.props.style}
      />
    );
  }
}
