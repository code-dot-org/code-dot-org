import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export const buildProgrammingExpressionMarkdown = function(
  programmingExpression
) {
  let block = `\`${programmingExpression.syntax}\``;
  if (programmingExpression.color) {
    block += `(${programmingExpression.color})`;
  }
  return `[${block}](${programmingExpression.link})`;
};

export default class StyledCodeBlock extends Component {
  static propTypes = {
    programmingExpression: PropTypes.shape({
      color: PropTypes.string,
      syntax: PropTypes.string.isRequired,
      link: PropTypes.string,
      parameters: PropTypes.array
    }).isRequired
  };

  render() {
    const {programmingExpression} = this.props;

    return (
      <SafeMarkdown
        markdown={buildProgrammingExpressionMarkdown(programmingExpression)}
      />
    );
  }
}
