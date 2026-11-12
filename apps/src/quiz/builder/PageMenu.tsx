import React from 'react';

import BuilderMenu from './BuilderMenu';

interface PageMenuProps {
  page: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  // Why the page can't be deleted, if it can't.
  deleteDisabledReason?: string;
  rearrangeDisabledReason?: string;
  onMove: (offset: -1 | 1) => void;
  // Adds an empty page that becomes page `page`.
  onAddPage: (page: number) => void;
  onDelete: () => void;
}

const PageMenu: React.FunctionComponent<PageMenuProps> = ({
  page,
  canMoveUp,
  canMoveDown,
  deleteDisabledReason,
  rearrangeDisabledReason,
  onMove,
  onAddPage,
  onDelete,
}) => (
  <BuilderMenu
    name={`page-menu-${page}`}
    label={`Page ${page} options`}
    disabledReason={rearrangeDisabledReason}
    entries={[
      {
        iconName: 'arrow-up',
        label: 'Move page up',
        disabled: !canMoveUp,
        onClick: () => onMove(-1),
      },
      {
        iconName: 'arrow-down',
        label: 'Move page down',
        disabled: !canMoveDown,
        onClick: () => onMove(1),
      },
      'separator',
      {
        iconName: 'arrow-up-to-line',
        label: 'Add page above',
        onClick: () => onAddPage(page),
      },
      {
        iconName: 'arrow-down-to-line',
        label: 'Add page below',
        onClick: () => onAddPage(page + 1),
      },
      'separator',
      {
        iconName: 'trash-can',
        label: 'Delete page',
        destructive: true,
        disabledReason: deleteDisabledReason,
        onClick: onDelete,
      },
    ]}
  />
);

export default PageMenu;
