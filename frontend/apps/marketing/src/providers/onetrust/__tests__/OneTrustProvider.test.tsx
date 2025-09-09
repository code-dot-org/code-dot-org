import {render, waitFor} from '@testing-library/react';
import {useContext} from 'react';

import OneTrustContext from '@/providers/onetrust/context/OneTrustContext';

import OneTrustProvider from '../OneTrustProvider';

describe('OneTrustProvider', () => {
  const mockOneTrust = {
    OnConsentChanged: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.oneTrustPromise = Promise.resolve(mockOneTrust);
    window.OnetrustActiveGroups = 'C0001,C0002';
  });

  afterEach(() => {
    delete window.oneTrustPromise;
    delete window.OnetrustActiveGroups;
  });

  it('should render children', async () => {
    const {getByText} = render(
      <OneTrustProvider>
        <div>Test Child</div>
      </OneTrustProvider>,
    );

    await waitFor(() => {
      expect(getByText('Test Child')).toBeInTheDocument();
    });
  });

  it('should update context with allowed cookies on initialization', async () => {
    const TestComponent = () => {
      const context = useContext(OneTrustContext);
      return (
        <div>
          {context?.allowedCookies
            ? `Context Loaded ${Array.from(context.allowedCookies.values())}`
            : 'No Context'}
        </div>
      );
    };

    const {getByText} = render(
      <OneTrustProvider>
        <TestComponent />
      </OneTrustProvider>,
    );

    await waitFor(() => {
      expect(getByText('Context Loaded C0001,C0002')).toBeInTheDocument();
    });
  });

  it('should not update context if OnetrustActiveGroups is not a string', async () => {
    window.OnetrustActiveGroups = undefined;

    const TestComponent = () => {
      const context = useContext(OneTrustContext);
      return (
        <div>{context?.allowedCookies ? 'Context Loaded' : 'No Context'}</div>
      );
    };

    const {getByText} = render(
      <OneTrustProvider>
        <TestComponent />
      </OneTrustProvider>,
    );

    await waitFor(() => {
      expect(getByText('No Context')).toBeInTheDocument();
    });
  });
});
