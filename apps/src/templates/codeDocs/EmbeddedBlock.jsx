import {Link} from '@dsco_/link';
import PropTypes from 'prop-types';
import React, {useRef, useEffect} from 'react';

import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';
import {parseElement} from '@cdo/apps/xml';

export default function EmbeddedBlock({blockName, link, ariaLabel}) {
  const blockRef = useRef();

  useEffect(() => {
    if (blockName && blockRef.current) {
      const blocksDom = parseElement(`<block type='${blockName}' />`);
      const blockSpace = Blockly.createEmbeddedWorkspace(
        blockRef.current,
        blocksDom,
        {
          noScrolling: true,
          inline: true,
        }
      );
      shrinkBlockSpaceContainer(blockSpace, true);
    }
  }, [blockName, blockRef]);

  return (
    <div>
      <Link href={link}>
        <div
          id={`embedded-block-${blockName}`}
          ref={blockRef}
          style={{paddingBottom: 5}}
          aria-label={ariaLabel || blockName}
        />
      </Link>
    </div>
  );
}

EmbeddedBlock.propTypes = {
  blockName: PropTypes.string.isRequired,
  link: PropTypes.string,
  ariaLabel: PropTypes.string,
};
