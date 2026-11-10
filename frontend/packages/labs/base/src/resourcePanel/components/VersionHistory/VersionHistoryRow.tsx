import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import type {FunctionComponent, PropsWithChildren} from 'react';

import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import {BodyFourText} from '@code-dot-org/component-library/typography';

import {INITIAL_VERSION_ID} from '../../../constants';
import {AI_SAVED_COMMENT} from '../../../weblab2Constants';

import moduleStyles from './version-history-row.module.scss';

export interface VersionHistoryRowProps extends PropsWithChildren {
  versionId: string;
  label: string;
  isLatest: boolean;
  isSelected: boolean;
  comment?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  showRestoreButton: boolean;
  className?: string;
  alwaysShowAutoSaves?: boolean;
}

export interface RestoreVersionButtonProps {
  restoreOnClick: () => void;
  restoreLoading: boolean;
  restoreDisabled: boolean;
}

const VersionHistoryRow: FunctionComponent<
  VersionHistoryRowProps & RestoreVersionButtonProps
> = ({
  versionId,
  label,
  isLatest,
  isSelected,
  comment,
  onChange,
  disabled = false,
  children,
  showRestoreButton = false,
  restoreOnClick,
  restoreDisabled = false,
  restoreLoading = false,
  className,
  alwaysShowAutoSaves = false,
}) => {
  if (isLatest) {
    label = 'Current Version';
  }

  let ariaLabel;
  let isBoldtype = true;
  const isAiSaveComment = comment && comment === AI_SAVED_COMMENT;
  const classes = [];
  if (versionId === INITIAL_VERSION_ID) {
    classes.push(moduleStyles.initialVersionRow);
  } else if (isLatest) {
    // Note that the latest or most current version can also include a comment.
    // This styling adds the appropriate margin to a given row.
    classes.push(moduleStyles.currentVersionRow);
  } else if (comment && !isAiSaveComment) {
    classes.push(moduleStyles.commentRow);
    ariaLabel = 'Committed version';
  } else {
    classes.push(moduleStyles.row);
    ariaLabel = 'Autosaved version';
    isBoldtype = false;
  }
  if (isAiSaveComment) {
    classes.push(moduleStyles.aiSaveRow);
    ariaLabel = 'AI Version Save';
  }

  const showAutoSavedIcon =
    !alwaysShowAutoSaves && ariaLabel === 'Autosaved version';

  return (
    <div
      id={versionId}
      className={classNames(classes, moduleStyles.rowContainer, className)}
    >
      <div className={moduleStyles.versionContent}>
        <div className={moduleStyles.versionHeader}>
          <RadioButton
            className={moduleStyles.versionLabel}
            name={versionId}
            value={versionId}
            label={label}
            onChange={onChange}
            checked={isSelected}
            ariaLabel={ariaLabel}
            textThickness={isBoldtype ? 'thick' : 'thin'}
            disabled={disabled}
            size="s"
          />
          {showRestoreButton && (
            <Button
              className={moduleStyles.restoreButton}
              text="Restore"
              size="xs"
              type="secondary"
              color="gray"
              iconLeft={{
                iconName: 'arrow-rotate-left',
                iconStyle: 'solid',
              }}
              onClick={restoreOnClick}
              isPending={restoreLoading}
              disabled={restoreDisabled}
            />
          )}
          {isAiSaveComment && !showRestoreButton && (
            <Tooltip
              id={`${versionId}-ai-saved-tooltip`}
              title="AI Version Save"
              placement="bottom"
            >
              <span role="img" aria-label="AI Version Save">
                <FontAwesomeV6Icon
                  iconFamily="kit"
                  iconName="ai-head-solid"
                  className={moduleStyles.aiSaveIcon}
                />
              </span>
            </Tooltip>
          )}
          {showAutoSavedIcon && !showRestoreButton && (
            <Tooltip
              id={`${versionId}-autosaved-tooltip`}
              title="Autosaved version"
              placement="bottom"
            >
              <span role="img" aria-label="Autosaved version">
                <FontAwesomeV6Icon
                  iconName={'cloud-check'}
                  className={moduleStyles.autoSavedIcon}
                />
              </span>
            </Tooltip>
          )}
        </div>
        {children}
        {comment && !isAiSaveComment && (
          <BodyFourText className={moduleStyles.commitDescription} noMargin>
            {comment}
          </BodyFourText>
        )}
      </div>
    </div>
  );
};

export default VersionHistoryRow;
