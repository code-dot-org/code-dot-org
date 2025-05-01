import {Link} from '@dsco_/link';
import PropTypes from 'prop-types';
import React, {useRef, useEffect} from 'react';

import {embedBlocklyBlock} from '../utils/embeddedBlocklyRenderUtils';

export default function EmbeddedBlock({blockName, link, ariaLabel}) {
  const blockRef = useRef();

  useEffect(() => {
    if (blockName && blockRef.current) {
      embedBlocklyBlock(blockRef.current, blockName);
    }
  }, [blockName, blockRef]);

  return (
    <div>
      <Link href={link}>
        <div
          id={`embedded-block-${blockName}`}
          ref={blockRef}
          style={{paddingBottom: 5, verticalAlign: 'middle'}}
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
