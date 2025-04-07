import {Experience} from '@contentful/experiences-sdk-react';

export function getExperienceEntryFieldsFromExperience(
  experience: Experience | undefined,
) {
  return experience?.entityStore?.experienceEntryFields;
}

export function getSeoMetadataEntryFromExperience(
  experience: Experience | undefined,
) {
  return getExperienceEntryFieldsFromExperience(experience)?.seoMetadata;
}

export function getSeoMetadataFromExperience(
  experience: Experience | undefined,
) {
  return getSeoMetadataEntryFromExperience(experience)?.fields;
}

export function getPageHeading(experience: Experience | undefined) {
  return getExperienceEntryFieldsFromExperience(experience)?.pageHeading;
}
