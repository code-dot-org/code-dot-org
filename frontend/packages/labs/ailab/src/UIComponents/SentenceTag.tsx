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
  const className = classNames(
    styles.tag,
    size === 'm' && styles.mediumTag,
    text ? styles[`${variant}Tag`] : styles.placeholderTag,
  );

  if (!tooltip) {
    return (
      <Typography
        component="span"
        variant="body4"
        aria-hidden="true"
        className={className}
      >
        {text || placeholder}
      </Typography>
    );
  }

  return (
    <Tooltip title={tooltip} placement="top" describeChild>
      <Typography
        component="span"
        tabIndex={0}
        variant="body4"
        className={className}
      >
        {text || placeholder}
      </Typography>
    </Tooltip>
  );
};

export default SentenceTag;
