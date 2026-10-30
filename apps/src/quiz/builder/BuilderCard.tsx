import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

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
  // Nested in a page: item radius. Root / intro: block radius.
  nested?: boolean;
  showCollapsedRemove?: boolean;
  // A new question that has not been posted yet: no Remove, Discard deletes it.
  neverSaved?: boolean;
  clampName?: boolean;
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
  nested = false,
  showCollapsedRemove = false,
  neverSaved = false,
  clampName = true,
  children,
}) => {
  const isBusy = isSaving || isRemoving;
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const wasExpanded = useRef(isExpanded);
  const [hoverSuppressed, setHoverSuppressed] = useState(false);

  // Collapsing after a save unmounts the focused Save button.
  useEffect(() => {
    const active = document.activeElement;
    const focusLost =
      !active || active === document.body || !active.isConnected;
    if (wasExpanded.current && !isExpanded && focusLost) {
      toggleButtonRef.current?.focus();
    }
    if (wasExpanded.current && !isExpanded) {
      setHoverSuppressed(true);
    }
    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  return (
    <div
      className={classNames(
        styles.card,
        nested && styles.cardNested,
        hoverSuppressed && styles.hoverSuppressed
      )}
      onPointerLeave={() => setHoverSuppressed(false)}
    >
      <div className={styles.header}>
        <div className={styles.leading}>
          <span className={styles.typeIcon} aria-hidden>
            <FontAwesomeV6Icon iconName={iconName} />
          </span>
          <div className={styles.preview}>
            <Typography
              variant="body3"
              component="span"
              className={classNames(styles.name, clampName && styles.nameClamp)}
            >
              {name}
            </Typography>
            {preview ? (
              <>
                <span className={styles.dot} aria-hidden />
                <Typography
                  variant="body3"
                  component="span"
                  className={styles.peek}
                >
                  {preview}
                </Typography>
              </>
            ) : null}
          </div>
        </div>
        <div className={styles.actions}>
          {showCollapsedRemove && !isExpanded && (
            <span className={styles.hoverAction}>
              <Tooltip
                title={neverSaved ? 'Discard question' : 'Remove from quiz'}
              >
                <IconButton
                  aria-label={
                    neverSaved ? 'Discard question' : 'Remove from quiz'
                  }
                  size="extraSmall"
                  variant="text"
                  color="error"
                  type="button"
                  disabled={isBusy}
                  loading={isRemoving}
                  onClick={neverSaved ? onDiscard : onRemove}
                >
                  <FontAwesomeV6Icon iconName="trash" />
                </IconButton>
              </Tooltip>
            </span>
          )}
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
            color="tertiary"
            type="button"
            onClick={() => onExpandedChange(!isExpanded)}
          >
            <FontAwesomeV6Icon
              iconName={isExpanded ? 'chevron-up' : 'pen-to-square'}
            />
          </IconButton>
        </div>
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
            {!neverSaved && (
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
            )}
            <div className={styles.footerActions}>
              <Button
                variant="outlined"
                color={neverSaved ? 'error' : 'secondary'}
                size="extraSmall"
                type="button"
                disabled={isBusy || !isDirty}
                loading={neverSaved ? isRemoving : false}
                onClick={onDiscard}
              >
                {neverSaved ? 'Discard' : 'Discard changes'}
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
                  isSaving ? undefined : (
                    <FontAwesomeV6Icon iconName="save" iconStyle="solid" />
                  )
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
