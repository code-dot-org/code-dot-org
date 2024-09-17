import React from 'react';

import Tags from '@cdo/apps/componentLibrary/tags';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './version-history-row.module.scss';

interface VersionHistoryRowProps {
  id: string;
  versionId: string;
  versionLabel: string;
  isLatest: boolean;
  isSelected: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VersionHistoryRow: React.FunctionComponent<VersionHistoryRowProps> = ({
  versionId,
  versionLabel,
  isLatest,
  isSelected,
  onChange,
  id,
}) => {
  return (
    <label className={moduleStyles.versionHistoryRow} key={versionId} id={id}>
      <input
        type="radio"
        name={versionId}
        value={versionId}
        onChange={onChange}
        checked={isSelected}
      />
      <div className={moduleStyles.versionInfo}>
        <div className={moduleStyles.versionDate}>{versionLabel}</div>
        {isLatest && (
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
            className={moduleStyles.currentVersionTag}
          />
        )}
      </div>
    </label>
  );
};

export default React.memo(VersionHistoryRow);
