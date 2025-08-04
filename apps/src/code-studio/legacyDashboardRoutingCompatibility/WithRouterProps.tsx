import React from 'react';
import {
  useParams,
  useLocation,
  useSearchParams,
  matchPath,
  Params,
  Location,
} from 'react-router-dom';

interface WithRouterPropsType {
  component: React.ComponentType<
    {
      params: Readonly<Params<string>>;
      location: Location<unknown> & {
        query: Record<string, string>;
      };
      routes: {breadcrumbs?: string}[];
    } & Record<string, unknown>
  >;
  routeConfigs?: RouteConfig[];
}

interface RouteConfig {
  path: string;
  breadcrumbs?: string;
  childRoutes?: RouteConfig[];
}

export const WithRouterProps: React.FC<
  WithRouterPropsType & Record<string, unknown>
> = ({component: Component, routeConfigs, ...props}) => {
  const params = useParams();
  const location = useLocation();
  const [search] = useSearchParams();
  const locationWithQuery = {
    ...location,
    query: Object.fromEntries(search.entries()),
  };

  // TODO: remove once ApplicationDashboard is refactored to react-router-dom
  // https://codedotorg.atlassian.net/browse/ACQ-3128
  // Recursively join parent and child paths for nested route matching
  const getBreadcrumbs = (
    configs: RouteConfig[] = [],
    parentPath = ''
  ): string | undefined => {
    for (const config of configs) {
      const joinedPath = [`/${parentPath}`, config.path]
        .filter(Boolean)
        .join('/')
        .replace(/\/\/+/g, '/');

      if (matchPath(joinedPath, location.pathname)) {
        return config.breadcrumbs;
      }
      if (config.childRoutes) {
        const childBreadcrumbs = getBreadcrumbs(config.childRoutes, joinedPath);
        if (childBreadcrumbs) {
          return childBreadcrumbs;
        }
      }
    }
  };

  const breadcrumbs = getBreadcrumbs(routeConfigs);
  // Create routes structure that Header expects
  const routes = [
    {}, // First route is not used
    {breadcrumbs},
  ];
  return (
    <div className="legacy-bs">
      <Component
        {...props}
        params={params}
        location={locationWithQuery}
        routes={routes}
      />
    </div>
  );
};
