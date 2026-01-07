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
    return <div>Backpack is not available.</div>;
  }

  if (!fileList && !loadError) {
    return <div>Loading backpack files...</div>;
  }

  if (loadError) {
    return <div>Error loading backpack.</div>;
  }

  if (fileList && fileList.length === 0) {
    return <div>Your backpack is empty.</div>;
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
