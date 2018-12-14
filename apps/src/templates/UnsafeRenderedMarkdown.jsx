import React, { PropTypes } from 'react';

import experiments from '@cdo/apps/util/experiments';

import processMarkdown from 'marked';
import renderer from "../util/StylelessRenderer";

import Parser from '@code-dot-org/redactable-markdown';

import expandableImages from './plugins/expandableImages';
import xmlAsTopLevelBlock from './plugins/xmlAsTopLevelBlock';
import stripStyles from './plugins/stripStyles';

const remarkParser = Parser.create();

remarkParser.parser.use([
  xmlAsTopLevelBlock,
  expandableImages,
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
    forceRemark: PropTypes.bool,
  };

  render() {
    let processedMarkdown;
    if (this.props.forceRemark || experiments.isEnabled('remark')) {
      processedMarkdown = remarkParser.sourceToHtml(this.props.markdown);
    } else {
      processedMarkdown = processMarkdown(this.props.markdown, { renderer });
    }

    /* eslint-disable react/no-danger */
    return (
      <div
        dangerouslySetInnerHTML={{ __html: processedMarkdown }}
      />
    );
    /* eslint-enable react/no-danger */
  }
}
