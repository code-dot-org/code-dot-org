/* A label or feature slot in the "Predict … based on …" sentence. */
import classNames from 'classnames';

import styles from './sentenceTag.module.scss';

interface SentenceTagProps {
  text: string | undefined;
  placeholder: string;
  variant: 'label' | 'feature';
  size?: 's' | 'm';
}

const SentenceTag = ({
  text,
  placeholder,
  variant,
  size = 's',
}: SentenceTagProps) => (
  <span
    aria-hidden="true"
    className={classNames(
      styles.tag,
      size === 'm' && styles.mediumTag,
      text ? styles[`${variant}Tag`] : styles.placeholderTag,
    )}
  >
    {text || placeholder}
  </span>
);

export default SentenceTag;
