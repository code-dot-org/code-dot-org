import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';

import BackpackFileChip from './BackpackFileChip';

import moduleStyles from './backpack-panel.module.scss';

const BackpackPanel: React.FC = () => {
  const backpackApi = useBackpackAPIContext();
  const [fileList, setFileList] = useState<string[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  // todo: also fetch based on some refresh signal
  useEffect(() => {
    if (backpackApi) {
      backpackApi.getFileList(
        () => setLoadError('Failed to load backpack files'),
        setFileList
      );
    }
  }, [backpackApi]);

  // todo: prettier
  if (!backpackApi || !backpackApi.hasBackpack()) {
    <div>Backpack is unavailable.</div>;
  }

  if (!fileList && !loadError) {
    return <div>Loading backpack files...</div>;
  }

  if (loadError) {
    return <div>Error loading backpack.</div>;
  }

  if (fileList && fileList.length === 0) {
    return (
      <div className={moduleStyles.backpackPanelWithMessage}>
        <div className={moduleStyles.emptyBackpackIconContainer}>
          <FontAwesomeV6Icon
            iconName="backpack"
            iconStyle="solid"
            className={moduleStyles.emptyBackpackIcon}
          />
        </div>
        <BodyTwoText>
          <StrongText>Your backpack is empty</StrongText>
        </BodyTwoText>
        <BodyFourText>
          Files you save to your backpack will appear here.
        </BodyFourText>
      </div>
    );
  }

  return (
    <div className={moduleStyles.backpackPanelWithFiles}>
      {fileList?.map(filename => (
        <BackpackFileChip key={filename} filename={filename} />
      ))}
    </div>
  );
};

export default BackpackPanel;
