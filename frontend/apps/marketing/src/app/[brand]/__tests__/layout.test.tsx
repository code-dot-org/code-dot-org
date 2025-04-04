import {render} from '@testing-library/react';
import {headers} from 'next/headers';

import {Brand, getBrandFromHostname} from '@/config/brand';
import {getGoogleAnalyticsMeasurementId} from '@/config/ga4';
import {getStage} from '@/config/stage';
import {generateBootstrapValues} from '@/providers/statsig/statsig-backend';

import Layout from '../layout';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('@/config/brand', () => ({
  ...jest.requireActual('@/config/brand'),
  getBrandFromHostname: jest.fn(),
}));

jest.mock('@/config/ga4', () => ({
  getGoogleAnalyticsMeasurementId: jest.fn(),
}));

jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));

jest.mock('@/providers/statsig/statsig-backend', () => ({
  generateBootstrapValues: jest.fn(),
}));

jest.mock('@/providers/onetrust/OneTrustLoader', () => () => (
  <div>OneTrustLoader</div>
));
jest.mock(
  '@/providers/onetrust/OneTrustProvider',
  () =>
    ({children}: {children: React.ReactNode}) => (
      <div>OneTrustProvider {children}</div>
    ),
);
jest.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({gaId}: {gaId: string}) => (
    <div>GoogleAnalytics {gaId}</div>
  ),
}));
jest.mock(
  '@/providers/statsig/StatsigProvider',
  () =>
    ({children}: {children: React.ReactNode}) => (
      <div>StatsigProvider {children}</div>
    ),
);

jest.mock(
  '@/config/jsonLd/OrganizationJsonLd',
  () =>
    ({brand}: {brand: string}) => <div>OrganizationJsonLd for {brand}</div>,
);

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the layout with children', async () => {
    const brand = 'exampleBrand';

    (headers as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue('example.com'),
    });
    (getBrandFromHostname as jest.Mock).mockReturnValue(brand);
    (getGoogleAnalyticsMeasurementId as jest.Mock).mockReturnValue('GA-123456');
    (getStage as jest.Mock).mockReturnValue('production');
    (generateBootstrapValues as jest.Mock).mockResolvedValue({});

    const {findByText} = render(
      await Layout({
        children: <div>Child Component</div>,
        params: Promise.resolve({brand: 'code.org' as Brand}),
      }),
    );

    expect(await findByText('OneTrustLoader')).toBeInTheDocument();
    expect(await findByText('OneTrustProvider')).toBeInTheDocument();
    expect(await findByText('GoogleAnalytics GA-123456')).toBeInTheDocument();
    expect(await findByText('StatsigProvider')).toBeInTheDocument();
    expect(await findByText('Child Component')).toBeInTheDocument();
    expect(
      await findByText(`OrganizationJsonLd for ${brand}`),
    ).toBeInTheDocument();
  });

  it('does not render GoogleAnalytics if measurement ID is missing', async () => {
    (headers as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue('example.com'),
    });
    (getBrandFromHostname as jest.Mock).mockReturnValue('exampleBrand');
    (getGoogleAnalyticsMeasurementId as jest.Mock).mockReturnValue(null);
    (getStage as jest.Mock).mockReturnValue('production');
    (generateBootstrapValues as jest.Mock).mockResolvedValue({});

    const {queryByText} = render(
      await Layout({
        children: <div>Child Component</div>,
        params: Promise.resolve({brand: 'code.org' as Brand}),
      }),
    );

    expect(queryByText('GoogleAnalytics')).not.toBeInTheDocument();
  });
});
