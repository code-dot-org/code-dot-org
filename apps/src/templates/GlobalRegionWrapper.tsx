import React from 'react';

import {
  currentGlobalConfiguration,
  RegionConfigurationPageObject,
} from '@cdo/apps/util/globalRegions';

interface GlobalRegionWrapperProps {
  component: React.FunctionComponent;
  componentId: string;
  props: object;
}

export const GlobalRegionWrapper: React.FunctionComponent<
  GlobalRegionWrapperProps
> = ({component, componentId, props = {}}) => {
  const EmptyComponent = () => null;

  // Get the 'pages' object from the current global region configuration
  const pages = currentGlobalConfiguration().pages || [];

  // Filters the config down to the first matching page with a setting for
  // the given component
  const pageConfig: RegionConfigurationPageObject | undefined = pages
    .filter(
      filterInfo =>
        RegExp('^/global/.*' + filterInfo.path + '(?:/.*)?').test(
          window.location.pathname
        ) && componentId in filterInfo.components
    )
    .slice(-1)[0];

  // The component is visible if the key does not exist or the value for that
  // component is explicitly set to 'false'
  const visible: boolean =
    !pageConfig || pageConfig.components[componentId] !== false;

  // If it is not visible, we use an "EmptyComponent" instead of the normal one
  // and ignore the given properties.
  const GlobalWrappedComponent: React.FunctionComponent = visible
    ? component
    : EmptyComponent;

  // We then allow overriding properties with the ones given in the region
  // configuration if it is given
  const wrappedProps = visible
    ? pageConfig && pageConfig.components[componentId]
      ? {...props, ...(pageConfig.components[componentId] as object)}
      : props
    : {};

  // Return the component
  return <GlobalWrappedComponent {...wrappedProps} />;
};

export default GlobalRegionWrapper;
