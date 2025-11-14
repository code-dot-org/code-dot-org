import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import {INITIAL_VERSION_ID} from '@cdo/apps/lab2/constants';
import lab2I18n from '@cdo/apps/lab2/locale';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './version-history-row.module.scss';

interface VersionHistoryRowProps {
  versionId: string;
  label: string;
  isLatest: boolean;
  isSelected: boolean;
  comment?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const VersionHistoryRow: React.FunctionComponent<VersionHistoryRowProps> = ({
  versionId,
  label,
  isLatest,
  isSelected,
  comment,
  onChange,
  disabled = false,
}) => {
  if (isLatest) {
    label = commonI18n.currentVersion();
  }

  let rowMarginStyle, ariaLabel;
  let isBoldtype = true;
  if (versionId === INITIAL_VERSION_ID) {
    rowMarginStyle = moduleStyles.initialVersionRow;
  } else if (isLatest) {
    // Note that the latest or most current version can also include a comment.
    // This styling adds the appropriate margin to a given row.
    rowMarginStyle = moduleStyles.currentVersionRow;
  } else if (comment) {
    rowMarginStyle = moduleStyles.commentRow;
    ariaLabel = lab2I18n.committedVersion();
  } else {
    rowMarginStyle = moduleStyles.row;
    ariaLabel = lab2I18n.autosavedVersion();
    isBoldtype = false;
  }

  return (
    <div
      id={versionId}
      className={classNames(moduleStyles.rowContainer, rowMarginStyle)}
    >
      <div className={moduleStyles.versionContent}>
        <div className={moduleStyles.versionHeader}>
          <RadioButton
            name={versionId}
            value={versionId}
            label={label}
            onChange={onChange}
            checked={isSelected}
            ariaLabel={ariaLabel}
            textThickness={isBoldtype ? 'thick' : 'thin'}
            disabled={disabled}
          />
          {ariaLabel === lab2I18n.autosavedVersion() && (
            <WithTooltip
              tooltipProps={{
                text: lab2I18n.autosavedVersion(),
                size: 's',
                tooltipId: `${versionId}-tooltip`,
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
        {comment && (
          <BodyFourText className={moduleStyles.commitDescription}>
            {comment}
          </BodyFourText>
        )}
      </div>
    </div>
  );
};

export default VersionHistoryRow;
