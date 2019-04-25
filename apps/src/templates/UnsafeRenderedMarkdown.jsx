import PropTypes from 'prop-types';
import React from 'react';

import Parser from '@code-dot-org/redactable-markdown';

import expandableImages from './plugins/expandableImages';
import xmlAsTopLevelBlock from './plugins/xmlAsTopLevelBlock';
import stripStyles from './plugins/stripStyles';
import externalLinks from './plugins/externalLinks';

const commonPlugins = [xmlAsTopLevelBlock, expandableImages];

const remarkParser = Parser.create();
remarkParser.parser.use(commonPlugins);
remarkParser.compilerPlugins.push(stripStyles);

const extendedParser = Parser.create();
extendedParser.parser.use(commonPlugins);
extendedParser.parser.use(externalLinks, {links: 'all'});
extendedParser.compilerPlugins.push(stripStyles);

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
    openExternalLinksInNewTab: PropTypes.bool
  };

  render() {
    const parser = this.props.openExternalLinksInNewTab
      ? extendedParser
      : remarkParser;
    const processedMarkdown = parser.sourceToHtml(this.props.markdown);

    /* eslint-disable react/no-danger */
    return <div dangerouslySetInnerHTML={{__html: processedMarkdown}} />;
    /* eslint-enable react/no-danger */
  }
}
