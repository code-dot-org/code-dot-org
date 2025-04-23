// Register custom components server-side
import '@/contentful/register-custom-components';

import {detachExperienceStyles} from '@contentful/experiences-sdk-react';
import {Metadata} from 'next';
import {draftMode} from 'next/headers';

import FontLoader from '@code-dot-org/fonts/FontLoader';

import {Brand} from '@/config/brand';
import ExperiencePageLoader from '@/contentful/components/ExperiencePageLoader';
import {getExperience} from '@/contentful/get-experience';
import {getSeoMetadata} from '@/metadata/seo';
import {getPageHeading} from '@/selectors/contentful/getExperienceEntryFields';

export const dynamic = 'force-static'; // Ensure ISR is enabled
export const revalidate = 600; // Cache for five minutes until on-demand revalidation works

type ExperiencePageProps = {
  params: Promise<{locale?: string; slug?: string; brand?: Brand}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};

async function getPageProps({params, searchParams}: ExperiencePageProps) {
  const {locale = 'en-US', slug = 'home-page'} = (await params) || {};
  const isDraftModeEnabled = (await draftMode()).isEnabled;

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
    ...getSeoMetadata(experience, brand, pageProps.locale),
  };
}
export default async function ExperiencePage({
  params,
  searchParams,
}: ExperiencePageProps) {
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
      <FontLoader locale={pageProps.locale} />
      {stylesheet && <style>{stylesheet}</style>}
      <ExperiencePageLoader
        experienceJSON={experienceJSON}
        locale={pageProps.locale}
      />
    </main>
  );
}
