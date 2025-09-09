import {RadioButton} from '@code-dot-org/component-library/radioButton';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {INITIAL_VERSION_ID} from '@cdo/apps/lab2/constants';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './version-history-panel.module.scss';

interface VersionHistoryRowProps {
  versionId: string;
  label: string;
  isLatest: boolean;
  isSelected: boolean;
  commitDescription?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VersionHistoryRow: React.FunctionComponent<VersionHistoryRowProps> = ({
  versionId,
  label,
  isLatest,
  isSelected,
  commitDescription,
  onChange,
}) => {
  if (isLatest) {
    label = commonI18n.currentVersion();
  }
  const isBoldType = versionId === INITIAL_VERSION_ID || isLatest;
  // TODO: Remove this console.log when prop is added to RadioButton.
  console.log('isBoldType', isBoldType);
  if (isBoldType) {
    commitDescription =
      'Fixed issue with text overflow in containers and buttons not linking properly.';
  }
  return (
    <div id={versionId} className={moduleStyles.rowContainer}>
      <div className={moduleStyles.versionContent}>
        <RadioButton
          name={versionId}
          value={versionId}
          label={label}
          onChange={onChange}
          checked={isSelected}
          className={isBoldType ? moduleStyles.boldType : ''}
        />
        {commitDescription && (
          <BodyFourText className={moduleStyles.commitDescription}>
            {commitDescription}
          </BodyFourText>
        )}
      </div>
    </div>
  );
};

export default VersionHistoryRow;
