/**
 * Schema for an activity in the activity catalog. This is directly sourced from the Tutorial content type on Contentful.
 */
export const ActivitySchema = {
  title: 'string',
  image: 'string',
  organization: 'string',
  ages: 'enum[]',
  languageProgramming: 'enum[]',
  shortDescription: 'string',
  longDescription: 'string',
  primaryLinkRef: 'string',
  technologyClassroom: 'enum[]',
  topic: 'enum[]',
  activityType: 'enum[]',
  length: 'enum[]',
  accessibilitys: 'enum[]',
  languagesText: 'string',
  standards: 'string',
  tutorialID: 'string',
  primaryButton: 'string',
  featuredPosition: 'number',
  sortKey: 'string',
} as const;
