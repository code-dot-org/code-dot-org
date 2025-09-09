import {RadioButton} from '@code-dot-org/component-library/radioButton';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './version-history-panel.module.scss';

interface VersionHistoryRowProps {
  versionId: string;
  label: string;
  isLatest: boolean;
  isSelected: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VersionHistoryRow: React.FunctionComponent<VersionHistoryRowProps> = ({
  versionId,
  label,
  isLatest,
  isSelected,
  onChange,
}) => {
  if (isLatest) {
    label = commonI18n.currentVersion();
  }
  return (
    <div id={versionId} className={moduleStyles.rowContainer}>
      <RadioButton
        name={versionId}
        value={versionId}
        label={label}
        onChange={onChange}
        checked={isSelected}
        className={moduleStyles.row}
      />
    </div>
  );
};

export default VersionHistoryRow;
