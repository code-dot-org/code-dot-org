import {RadioButton} from '@code-dot-org/component-library/radioButton';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import React from 'react';

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

  return (
    <div id={versionId} className={moduleStyles.rowContainer}>
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
