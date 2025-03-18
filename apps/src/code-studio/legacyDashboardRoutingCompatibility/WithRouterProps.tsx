import React from 'react';
import {
  useParams,
  useLocation,
  useSearchParams,
  matchPath,
  Params,
  Location,
} from 'react-router-dom';

interface WithRouterProps {
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
  breadcrumbs: string;
}

export const WithRouterProps: React.FC<
  WithRouterProps & Record<string, unknown>
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
  const breadcrumbs = routeConfigs?.find(config =>
    matchPath(config.path, location.pathname)
  )?.breadcrumbs;
  // Create routes structure that Header expects
  const routes = [
    {}, // First route is not used
    {breadcrumbs},
  ];
  return (
    <Component
      {...props}
      params={params}
      location={locationWithQuery}
      routes={routes}
    />
  );
};
