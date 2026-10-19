import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {QuizQuestionType} from '../types';

import {QUESTION_TYPE_LABELS_ICONS} from './constants';

interface CreateQuestionDropdownProps {
  // Unique per instance; ActionDropdown uses it as the element id.
  name: string;
  onCreate: (type: QuizQuestionType) => void;
  // contained for the empty state, text inside a page's dashed add row.
  variant?: 'contained' | 'text';
  disabled?: boolean;
  className?: string;
}

// ActionDropdown closes its menu through a context it doesn't share with
// CustomDropdown; a mousedown outside is what actually closes it.
function closeDropdown() {
  document.body.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
}

const CreateQuestionDropdown: React.FunctionComponent<
  CreateQuestionDropdownProps
> = ({name, onCreate, variant = 'contained', disabled, className}) => (
  <ActionDropdown
    name={name}
    className={className}
    labelText="Create question"
    size="xs"
    disabled={disabled}
    useIconButton={false}
    triggerButtonProps={{
      variant,
      color: variant === 'contained' ? 'primary' : 'secondary',
      size: 'extraSmall',
      startIcon: <FontAwesomeV6Icon iconName="plus" />,
      endIcon: <FontAwesomeV6Icon iconName="chevron-down" />,
      children: 'Create question',
      'aria-label': 'Create question',
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

export default CreateQuestionDropdown;
