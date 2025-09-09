import {useClientBootstrapInit} from '@statsig/react-bindings';
import {render} from '@testing-library/react';
import {setCookie, getCookie} from 'cookies-next/client';
import {v4 as uuidv4} from 'uuid';

import {Stage} from '@/config/stage';
import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';
import plugins from '@/providers/statsig/plugins';

import {getClient} from '../client';

jest.mock('@statsig/react-bindings', () => ({
  useClientBootstrapInit: jest.fn(),
}));

jest.mock('cookies-next/client', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('@/providers/statsig/plugins', () => ({}));

const MockStatsigComponent = ({
  clientKey,
  stage,
  values,
}: {
  clientKey: string;
  stage: Stage;
  values: string;
}) => {
  getClient(clientKey, stage, values);

  return <></>;
};

describe('getClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use the statsig stable id from cookie if exists', () => {
    (getCookie as jest.Mock).mockReturnValue('existing-stable-id');
    const clientKey = 'test-client-key';
    const stage = 'production';
    const values = 'test-values';

    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          values={values}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientBootstrapInit).toHaveBeenCalledWith(
      clientKey,
      {userID: 'marketing-user', customIDs: {stableID: 'existing-stable-id'}},
      values,
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('should generate a new stableId if none exists', () => {
    (getCookie as jest.Mock).mockReturnValue(null);
    (uuidv4 as jest.Mock).mockReturnValue('new-stable-id');
    const clientKey = 'test-client-key';
    const stage = 'production';
    const values = 'test-values';

    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          values={values}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientBootstrapInit).toHaveBeenCalledWith(
      clientKey,
      {userID: 'marketing-user', customIDs: {stableID: 'new-stable-id'}},
      values,
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );

    expect(setCookie).toHaveBeenCalledWith(
      'statsig_stable_id',
      'new-stable-id',
      {path: '/'},
    );
  });

  it('should use the correct environment tier based on the stage', () => {
    (getCookie as jest.Mock).mockReturnValue('existing-stable-id');
    const clientKey = 'test-client-key';
    const stage = 'production';
    const values = 'test-values';

    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          values={values}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientBootstrapInit).toHaveBeenCalledWith(
      clientKey,
      {userID: 'marketing-user', customIDs: {stableID: 'existing-stable-id'}},
      values,
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
  });

  it('should NOT generate a new stableId if performance cookies are disabled', () => {
    (getCookie as jest.Mock).mockReturnValue(null);
    (uuidv4 as jest.Mock).mockReturnValue('new-stable-id');
    const clientKey = 'test-client-key';
    const stage = 'production';
    const values = 'test-values';

    render(
      <OneTrustContext.Provider
        value={{
          allowedCookies: new Set([OneTrustCookieGroup.StrictlyNecessary]),
        }}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={stage}
          values={values}
        />
        <div>Test Child</div>
      </OneTrustContext.Provider>,
    );

    expect(useClientBootstrapInit).toHaveBeenCalledWith(
      clientKey,
      {userID: 'marketing-user', customIDs: {stableID: undefined}},
      values,
      {
        environment: {tier: stage},
        plugins: plugins,
      },
    );
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('should only set plugins in production', () => {
    (getCookie as jest.Mock).mockReturnValue('existing-stable-id');
    const clientKey = 'test-client-key';
    const values = 'test-values';

    // Production: plugins should be set
    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={'production'}
          values={values}
        />
      </OneTrustContext.Provider>,
    );
    expect(useClientBootstrapInit).toHaveBeenLastCalledWith(
      clientKey,
      {userID: 'marketing-user', customIDs: {stableID: 'existing-stable-id'}},
      values,
      {
        environment: {tier: 'production'},
        plugins: plugins,
      },
    );

    // Development: plugins should be undefined
    render(
      <OneTrustContext.Provider
        value={{allowedCookies: new Set([OneTrustCookieGroup.Performance])}}
      >
        <MockStatsigComponent
          clientKey={clientKey}
          stage={'development'}
          values={values}
        />
      </OneTrustContext.Provider>,
    );
    expect(useClientBootstrapInit).toHaveBeenLastCalledWith(
      clientKey,
      {userID: 'marketing-user', customIDs: {stableID: 'existing-stable-id'}},
      values,
      {
        environment: {tier: 'development'},
        plugins: undefined,
      },
    );
  });
});
