/* A label or feature slot in the "Predict … based on …" sentence. */
import {Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';

import styles from './sentenceTag.module.scss';

interface SentenceTagProps {
  text: string | undefined;
  placeholder: string;
  variant: 'label' | 'feature';
  size?: 's' | 'm';
  tooltip?: string;
}

const SentenceTag = ({
  text,
  placeholder,
  variant,
  size = 's',
  tooltip,
}: SentenceTagProps) => {
  const tag = (
    <Typography
      component="span"
      variant="body4"
      aria-hidden={tooltip ? undefined : 'true'}
      // Focusable so keyboard users can open the tooltip.
      tabIndex={tooltip ? 0 : undefined}
      className={classNames(
        styles.tag,
        size === 'm' && styles.mediumTag,
        text ? styles[`${variant}Tag`] : styles.placeholderTag,
      )}
    >
      {text || placeholder}
    </Typography>
  );

  return tooltip ? (
    <Tooltip title={tooltip} placement="top">
      {tag}
    </Tooltip>
  ) : (
    tag
  );
};

export default SentenceTag;
