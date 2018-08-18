import React, { PropTypes } from 'react';
import processMarkdown from 'marked';
import renderer from "../util/StylelessRenderer";

/**
 * Basic component for rendering a markdown string as HTML.
 *
 * Right now, it still uses marked; this will eventually be updated to use the
 * new remark system, and possibly even support redaction.
 */
export default class RenderedMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired
  };

  render() {
    const processedMarkdown = processMarkdown(this.props.markdown, { renderer });
    /* eslint-disable react/no-danger */
    return (
      <div
        dangerouslySetInnerHTML={{ __html: processedMarkdown }}
      />
    );
    /* eslint-enable react/no-danger */
  }
}
