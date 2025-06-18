// Register custom components server-side
import '@/contentful/register-custom-components';

import {detachExperienceStyles} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';
import {draftMode} from 'next/headers';
import {notFound} from 'next/navigation';

import Bootstrap from '@/bootstrap';
import ContentEditorHelper from '@/components/contentEditorHelper';
import {Brand} from '@/config/brand';
import ExperiencePageLoader from '@/contentful/components/ExperiencePageLoader';
import {getExperience} from '@/contentful/get-experience';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';
import {getSeoMetadata} from '@/metadata/seo';
import {getPageHeading} from '@/selectors/contentful/getExperienceEntryFields';

/**
 * This sets the time for which a page is considered "fresh" to the upstream requester.
 *
 * The Code.org infrastructure currently has two upstream caches in a sequential chain:
 * 1. Marketing CDN
 * 2. Code.org front door CDN (targeted to be removed in the future)
 *
 * When this revalidate parameter is sent, it can take a total of [revalidate] * [number of upstream chains+1] seconds
 *
 * With the current value being 15 minutes, it can therefore take [900] * [2 + 1] = 45 minutes for a page to be updated.
 */
// NOTE: IF UPDATING THIS VALUE, PLEASE ALSO UPDATE THE VALUE IN THE `ViewerResponseCloudFrontFunction` in marketing.yml.erb
export const revalidate = 900; // Fresh for 15 minutes, SEE ABOVE NOTE

type ExperiencePageProps = {
  params: Promise<{locale?: string; paths?: string; brand?: Brand}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};

/**
 * Activates incremental static regeneration (ISR) for this page.
 * Currently, no pages are generated at build time. Pages are rather generated using on-demand ISR.
 */
export async function generateStaticParams() {
  return [];
}

async function getPageProps({params, searchParams}: ExperiencePageProps) {
  const {locale = 'en-US', paths = ['']} = (await params) || {};
  const isDraftModeEnabled = (await draftMode()).isEnabled;

  const slug = getContentfulSlug(paths);

  // Translations are provided by LocalizeJS based on the en-US version of the experience.
  return {
    experienceResult: await getExperience(
      slug,
      'en-US', // Even though we have the locale in the page param, we will request for the en-US version of the page.
      isDraftModeEnabled
        ? (await searchParams).expEditorMode === 'true'
        : false,
    ),
    locale,
    slug,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: ExperiencePageProps): Promise<Metadata> {
  const {brand} = (await params) || {};
  const pageProps = await getPageProps({
    params,
    searchParams,
  });

  const experience = pageProps.experienceResult.experience;

  return {
    title: getPageHeading(experience),
    // Temporary favicon location for Pegasus compatability.
    // Remove when Pegasus is deprecated.
    // TODO: https://codedotorg.atlassian.net/browse/CMS-731
    icons: [
      {
        url: '/images/favicon.ico',
        href: '/images/favicon.ico',
      },
    ],
    ...getSeoMetadata(experience, brand, pageProps.locale),
  };
}
export default async function ExperiencePage({
  params,
  searchParams,
}: ExperiencePageProps) {
  const isDraftModeEnabled = (await draftMode()).isEnabled;
  const pageProps = await getPageProps({
    params,
    searchParams,
  });

  const {experience, error} = pageProps.experienceResult;

  if (error) {
    if (error.message.startsWith('No experience entry with slug')) {
      return notFound();
    }
    return <div>{error.message}</div>;
  }

  // extract the styles from the experience
  const stylesheet = experience ? detachExperienceStyles(experience) : null;

  // experience currently needs to be stringified manually to be passed to the component
  const experienceJSON = experience ? JSON.stringify(experience) : null;

  return (
    <main style={{width: '100%'}}>
      <Bootstrap locale={pageProps.locale} />
      <ContentEditorHelper isDraftModeEnabled={isDraftModeEnabled} />
      {stylesheet && <style>{stylesheet}</style>}
      <ExperiencePageLoader
        experienceJSON={experienceJSON}
        locale={pageProps.locale}
      />
    </main>
  );
}
