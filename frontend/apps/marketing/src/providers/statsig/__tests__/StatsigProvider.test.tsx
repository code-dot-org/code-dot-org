import {render} from '@testing-library/react';

import StatsigProvider from '@/providers/statsig/StatsigProvider';

describe('StatsigProvider', () => {
  const mockValues = 'test-values';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when STATSIG_CLIENT_KEY is not set', () => {
    delete process.env.STATSIG_CLIENT_KEY;
    const {getByText} = render(
      <StatsigProvider values={mockValues} stage={'development'}>
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should render BaseStatsigProvider with client when STATSIG_CLIENT_KEY is set', () => {
    const {getByText} = render(
      <StatsigProvider
        values={mockValues}
        stage={'development'}
        clientKey={'test-key'}
      >
        <div>Test Child</div>
      </StatsigProvider>,
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
