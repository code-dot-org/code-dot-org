/**
 * Schema for an activity in the activity catalog. This is directly sourced from the Tutorial content type on Contentful.
 */
export const ActivitySchema = {
  title: 'string',
  image: 'string',
  organization: 'string',
  ages: 'string[]',
  languageProgramming: 'string[]',
  shortDescription: 'string',
  longDescription: 'string',
  primaryLinkRef: 'string',
  technologyClassroom: 'string[]',
  topic: 'string[]',
  activityType: 'string[]',
  length: 'string[]',
  accessibilitys: 'string[]',
  languagesText: 'string',
  standards: 'string',
  tutorialID: 'string',
  primaryButton: 'string',
} as const;
