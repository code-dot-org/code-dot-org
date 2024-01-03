import PropTypes from 'prop-types';
import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import EmbeddedBlock from '@cdo/apps/templates/codeDocs/EmbeddedBlock';

export const buildProgrammingExpressionMarkdown = function (
  programmingExpression
) {
  let block = `\`${programmingExpression.syntax}\``;
  if (programmingExpression.color) {
    block += `(${programmingExpression.color})`;
  }
  return `[${block}](${programmingExpression.link})`;
};

export default function StyledCodeBlock({programmingExpression}) {
  if (programmingExpression.blockName) {
    return (
      <EmbeddedBlock
        blockName={programmingExpression.blockName}
        link={programmingExpression.link}
        ariaLabel={programmingExpression.name}
      />
    );
  } else {
    return (
      <SafeMarkdown
        markdown={buildProgrammingExpressionMarkdown(programmingExpression)}
      />
    );
  }
}

StyledCodeBlock.propTypes = {
  programmingExpression: PropTypes.shape({
    color: PropTypes.string,
    syntax: PropTypes.string.isRequired,
    link: PropTypes.string,
    parameters: PropTypes.array,
    name: PropTypes.string,
    blockName: PropTypes.string,
  }).isRequired,
};
