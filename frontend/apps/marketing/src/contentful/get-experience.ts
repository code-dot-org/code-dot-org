import {fetchBySlug} from '@contentful/experiences-sdk-react';
import {draftMode} from 'next/headers';
import {cache} from 'react';

import {getLogger} from '@/logger';
import tracer from '@/otel/tracer';

import {getContentfulClient} from './client';

const logger = getLogger('contentful');

export const getExperience = cache(
  async (slug: string, localeCode: string, isEditorMode = false) => {
    return await tracer.withSpan('getExperienceFromContentful', async () => {
      // To make it easier for content editors, all slugs begin with `/` for experiences
      const contentfulSlug = `/${slug}`;
      const startTime = Date.now();

      return await getExperienceFromContentful(
        contentfulSlug,
        localeCode,
        isEditorMode,
      )
        .then(({experience, error}) => {
          const duration = Date.now() - startTime;

          logger.info(
            {
              operation: 'getExperience',
              slug: contentfulSlug,
              localeCode,
              duration,
            },
            `Successfully fetched SLUG=${contentfulSlug}, LOCALE=${localeCode}, IS_EDITOR_MODE=${isEditorMode} in ${duration}ms`,
          );

          return {experience, error};
        })
        .catch(error => {
          const duration = Date.now() - startTime;

          logger.error(
            {
              operation: 'getExperience',
              slug,
              localeCode,
              duration,
              error,
            },
            `Error fetching SLUG=${slug}, LOCALE=${localeCode}, IS_EDITOR_MODE=${isEditorMode} in ${duration}ms`,
          );

          throw error;
        });
    });
  },
);

/**
 * Calls Contentful to retrieve the experience content record
 * @param slug Page Slug
 * @param localeCode The locale code to fetch from
 * @param isEditorMode Whether the page is running in Experience Studio
 * @returns Experience content record and error if any
 */
const getExperienceFromContentful = async (
  slug: string,
  localeCode: string,
  isEditorMode = false,
) => {
  // While in editor mode, the experience is passed to the ExperienceRoot
  // component by the editor, so we don't fetch it here
  if (isEditorMode) {
    return {experience: undefined, error: undefined};
  }

  const {isEnabled} = await draftMode();
  const client = getContentfulClient(isEnabled);

  if (!client) {
    // The client will not be available if the environment variables for secrets are not set.
    // Rather than crashing the app, we log a warning and return undefined to allow Next.js to static
    // render the foundations of the page.
    return {experience: undefined, error: undefined};
  }

  let experience: Awaited<ReturnType<typeof fetchBySlug>> | undefined;

  try {
    experience = await fetchBySlug({
      client,
      slug,
      experienceTypeId: process.env.CONTENTFUL_EXPERIENCE_CONTENT_TYPE_ID!,
      localeCode,
    });
  } catch (error) {
    return {experience, error: error as Error};
  }

  return {experience, error: undefined};
};
