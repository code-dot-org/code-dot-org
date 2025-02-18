import React from 'react';

import ProtectedStatefulDiv from './ProtectedStatefulDiv';

/**
 * The area below our visualization that is shared by all apps. Used by
 * code-studio/reference_area and StudioApp to mount the
 * dashboard-generated Reference Area on the page.
 */
export default function BelowVisualization() {
  return <ProtectedStatefulDiv id="belowVisualization" />;
}
