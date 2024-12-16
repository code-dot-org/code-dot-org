import {fetchBySlug} from '@contentful/experiences-sdk-react';
import client from './client';

/**
 * Calls Contentful to retrieve the experience content record
 * @param slug Page Slug
 * @param localeCode The locale code to fetch from
 * @param isEditorMode Whether the page is running in Experience Studio
 * @returns Experience content record and error if any
 */
export const getExperience = async (
  slug: string,
  localeCode: string,
  isEditorMode = false,
) => {
  if (!client) {
    // The client will not be available if the environment variables for secrets are not set.
    // Rather than crashing the app, we log a warning and return undefined to allow Next.js to static
    // render the foundations of the page.
    return {experience: undefined, error: undefined};
  }

  // While in editor mode, the experience is passed to the ExperienceRoot
  // component by the editor, so we don't fetch it here
  if (isEditorMode) {
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
