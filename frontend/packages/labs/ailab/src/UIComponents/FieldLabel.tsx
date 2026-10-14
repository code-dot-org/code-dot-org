/* Visible label for a Train panel field, with an info tooltip. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';

import styles from './fieldLabel.module.scss';

interface FieldLabelProps {
  text: string;
  tooltip: string;
}

const FieldLabel = ({text, tooltip}: FieldLabelProps) => (
  <div className={styles.fieldLabel}>
    <Typography
      component="span"
      variant="body4"
      className={styles.text}
      aria-hidden="true"
    >
      {text}
    </Typography>
    <Tooltip title={tooltip}>
      <IconButton
        variant="text"
        color="tertiary"
        size="extraSmall"
        className={styles.infoButton}
        aria-label={`About ${text}`}
      >
        <FontAwesomeV6Icon iconName="circle-info" iconStyle="solid" />
      </IconButton>
    </Tooltip>
  </div>
);

export default FieldLabel;
