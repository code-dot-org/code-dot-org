// The level header's middle for an adaptive level: an empty element the
// adaptive lab portals its own header into, so the header's buttons can
// drive the lab directly.

import React from 'react';

/** The adaptive lab portals its own header into the element with this id. */
export const ADAPTIVE_HEADER_ID = 'adaptive_header';

const AdaptiveHeaderPortal: React.FunctionComponent = () => (
  <div id={ADAPTIVE_HEADER_ID} />
);

export default AdaptiveHeaderPortal;
