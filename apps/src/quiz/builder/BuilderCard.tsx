import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import UnsavedBadge from './UnsavedBadge';

import styles from './builder-card.module.scss';
import rowStyles from './outline-row.module.scss';

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
  // A question inside a page: tighter corners and a clamped name.
  nested?: boolean;
  neverSaved?: boolean;
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
  neverSaved = false,
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
    <div className={classNames(styles.card, nested && styles.cardNested)}>
      <div className={classNames(rowStyles.header, styles.header)}>
        <div className={styles.leading}>
          <span className={styles.typeIcon} aria-hidden>
            <FontAwesomeV6Icon iconName={iconName} />
          </span>
          <div className={rowStyles.summary}>
            <Typography
              variant="body3"
              component="span"
              className={classNames(
                rowStyles.title,
                nested && styles.nameClamp
              )}
            >
              {name}
            </Typography>
            {preview ? (
              <>
                <span className={rowStyles.dot} aria-hidden />
                <Typography
                  variant="body3"
                  component="span"
                  className={rowStyles.detail}
                >
                  {preview}
                </Typography>
              </>
            ) : null}
          </div>
        </div>
        <div className={rowStyles.actions}>
          {isDirty && <UnsavedBadge label="Unsaved changes" />}
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
                onClick={neverSaved ? onRemove : onDiscard}
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
