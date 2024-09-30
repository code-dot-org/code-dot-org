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
  STANDARDS: makeObjectType('files', styles.files),
  VOCABULARY: makeObjectType('files', styles.files),
} as const);
