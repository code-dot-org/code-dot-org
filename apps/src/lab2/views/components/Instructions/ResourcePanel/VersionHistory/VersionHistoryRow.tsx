import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import {INITIAL_VERSION_ID} from '@cdo/apps/lab2/constants';
import lab2I18n from '@cdo/apps/lab2/locale';
import {commonI18n} from '@cdo/apps/types/locale';
import {AI_SAVED_COMMENT} from '@cdo/apps/weblab2/constants';

import moduleStyles from './version-history-row.module.scss';

interface VersionHistoryRowProps {
  versionId: string;
  label: string;
  isLatest: boolean;
  isSelected: boolean;
  comment?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  showRestoreButton: boolean;
  className?: string;
  alwaysShowAutoSaves?: boolean;
}

interface RestoreVersionButtonProps {
  restoreOnClick: () => void;
  restoreLoading: boolean;
  restoreDisabled: boolean;
}

const VersionHistoryRow: React.FunctionComponent<
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
    label = commonI18n.currentVersion();
  }

  let ariaLabel;
  let isBoldtype = true;
  let aiSavedComment;
  if (comment && comment === AI_SAVED_COMMENT) {
    aiSavedComment = comment; // Display AI saved versions without a comment if no user description was added.
  } else if (comment && comment.startsWith(AI_SAVED_COMMENT)) {
    aiSavedComment = comment.slice(AI_SAVED_COMMENT.length);
  }
  const classes = [];
  if (versionId === INITIAL_VERSION_ID) {
    classes.push(moduleStyles.initialVersionRow);
  } else if (isLatest) {
    // Note that the latest or most current version can also include a comment.
    // This styling adds the appropriate margin to a given row.
    classes.push(moduleStyles.currentVersionRow);
  } else if (comment && aiSavedComment) {
    classes.push(moduleStyles.commentRow);
    ariaLabel = lab2I18n.committedVersion();
  } else {
    classes.push(moduleStyles.row);
    ariaLabel = lab2I18n.autosavedVersion();
    isBoldtype = false;
  }
  if (aiSavedComment) {
    classes.push(moduleStyles.aiSaveRow);
    ariaLabel = aiSavedComment;
  }

  const showAutoSavedIcon =
    !alwaysShowAutoSaves && ariaLabel === lab2I18n.autosavedVersion();

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
              text={commonI18n.restore()}
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
          {aiSavedComment && !showRestoreButton && (
            <WithTooltip
              tooltipProps={{
                text: 'AI Version Save',
                size: 's',
                tooltipId: `${versionId}-ai-saved-tooltip`,
                direction: 'onBottom',
              }}
            >
              <FontAwesomeV6Icon
                iconFamily="kit"
                iconName="ai-head-solid"
                className={moduleStyles.aiSaveIcon}
              />
            </WithTooltip>
          )}
          {showAutoSavedIcon && !showRestoreButton && (
            <WithTooltip
              tooltipProps={{
                text: lab2I18n.autosavedVersion(),
                size: 's',
                tooltipId: `${versionId}-autosaved-tooltip`,
                direction: 'onBottom',
              }}
            >
              <FontAwesomeV6Icon
                iconName={'cloud-check'}
                className={moduleStyles.autoSavedIcon}
              />
            </WithTooltip>
          )}
        </div>
        {children}
        {comment !== AI_SAVED_COMMENT && // Display comment only if user description is included.
          (aiSavedComment || comment) && (
            <BodyFourText className={moduleStyles.commitDescription} noMargin>
              {aiSavedComment || comment}
            </BodyFourText>
          )}
      </div>
    </div>
  );
};

export default VersionHistoryRow;
