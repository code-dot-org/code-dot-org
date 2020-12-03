import experiments from '@cdo/apps/util/experiments';
import React from 'react';

/**
 * This experiment loads the why-did-you-render library to help track rendering
 * performance issues: https://github.com/welldone-software/why-did-you-render
 *
 * To enable it for a specific component, add `static whyDidYouRender = true`
 * at the top of the component class.
 *
 * Note: once we upgrade to React 16, we should upgrade this library.
 */
if (
  process.env.NODE_ENV === 'development' &&
  experiments.isEnabled(experiments.WHY_DID_YOU_RENDER)
) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: false
  });
}
