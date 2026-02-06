import React from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';

interface IntroJSTourWrapperProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Wrapper component for intro.js tours that enforces common restrictions.
 * This wrapper prevents tours from rendering when:
 * - The workspace is in start mode (editing start sources)
 * - The enabled prop is set to false
 */
const IntroJSTourWrapper: React.FC<IntroJSTourWrapperProps> = ({
  children,
  enabled,
}) => {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  // Don't render tour if disabled or in start mode.
  if (!enabled || isStartMode) {
    return null;
  }

  return <>{children}</>;
};

export default IntroJSTourWrapper;
