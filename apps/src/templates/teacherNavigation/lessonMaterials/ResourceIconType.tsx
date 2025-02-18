import styles from './lesson-materials.module.scss';

interface ResourceIcon {
  icon: string;
  class: string;
}

const makeObjectType = (icon: string, className: string): ResourceIcon => ({
  icon,
  class: className,
});

export const RESOURCE_ICONS = Object.freeze({
  SLIDES: makeObjectType('presentation-screen', styles.slides),
  LESSON_PLAN: makeObjectType('file-lines', styles.lessonPlan),
  LINK: makeObjectType('link-simple', styles.link),
  GOOGLE_DOC: makeObjectType('files', styles.files),
  VIDEO: makeObjectType('video', styles.video),
  STANDARDS: makeObjectType('files', styles.files),
  VOCABULARY: makeObjectType('files', styles.files),
} as const);
