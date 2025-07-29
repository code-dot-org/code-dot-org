import {ThemeProvider} from '@mui/material';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';
import {GoogleAnalytics} from '@next/third-parties/google';
import {draftMode} from 'next/headers';

import Footer from '@/components/footer';
import FooterCSforAll from '@/components/footerMui/FooterCSforAll';
import Header from '@/components/header';
import {Brand} from '@/config/brand';
import {getGoogleAnalyticsMeasurementId} from '@/config/ga4';
import OrganizationJsonLd from '@/config/jsonLd/OrganizationJsonLd';
import {SUPPORTED_LOCALES_MAP, SupportedLocale} from '@/config/locale';
import {getStage} from '@/config/stage';
import EnvironmentLoader from '@/providers/environment';
import LocalizeLoader from '@/providers/localize/LocalizeLoader';
import NewRelicLoader from '@/providers/newrelic/NewRelicLoader';
import OneTrustLoader from '@/providers/onetrust/OneTrustLoader';
import OneTrustProvider from '@/providers/onetrust/OneTrustProvider';
import {generateBootstrapValues} from '@/providers/statsig/statsig-backend';
import StatsigProvider from '@/providers/statsig/StatsigProvider';
import {getCriticalFonts, getMuiTheme} from '@/themes';

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{brand: Brand; locale: SupportedLocale}>;
}>) {
  const syncParams = await params;
  const {brand, locale} = syncParams;

  await getCriticalFonts(brand);
  const googleAnalyticsMeasurementId = getGoogleAnalyticsMeasurementId(brand);
  const statsigBootstrapValues = await generateBootstrapValues();
  const statsigClientKey = process.env.STATSIG_CLIENT_KEY;
  const localeConfig = SUPPORTED_LOCALES_MAP.get(locale);
  const theme = getMuiTheme(brand);
  const isDraftModeEnabled = (await draftMode()).isEnabled;
  // Get Footer component based on brand
  const getFooter = () => {
    switch (brand) {
      case Brand.CS_FOR_ALL:
        return <FooterCSforAll locale={locale} />;
      case Brand.CODE_DOT_ORG:
        return <Footer locale={locale} />;
    }
  };

  return (
    <html lang={locale} dir={localeConfig?.isRTL ? 'rtl' : 'ltr'}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <EnvironmentLoader />
            <NewRelicLoader />
            <OneTrustLoader brand={brand} />
            <LocalizeLoader
              brand={brand}
              locale={locale}
              isDraftMode={isDraftModeEnabled}
            />

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
                {getFooter()}
              </StatsigProvider>
            </OneTrustProvider>

            <OrganizationJsonLd brand={brand} />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
