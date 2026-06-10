import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import sharedStyles from '../curriculum-generator.module.scss';

// Frame for a single editable row in an AI-generation card list. Owns
// the outer card + header (title slot, up/down icons, delete button);
// the body is whatever the caller renders as children, typically
// `<div className={sharedStyles.cardBody}>` with the per-page fields
// inside.

interface ReorderableCardProps {
  // Header content — typically an <h3>. Pages render their own heading
  // because the prefix/badges/labels differ per scope.
  title: React.ReactNode;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  // Tooltip on the delete button. Defaults to the generic "Remove
  // <itemLabel>"; pages can override to warn that the underlying row
  // will be destroyed on save.
  removeTitle?: string;
  removeAriaLabel?: string;
  disabled?: boolean;
  // Extra class on the card root, e.g. for the "unsupported lab type"
  // variant the lesson generator renders read-only.
  cardClassName?: string;
  children: React.ReactNode;
}

const ReorderableCard: React.FC<ReorderableCardProps> = ({
  title,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  removeTitle = 'Remove',
  removeAriaLabel = 'Remove',
  disabled = false,
  cardClassName,
  children,
}) => (
  <div className={classNames(sharedStyles.card, cardClassName)}>
    <div className={sharedStyles.cardHeader}>
      {title}
      <button
        type="button"
        className={sharedStyles.iconButton}
        onClick={onMoveUp}
        disabled={disabled || !canMoveUp}
        aria-label="Move up"
        title="Move up"
      >
        <FontAwesomeV6Icon iconName="arrow-up" />
      </button>
      <button
        type="button"
        className={sharedStyles.iconButton}
        onClick={onMoveDown}
        disabled={disabled || !canMoveDown}
        aria-label="Move down"
        title="Move down"
      >
        <FontAwesomeV6Icon iconName="arrow-down" />
      </button>
      <button
        type="button"
        className={sharedStyles.deleteButton}
        onClick={onRemove}
        disabled={disabled}
        aria-label={removeAriaLabel}
        title={removeTitle}
      >
        <FontAwesomeV6Icon iconName="trash" />
      </button>
    </div>
    {children}
  </div>
);

export default ReorderableCard;
