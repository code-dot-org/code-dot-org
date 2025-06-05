import {Brand} from '@/config/brand';
import LocalizeLoader from '@/providers/localize/LocalizeLoader';

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
  params: Promise<{brand: Brand; locale: string}>;
}>) {
  const syncParams = await params;
  const {brand, locale} = syncParams;

  return (
    <>
      <LocalizeLoader brand={brand} locale={locale} />
      {children}
    </>
  );
}
