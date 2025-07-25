'use client';
import {ExperienceRoot} from '@contentful/experiences-sdk-react';

import {Brand} from '@/config/brand';
import {registerContentfulComponents} from '@/contentful/registration';

type ExperiencePageLoaderProps = {
  experienceJSON: string | null;
  locale: string;
  brand: Brand;
};

/**
 * This is a client-side component layer that registers Contentful custom components prior to the
 * instantiation of the Contentful ExperienceRoot component. Custom components must be mapped client-side prior to ExperienceRoot
 * being mounted.
 */
export default function ExperiencePageLoader({
  experienceJSON,
  locale,
  brand,
}: ExperiencePageLoaderProps) {
  registerContentfulComponents(brand);
  return <ExperienceRoot experience={experienceJSON} locale={locale} />;
}
