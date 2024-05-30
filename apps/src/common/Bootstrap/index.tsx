import React from 'react';

import HoneybadgerErrorBoundary from '@cdo/apps/common/error/HoneybadgerErrorBoundary';

interface BootstrapProps {
  children: React.ReactNode;
}

/**
 * Global bootstrap component common to all entry points
 */
const Bootstrap = ({children}: BootstrapProps) => {
  return <HoneybadgerErrorBoundary>{children}</HoneybadgerErrorBoundary>;
};

export default Bootstrap;
