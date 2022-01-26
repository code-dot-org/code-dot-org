import PropTypes from 'prop-types';
import React, {createRef, useEffect} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {parseElement} from '@cdo/apps/xml';
import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';

export const buildProgrammingExpressionMarkdown = function(
  programmingExpression
) {
  let block = `\`${programmingExpression.syntax}\``;
  if (programmingExpression.color) {
    block += `(${programmingExpression.color})`;
  }
  return `[${block}](${programmingExpression.link})`;
};

export default function StyledCodeBlock({programmingExpression}) {
  const blockRef = createRef();

  useEffect(() => {
    if (programmingExpression.blockName && blockRef.current) {
      const blocksDom = parseElement(
        `<block type='${programmingExpression.blockName}' />`
      );
      const blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(
        blockRef.current,
        blocksDom,
        {
          noScrolling: true,
          inline: true
        }
      );
      shrinkBlockSpaceContainer(blockSpace, true);
    }
  }, [programmingExpression, blockRef.current]);

  if (programmingExpression.blockName) {
    return (
      <div>
        <a href={programmingExpression.link}>
          <div
            id={`embedded-block-${programmingExpression.blockName}`}
            ref={blockRef}
          />
        </a>
      </div>
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
    parameters: PropTypes.array
  }).isRequired
};
