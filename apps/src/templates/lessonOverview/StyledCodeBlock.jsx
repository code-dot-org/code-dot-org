import PropTypes from 'prop-types';
import React, {createRef, useEffect, useState} from 'react';
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
  // TODO(bethany): debug why the block is added to the dom an infinite number of times without this state
  const [blockLoaded, setBlockLoaded] = useState(false);

  useEffect(() => {
    if (programmingExpression.blockName && blockRef.current && !blockLoaded) {
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
      setBlockLoaded(true);
      shrinkBlockSpaceContainer(blockSpace, true);
    }
  });

  if (programmingExpression.blockName) {
    return (
      <div>
        <a href={programmingExpression.link}>
          <div ref={blockRef}>{blockLoaded}</div>
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
