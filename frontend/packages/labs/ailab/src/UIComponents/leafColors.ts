import styles from './leafColors.module.scss';

const LEAF_COLOR_CLASSES = [
  styles.leafColor0,
  styles.leafColor1,
  styles.leafColor2,
  styles.leafColor3,
  styles.leafColor4,
  styles.leafColor5,
  styles.leafColor6,
];

export function leafColorClass(answerIndex: number): string {
  return LEAF_COLOR_CLASSES[answerIndex % LEAF_COLOR_CLASSES.length];
}
