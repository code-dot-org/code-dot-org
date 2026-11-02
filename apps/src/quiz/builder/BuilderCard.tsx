import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, IconButton, Tooltip, Typography} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import styles from './builder-card.module.scss';

export interface BuilderCardProps {
  iconName: string;
  name: string;
  preview: string;
  // Lowercase noun for the toggle's aria-label, e.g. "question".
  itemLabel: string;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  isDirty: boolean;
  isSaving: boolean;
  isRemoving: boolean;
  error?: string | null;
  onSave: () => void;
  onDiscard: () => void;
  onRemove: () => void;
  // When set, Remove looks disabled but stays focusable to show this tooltip.
  cannotRemoveReason?: string;
  children: React.ReactNode;
}

const BuilderCard: React.FunctionComponent<BuilderCardProps> = ({
  iconName,
  name,
  preview,
  itemLabel,
  isExpanded,
  onExpandedChange,
  isDirty,
  isSaving,
  isRemoving,
  error,
  onSave,
  onDiscard,
  onRemove,
  cannotRemoveReason,
  children,
}) => {
  const isBusy = isSaving || isRemoving;
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const wasExpanded = useRef(isExpanded);

  // Collapsing after a save unmounts the focused Save button.
  useEffect(() => {
    const active = document.activeElement;
    const focusLost =
      !active || active === document.body || !active.isConnected;
    if (wasExpanded.current && !isExpanded && focusLost) {
      toggleButtonRef.current?.focus();
    }
    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerPreview}>
          <FontAwesomeV6Icon iconName={iconName} className={styles.typeIcon} />
          <Typography variant="strong" component="span">
            {name}
          </Typography>
          <Typography
            variant="body3"
            component="span"
            className={styles.preview}
          >
            {preview}
          </Typography>
        </div>
        {isDirty && (
          <Tooltip title="Unsaved changes">
            <div className={styles.unsavedBadge} aria-label="Unsaved changes">
              <FontAwesomeV6Icon
                iconName="triangle-exclamation"
                iconStyle="solid"
              />
            </div>
          </Tooltip>
        )}
        <IconButton
          ref={toggleButtonRef}
          aria-label={
            isExpanded ? `Collapse ${itemLabel}` : `Edit ${itemLabel}`
          }
          aria-expanded={isExpanded}
          size="extraSmall"
          variant="outlined"
          color="secondary"
          type="button"
          onClick={() => onExpandedChange(!isExpanded)}
        >
          <FontAwesomeV6Icon
            iconName={isExpanded ? 'chevron-up' : 'pen-to-square'}
          />
        </IconButton>
      </div>

      {isExpanded && (
        <>
          {children}

          {error && (
            <Alert
              type="danger"
              size="xs"
              text={error}
              className={styles.saveError}
            />
          )}

          <div className={styles.footer}>
            <Tooltip describeChild title={cannotRemoveReason ?? ''}>
              <Button
                variant="outlined"
                color="error"
                size="extraSmall"
                type="button"
                className={styles.ariaDisabled}
                disabled={isBusy}
                aria-disabled={!!cannotRemoveReason}
                loading={isRemoving}
                onClick={() => !cannotRemoveReason && onRemove()}
              >
                Remove from quiz
              </Button>
            </Tooltip>
            <div className={styles.footerActions}>
              <Button
                variant="outlined"
                color="secondary"
                size="extraSmall"
                type="button"
                disabled={isBusy || !isDirty}
                onClick={onDiscard}
              >
                Discard changes
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="extraSmall"
                type="button"
                disabled={isBusy || !isDirty}
                loading={isSaving}
                onClick={onSave}
                startIcon={
                  <FontAwesomeV6Icon iconName="save" iconStyle="solid" />
                }
              >
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuilderCard;
