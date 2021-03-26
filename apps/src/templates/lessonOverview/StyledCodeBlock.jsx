import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export const buildProgrammingExpressionMarkdown = function(
  programmingExpression
) {
  let block = `\`${programmingExpression.name}\``;
  if (programmingExpression.color) {
    block += `(${programmingExpression.color})`;
  }
  return `[${block}](${programmingExpression.link})`;
};

export default class StyledCodeBlock extends Component {
  static propTypes = {
    programmingExpression: PropTypes.shape({
      color: PropTypes.string,
      name: PropTypes.string.isRequired,
      link: PropTypes.string
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
