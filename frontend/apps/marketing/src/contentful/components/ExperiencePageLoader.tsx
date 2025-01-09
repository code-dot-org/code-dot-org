'use client';
// Register custom components client-side
import '@/contentful/register-custom-components';
import {ExperienceRoot} from '@contentful/experiences-sdk-react';

type ExperiencePageLoaderProps = {
  experienceJSON: string | null;
  locale: string;
};

/**
 * This is a client-side component layer that registers Contentful custom components prior to the
 * instantiation of the Contentful ExperienceRoot component. Custom components must be mapped client-side prior to ExperienceRoot
 * being mounted.
 */
export default function ExperiencePageLoader({
  experienceJSON,
  locale,
}: ExperiencePageLoaderProps) {
  return <ExperienceRoot experience={experienceJSON} locale={locale} />;
}
