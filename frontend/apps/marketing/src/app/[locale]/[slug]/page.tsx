import {detachExperienceStyles} from '@contentful/experiences-sdk-react';
import {getExperience} from '@/contentful/get-experience';
import ExperiencePageLoader from '@/contentful/components/ExperiencePageLoader';

// Register custom components server-side
import '@/contentful/register-custom-components';
import classNames from 'classnames';
import {FONT_VARIABLES_BY_LOCALE} from '@/config/fonts';

type ExperiencePageProps = {
  params: Promise<{locale?: string; slug?: string; preview?: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};

export default async function ExperiencePage({
  params,
  searchParams,
}: ExperiencePageProps) {
  const {locale = 'en-US', slug = 'home-page'} = (await params) || {};
  const {expEditorMode} = await searchParams;
  const editorMode = expEditorMode === 'true';
  const {experience, error} = await getExperience(slug, locale, editorMode);

  if (error) {
    return <div>{error.message}</div>;
  }

  const fontVariables = FONT_VARIABLES_BY_LOCALE[locale];
  // extract the styles from the experience
  const stylesheet = experience ? detachExperienceStyles(experience) : null;

  // experience currently needs to be stringified manually to be passed to the component
  const experienceJSON = experience ? JSON.stringify(experience) : null;
  return (
    <main style={{width: '100%'}} className={classNames(fontVariables)}>
      {stylesheet && <style>{stylesheet}</style>}
      <ExperiencePageLoader experienceJSON={experienceJSON} locale={locale} />
    </main>
  );
}
