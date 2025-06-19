import {GoogleAnalytics} from '@next/third-parties/google';

import Footer from '@/components/footer';
import Header from '@/components/header';
import {Brand} from '@/config/brand';
import {getGoogleAnalyticsMeasurementId} from '@/config/ga4';
import OrganizationJsonLd from '@/config/jsonLd/OrganizationJsonLd';
import EnvironmentLoader from '@/providers/environment';
import NewRelicLoader from '@/providers/newrelic/NewRelicLoader';
import OneTrustLoader from '@/providers/onetrust/OneTrustLoader';
import OneTrustProvider from '@/providers/onetrust/OneTrustProvider';

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

  return (
    <>
      <EnvironmentLoader />
      <NewRelicLoader />
      <OneTrustLoader brand={brand} />

      <OneTrustProvider>
        {googleAnalyticsMeasurementId && (
          <GoogleAnalytics gaId={googleAnalyticsMeasurementId} />
        )}
        <Header />
        {children}
        <Footer />
      </OneTrustProvider>

      <OrganizationJsonLd brand={brand} />
    </>
  );
}
