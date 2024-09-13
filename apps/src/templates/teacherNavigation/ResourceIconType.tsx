import styles from './lesson-materials.module.scss';

interface ResourceType {
  icon: string;
  class: string;
}

const makeObjectType = (icon: string, className: string): ResourceType => ({
  icon,
  class: className,
});

export const RESOURCE_TYPE = Object.freeze({
  SLIDES: makeObjectType('presentation-screen', styles.slides),
  LESSON_PLAN: makeObjectType('file-lines', styles.lessonPlan),
  LINK: makeObjectType('link-simple', styles.link),
  GOOGLE_DOC: makeObjectType('files', styles.files),
  VIDEO: makeObjectType('video', styles.video),
} as const);

export type ResourceTypeValues =
  (typeof RESOURCE_TYPE)[keyof typeof RESOURCE_TYPE];

export const ITEM_TYPE_SHAPE: ResourceTypeValues[] =
  Object.values(RESOURCE_TYPE);
