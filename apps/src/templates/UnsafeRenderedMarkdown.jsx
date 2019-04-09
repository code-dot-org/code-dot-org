import PropTypes from 'prop-types';
import React from 'react';
import remark2react from 'remark-react';

import Parser from '@code-dot-org/redactable-markdown';

import expandableImages from './plugins/expandableImages';
import xmlAsTopLevelBlock from './plugins/xmlAsTopLevelBlock';
import stripStyles from './plugins/stripStyles';

const remarkParser = Parser.create();
remarkParser.parser.use([xmlAsTopLevelBlock, expandableImages]);
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
    markdown: PropTypes.string.isRequired
  };

  render() {
    const processedMarkdown = remarkParser
      .getParser()
      .use(remark2react, {
        toHast: {
          allowDangerousHTML: true
        }
      })
      .processSync(this.props.markdown).contents;

    if (processedMarkdown.type === 'div') {
      return processedMarkdown;
    } else {
      return <div>{processedMarkdown}</div>;
    }
  }
}
