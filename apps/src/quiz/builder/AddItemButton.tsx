import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button} from '@mui/material';
import React from 'react';

import styles from './add-item-button.module.scss';

interface AddItemButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// A full-width, dashed-outlined row for appending an item to a list -
// shared by "Add option" (AnswersTab) and each page's "Create question"
// (QuizBuilderWorkspace).
const AddItemButton: React.FunctionComponent<AddItemButtonProps> = ({
  label,
  onClick,
  disabled,
  loading,
}) => (
  <Button
    className={styles.addItem}
    variant="outlined"
    color="secondary"
    size="small"
    type="button"
    disabled={disabled}
    loading={loading}
    onClick={onClick}
    startIcon={<FontAwesomeV6Icon iconName="plus" />}
  >
    {label}
  </Button>
);

export default AddItemButton;
