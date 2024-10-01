import {isGDocsUrl} from '@cdo/apps/templates/lessonOverview/googleDocsUtils';

export type Lesson = {
  name: string;
  id: number;
  position: number;
  lessonPlanHtmlUrl: string;
  standardsUrl: string;
  vocabularyUrl: string;
  resources: {
    Teacher: Resource[];
    Student: Resource[];
  };
};

export type Resource = {
  key: string;
  name: string;
  url: string;
  downloadUrl?: string;
  audience: string;
  type: string;
};

export type MaterialType =
  | 'SLIDES'
  | 'GOOGLE_DOC'
  | 'VIDEO'
  | 'LESSON_PLAN'
  | 'STANDARDS'
  | 'VOCABULARY'
  | 'LINK';

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
  } else if (resourceType === 'Video') {
    return 'VIDEO';
  } else if (resourceType === 'Lesson Plan') {
    return 'LESSON_PLAN';
  } else if (resourceType === 'Standards') {
    return 'STANDARDS';
  } else if (resourceType === 'Vocabulary') {
    return 'VOCABULARY';
  } else {
    return 'LINK';
  }
};
