import React from 'react';

import {currentGlobalConfiguration} from '@cdo/apps/util/globalRegions';

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
  const pages = currentGlobalConfiguration().pages || {};

  // Filters the config down to the first matching page
  const pageConfigKey: string | undefined = (
    Object.keys(pages) as Array<string>
  ).find(pageMask =>
    RegExp('^/global/.*' + pageMask + '(?:/.*)?').test(window.location.pathname)
  );

  // The component is visible if the key does not exist or the value for that
  // component is explicitly set to 'false'
  const visible: boolean =
    !pageConfigKey || pages[pageConfigKey][componentId] !== false;

  // If it is not visible, we use an "EmptyComponent" instead of the normal one
  // and ignore the given properties.
  const GlobalWrappedComponent: React.FunctionComponent = visible
    ? component
    : EmptyComponent;

  // We then allow overriding properties with the ones given in the region
  // configuration if it is given
  const wrappedProps = visible
    ? pageConfigKey && pages[pageConfigKey][componentId]
      ? {...props, ...(pages[pageConfigKey as string][componentId] as object)}
      : props
    : {};

  // Return the component
  return <GlobalWrappedComponent {...wrappedProps} />;
};

export default GlobalRegionWrapper;
