// Register custom components server-side
import '@/contentful/register-custom-components';

import {detachExperienceStyles} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';
import {draftMode} from 'next/headers';

import Bootstrap from '@/bootstrap';
import ContentEditorHelper from '@/components/contentEditorHelper';
import {Brand} from '@/config/brand';
import ExperiencePageLoader from '@/contentful/components/ExperiencePageLoader';
import {getExperience} from '@/contentful/get-experience';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';
import {getSeoMetadata} from '@/metadata/seo';
import {getPageHeading} from '@/selectors/contentful/getExperienceEntryFields';

export const revalidate = 3600; // Cache for one hour

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
  const {locale = 'en-US', paths = ['home']} = (await params) || {};
  const isDraftModeEnabled = (await draftMode()).isEnabled;

  const slug = getContentfulSlug(paths);

  return {
    experienceResult: await getExperience(
      slug,
      locale,
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
