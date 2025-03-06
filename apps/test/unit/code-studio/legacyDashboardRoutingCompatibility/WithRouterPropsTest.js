import {render, screen} from '@testing-library/react';
import PropTypes from 'prop-types';
import React from 'react';
import {
  matchPath,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {WithRouterProps} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useSearchParams: jest.fn(),
  matchPath: jest.fn(),
}));

const TestComponent = ({params, location, routes}) => (
  <div>
    <p>params: {JSON.stringify(params)}</p>
    <p>location: {JSON.stringify(location)}</p>
    <p>routes: {JSON.stringify(routes)}</p>
  </div>
);

TestComponent.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
  routes: PropTypes.array,
};

describe('WithRouterProps', () => {
  const mockParams = {id: '123'};
  const mockLocation = {
    pathname: '/test-route',
    search: '?query=value',
  };
  const mockSearchParams = new URLSearchParams({key: 'value'});
  const mockRouteConfigs = [
    {path: '/test-route', breadcrumbs: 'Test Breadcrumb'},
  ];

  beforeEach(() => {
    useParams.mockReturnValue(mockParams);
    useLocation.mockReturnValue(mockLocation);
    useSearchParams.mockReturnValue([mockSearchParams]);
    matchPath.mockReturnValue(true);
  });

  it('passes router props to the wrapped component', () => {
    render(
      <WithRouterProps
        component={TestComponent}
        routeConfigs={mockRouteConfigs}
      />
    );

    expect(screen.getByText(/params:/)).toHaveTextContent(
      JSON.stringify(mockParams)
    );
    expect(screen.getByText(/location:/)).toHaveTextContent(
      JSON.stringify({...mockLocation, query: {key: 'value'}})
    );
    // TODO: remove once ApplicationDashboard is refactored to react-router-dom
    // https://codedotorg.atlassian.net/browse/ACQ-3128
    expect(screen.getByText(/routes:/)).toHaveTextContent(
      JSON.stringify([{}, {breadcrumbs: 'Test Breadcrumb'}])
    );
  });
});
