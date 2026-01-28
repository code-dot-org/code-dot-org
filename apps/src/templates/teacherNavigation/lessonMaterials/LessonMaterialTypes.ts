import {isGDocsUrl} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

export type Lesson = {
  name: string;
  id: number;
  position: number;
  lessonPlanHtmlUrl: string;
  lessonPlanPdfUrl: string;
  standardsUrl: string;
  vocabularyUrl: string;
  resources: {
    Teacher: Resource[];
    Student: Resource[];
  };
  hasLessonPlan: boolean;
  isLockable: boolean;
};

export type Resource = {
  key: string;
  name?: string;
  // custom resources use 'title' instead of 'name'
  title?: string;
  url?: string;
  downloadUrl?: string;
  audience?: string;
  type: string;
};

export type MaterialType =
  | 'SLIDES'
  | 'GOOGLE_DOC'
  | 'VIDEO'
  | 'LESSON_PLAN'
  | 'STANDARDS'
  | 'VOCABULARY'
  | 'LINK'
  | 'CUSTOM';

export const CUSTOM_RESOURCE_TYPES = ['AidiffExitTicket', 'AidiffLessonHook'];

export const computeMaterialType = (
  resourceType: string,
  resourceUrl: string
): MaterialType => {
  if (isGDocsUrl(resourceUrl)) {
    if (resourceType === 'Slides') {
      return 'SLIDES';
    } else {
      return 'GOOGLE_DOC';
    }
  } else if (resourceType?.includes('Video')) {
    return 'VIDEO';
  } else if (resourceType === 'Lesson Plan') {
    return 'LESSON_PLAN';
  } else if (resourceType === 'Standards') {
    return 'STANDARDS';
  } else if (resourceType === 'Vocabulary') {
    return 'VOCABULARY';
  } else if (CUSTOM_RESOURCE_TYPES.includes(resourceType)) {
    return 'CUSTOM';
  } else {
    return 'LINK';
  }
};

export type AudioSummaryTranscriptLine = {
  timeStamp: string;
  text: string;
};
