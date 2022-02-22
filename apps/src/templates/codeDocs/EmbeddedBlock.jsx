import PropTypes from 'prop-types';
import React, {createRef, useEffect} from 'react';
import {parseElement} from '@cdo/apps/xml';
import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';

export default function EmbeddedBlock({blockName, link}) {
  const blockRef = createRef();

  useEffect(() => {
    if (blockName && blockRef.current) {
      const blocksDom = parseElement(`<block type='${blockName}' />`);
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
  }, [blockRef.current]);

  return (
    <div>
      <a href={link}>
        <div
          id={`embedded-block-${blockName}`}
          ref={blockRef}
          style={{paddingBottom: 5}}
        />
      </a>
    </div>
  );
}

EmbeddedBlock.propTypes = {
  blockName: PropTypes.string.isRequired,
  link: PropTypes.string
};
