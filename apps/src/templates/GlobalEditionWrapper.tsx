import React from 'react';

import {
  currentGlobalConfiguration,
  RegionConfigurationPageObject,
} from '@cdo/apps/util/globalEdition';

interface GlobalEditionWrapperProps {
  component: React.FunctionComponent;
  componentId: string;
  props: object;
}

/**
 * Provides a wrapper around an existing component that allows it to be
 * configured via a Global Edition configuration.
 *
 * The global edition configurations are in the config directory at the
 * root of the repository. For instance: config/global_editions/fa.yml
 *
 * Essentially you can take an existing component like <Foo> and then wrap it
 * as such:
 *
 * <GlobalEditionWrapper
 *   component={Foo}
 *   componentId="Foo"
 *   props={{
 *     bar: "baz",
 *   }}
 * />
 *
 * Where the props go into the props property of the wrapper. The `componentId`
 * is the name of the component which is then used to refer to it in the
 * regional configuration.
 *
 * For instance, in the config/global_editions/india.yml (let's say) we could
 * have:
 *
 * ```
 *   pages:
 *     - path: /
 *       components:
 *         Foo: false
 * ```
 *
 * Which will render an "EmptyComponent" and essentially hide the component when
 * viewing any page in the "india" region.
 *
 * We can, instead, just override properties:
 *
 * ```
 *   pages:
 *     - path: /
 *       components:
 *         Foo:
 *           bar: chaz
 * ```
 *
 * This means, in this region (as opposed to any other), the component will be
 * rendered and visible, but with the 'bar' property overriden.
 *
 * See the 'pages' section of an existing configuration for more information
 * on the format of the configuration and its use here.
 */
export const GlobalEditionWrapper: React.FunctionComponent<
  GlobalEditionWrapperProps
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
  // component is NOT explicitly set to 'false'
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

export default GlobalEditionWrapper;
