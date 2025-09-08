import {RadioButton} from '@code-dot-org/component-library/radioButton';
import Tags from '@code-dot-org/component-library/tags';
import React from 'react';

import {ProjectVersion} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './version-history-panel.module.scss';

interface VersionHistoryRowProps {
  version?: ProjectVersion;
  versionId: string;
  label: string;
  isLatest: boolean;
  isSelected: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VersionHistoryRow: React.FunctionComponent<VersionHistoryRowProps> = ({
  version,
  versionId,
  label,
  isLatest,
  isSelected,
  onChange,
}) => {
  const renderLatestTag = () => {
    return (
      <Tags
        tagsList={[
          {
            label: commonI18n.current(),
            icon: {
              iconName: 'check',
              iconStyle: 'regular',
              title: 'check',
              placement: 'left',
            },
            tooltipContent: commonI18n.current(),
            tooltipId: 'current-version-tag',
            ariaLabel: commonI18n.current(),
          },
        ]}
        size="s"
      />
    );
  };

  return (
    <div id={versionId} className={moduleStyles.rowContainer}>
      <RadioButton
        name={versionId}
        value={versionId}
        label={label}
        onChange={onChange}
        checked={isSelected}
        className={moduleStyles.row}
      >
        {isLatest && renderLatestTag()}
      </RadioButton>
    </div>
  );
};

export default VersionHistoryRow;
