export interface Activity {
  title: string;
  image: string;
  organization: string;
  ages: string[];
  languageProgramming: string[];
  shortDescription: string;
  longDescription: string;
  primaryLinkRef: string;
  technologyClassroom: string[];
  topic: string[];
  activityType: string[];
  length: string[];
  accessibilitys: string[];
  languagesText: string;
  standards: string;
  tutorialID: string;
}

export enum ActivityType {
  HOUR_OF_AI = 'hour-of-ai',
  HOUR_OF_CODE = 'hour-of-code',
}

export const ValidActivityTypes = new Set(Object.values(ActivityType));
