import {GoogleAnalytics} from '@next/third-parties/google';

import Footer from '@/components/footer';
import Header from '@/components/header';
import {Brand} from '@/config/brand';
import {getGoogleAnalyticsMeasurementId} from '@/config/ga4';
import OrganizationJsonLd from '@/config/jsonLd/OrganizationJsonLd';
import {getStage} from '@/config/stage';
import OneTrustLoader from '@/providers/onetrust/OneTrustLoader';
import OneTrustProvider from '@/providers/onetrust/OneTrustProvider';
import {generateBootstrapValues} from '@/providers/statsig/statsig-backend';
import StatsigProvider from '@/providers/statsig/StatsigProvider';

/**
 * Nested asynchronous layout to temporarily workaround Font Awesome imports going out of order due to CSS Chunking
 *
 * Long term fix: https://codedotorg.atlassian.net/browse/CMS-413
 */
export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{brand: Brand}>;
}>) {
  const syncParams = await params;
  const {brand} = syncParams;

  const googleAnalyticsMeasurementId = getGoogleAnalyticsMeasurementId(brand);
  const statsigBootstrapValues = await generateBootstrapValues();
  const statsigClientKey = process.env.STATSIG_CLIENT_KEY;

  return (
    <>
      <OneTrustLoader brand={brand} />

      <OneTrustProvider>
        {googleAnalyticsMeasurementId && (
          <GoogleAnalytics gaId={googleAnalyticsMeasurementId} />
        )}
        <StatsigProvider
          stage={getStage()}
          clientKey={statsigClientKey}
          values={statsigBootstrapValues}
        >
          <Header />
          {children}
          <Footer />
        </StatsigProvider>
      </OneTrustProvider>

      <OrganizationJsonLd brand={brand} />
    </>
  );
}
