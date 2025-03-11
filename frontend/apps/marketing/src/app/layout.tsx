import type {Metadata} from 'next';

import '@code-dot-org/component-library-styles/font-awesome.scss';
import '@code-dot-org/component-library-styles/colors.scss';
import '@code-dot-org/fonts/index.css';

import './globals.css';

import {GoogleAnalytics} from '@next/third-parties/google';
import {headers} from 'next/headers';
import {getGoogleAnalyticsMeasurementId} from '@/config/ga4';
import {getBrandFromHostname} from '@/config/brand';

export const metadata: Metadata = {
  title: 'Code.org',
  description: 'Anyone can learn!',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hostname = (await headers()).get('Host');
  const brand = getBrandFromHostname(hostname);
  const googleAnalyticsMeasurementId = getGoogleAnalyticsMeasurementId(brand);

  return (
    <html lang="en">
      {googleAnalyticsMeasurementId && (
        <GoogleAnalytics gaId={googleAnalyticsMeasurementId} />
      )}
      <body>{children}</body>
    </html>
  );
}
