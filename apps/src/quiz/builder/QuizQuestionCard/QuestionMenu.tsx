import React from 'react';

import BuilderMenu, {BuilderMenuEntry} from '../BuilderMenu';

interface QuestionMenuProps {
  // Unique per instance; CustomDropdown uses it as the element id.
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  // The quiz's other pages, which the question can move to.
  otherPages: number[];
  // Why the question can't move to another page, if it can't.
  moveToPageDisabledReason?: string;
  // The card is saving or removing the question.
  isBusy: boolean;
  onMove: (offset: -1 | 1) => void;
  onMoveToPage: (page: number) => void;
  onRemove: () => void;
}

const QuestionMenu: React.FunctionComponent<QuestionMenuProps> = ({
  name,
  canMoveUp,
  canMoveDown,
  otherPages,
  moveToPageDisabledReason,
  isBusy,
  onMove,
  onMoveToPage,
  onRemove,
}) => {
  const moveToPage: BuilderMenuEntry[] =
    otherPages.length > 0
      ? [
          'separator',
          {groupLabel: 'Move to page'},
          ...otherPages.map(page => ({
            label: `Page ${page}`,
            ariaLabel: `Move to Page ${page}`,
            disabledReason: moveToPageDisabledReason,
            onClick: () => onMoveToPage(page),
          })),
        ]
      : [];
  return (
    <BuilderMenu
      name={name}
      label="Question options"
      disabled={isBusy}
      entries={[
        {
          iconName: 'arrow-up',
          label: 'Move question up',
          disabled: !canMoveUp,
          onClick: () => onMove(-1),
        },
        {
          iconName: 'arrow-down',
          label: 'Move question down',
          disabled: !canMoveDown,
          onClick: () => onMove(1),
        },
        ...moveToPage,
        'separator',
        {
          iconName: 'trash-can',
          label: 'Remove from quiz',
          destructive: true,
          onClick: onRemove,
        },
      ]}
    />
  );
};

export default QuestionMenu;
