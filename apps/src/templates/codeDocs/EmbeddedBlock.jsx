import {Link} from '@dsco_/link';
import PropTypes from 'prop-types';
import React, {createRef, useEffect} from 'react';

import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';
import {parseElement} from '@cdo/apps/xml';

export default function EmbeddedBlock({blockName, link, ariaLabel}) {
  const blockRef = createRef();

  useEffect(() => {
    if (blockName && blockRef.current) {
      const blocksDom = parseElement(`<block type='${blockName}' />`);
      const previousBlockSpace = blockRef.current.querySelector(
        'svg.readOnlyBlockSpace'
      );
      previousBlockSpace?.remove();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockRef]);

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
