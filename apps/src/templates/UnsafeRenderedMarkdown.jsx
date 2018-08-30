import React, { PropTypes } from 'react';

import Parser from '@code-dot-org/redactable-markdown/src/redactableMarkdownParser';

import expandableImages from './plugins/expandableImages';
import xmlAsTopLevelBlock from './plugins/xmlAsTopLevelBlock';
import stripStyles from './plugins/stripStyles';
import fixTightLists from './plugins/fixTightLists';

const remarkParser = Parser.create();

remarkParser.parser.use([
  xmlAsTopLevelBlock,
  expandableImages,
  fixTightLists
]);

remarkParser.compilerPlugins.push(stripStyles);

/**
 * Basic component for rendering a markdown string as HTML.
 *
 * Note that this component will render anything contained in the markdown into
 * the browser, including arbitrary html and script tags. It should be
 * considered unsafe to use for user-generated content until the markdown
 * renderer driving this component can be made safe.
 */
export default class UnsafeRenderedMarkdown extends React.Component {
  static propTypes = {
    markdown: PropTypes.string.isRequired,
  };

  render() {
    const processedMarkdown = remarkParser.sourceToHtml(this.props.markdown);

    /* eslint-disable react/no-danger */
    return (
      <div
        dangerouslySetInnerHTML={{ __html: processedMarkdown }}
      />
    );
    /* eslint-enable react/no-danger */
  }
}
