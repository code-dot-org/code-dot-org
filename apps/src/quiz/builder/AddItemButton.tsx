import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button} from '@mui/material';
import React from 'react';

import styles from './add-item-button.module.scss';

interface AddItemButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const AddItemButton: React.FunctionComponent<AddItemButtonProps> = ({
  label,
  onClick,
  disabled,
}) => (
  <div className={styles.addItem}>
    <Button
      variant="text"
      color="secondary"
      size="extraSmall"
      type="button"
      disabled={disabled}
      onClick={onClick}
      startIcon={<FontAwesomeV6Icon iconName="plus" />}
    >
      {label}
    </Button>
  </div>
);

export default AddItemButton;
