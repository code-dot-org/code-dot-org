import {RadioButton} from '@code-dot-org/component-library/radioButton';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import {INITIAL_VERSION_ID} from '@cdo/apps/lab2/constants';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './version-history-panel.module.scss';

interface VersionHistoryRowProps {
  versionId: string;
  label: string;
  isLatest: boolean;
  isSelected: boolean;
  comment?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VersionHistoryRow: React.FunctionComponent<VersionHistoryRowProps> = ({
  versionId,
  label,
  isLatest,
  isSelected,
  comment,
  onChange,
}) => {
  if (isLatest) {
    label = commonI18n.currentVersion();
  }

  let rowMarginStyle;
  if (versionId === INITIAL_VERSION_ID) {
    rowMarginStyle = moduleStyles.isInitialVersionRow;
  } else if (isLatest) {
    rowMarginStyle = moduleStyles.isCurrentVersionRow;
  } else if (comment) {
    rowMarginStyle = moduleStyles.isCommentRow;
  } else {
    rowMarginStyle = moduleStyles.isRow;
  }

  return (
    <div
      id={versionId}
      className={classNames(moduleStyles.rowContainer, rowMarginStyle)}
    >
      <div className={moduleStyles.versionContent}>
        <RadioButton
          name={versionId}
          value={versionId}
          label={label}
          onChange={onChange}
          checked={isSelected}
        />
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
