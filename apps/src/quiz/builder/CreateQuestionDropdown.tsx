import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {buttonClasses, Tooltip} from '@mui/material';
import React from 'react';

import {QuizQuestionType} from '../types';

import {QUESTION_TYPE_LABELS_ICONS} from './constants';

import styles from './create-question-dropdown.module.scss';

interface CreateQuestionDropdownProps {
  // Unique per instance; ActionDropdown uses it as the element id.
  name: string;
  onCreate: (type: QuizQuestionType) => void;
  // contained for empty states, text inside a dashed add slot.
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  // When set, the trigger stays focusable and this reason is shown in a tooltip.
  disabledReason?: string;
  className?: string;
}

// ActionDropdown closes its menu through a context it doesn't share with
// CustomDropdown; a mousedown outside is what actually closes it.
function closeDropdown() {
  document.body.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
}

const CreateQuestionDropdown: React.FunctionComponent<
  CreateQuestionDropdownProps
> = ({
  name,
  onCreate,
  variant = 'contained',
  disabled,
  disabledReason,
  className,
}) => {
  const dropdown = (
    <ActionDropdown
      name={name}
      className={className}
      labelText="Create question"
      size="xs"
      disabled={!!disabled && !disabledReason}
      useIconButton={false}
      triggerButtonProps={{
        variant,
        color: variant === 'contained' ? 'primary' : 'secondary',
        size: 'extraSmall',
        startIcon: <FontAwesomeV6Icon iconName="plus" />,
        endIcon: <FontAwesomeV6Icon iconName="chevron-down" />,
        children: 'Create question',
        'aria-label': 'Create question',
        ...(disabledReason
          ? {
              'aria-disabled': true,
              className: buttonClasses.disabled,
              onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
              },
            }
          : {}),
      }}
      options={(
        Object.entries(QUESTION_TYPE_LABELS_ICONS) as [
          QuizQuestionType,
          (typeof QUESTION_TYPE_LABELS_ICONS)[QuizQuestionType]
        ][]
      ).map(([type, {label, iconName}]) => ({
        value: type,
        label,
        icon: {iconName},
        onClick: () => {
          onCreate(type);
          closeDropdown();
        },
      }))}
    />
  );

  if (!disabledReason) {
    return dropdown;
  }

  // Host wrapper carries hover: MUI's disabled look sets pointer-events: none.
  return (
    <Tooltip
      describeChild
      title={disabledReason}
      enterDelay={0}
      enterNextDelay={0}
    >
      <div className={styles.tooltipAnchor}>{dropdown}</div>
    </Tooltip>
  );
};

export default CreateQuestionDropdown;
