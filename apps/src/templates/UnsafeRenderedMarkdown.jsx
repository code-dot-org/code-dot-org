import React, { PropTypes } from 'react';
import processMarkdown from 'marked';
import renderer from "../util/StylelessRenderer";

/**
 * Basic component for rendering a markdown string as HTML.
 *
 * Right now, it still uses marked; this will eventually be updated to use the
 * new remark system, and possibly even support redaction.
 *
 * Note that this component will render anything contained in the markdown into
 * the browser, including arbitrary html and script tags. It should be
 * considered unsafe to use for user-generated content until the markdown
 * renderer driving this component can be made safe.
 */
export default class UnsafeRenderedMarkdown extends React.Component {
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
