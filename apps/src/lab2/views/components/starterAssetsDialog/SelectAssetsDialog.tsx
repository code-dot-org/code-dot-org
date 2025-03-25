import Modal from '@code-dot-org/component-library/modal';
import React, {useState} from 'react';

import FileIcon from './FileIcon';
import {ErrorAlert, Loading} from './shared';
import {AssetData, CommonProps, DialogProps} from './types';

import styles from './starter-assets-dialog.module.scss';

export interface SelectProps extends CommonProps {
  mode: 'select';
  onSelect: (selectedAssets: AssetData[]) => void;
  limit?: number;
}

const SelectAssetsDialog: React.FC<DialogProps & SelectProps> = ({
  onClose,
  assets,
  loading,
  levelName,
  onSelect,
  limit,
  showError,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<AssetData[]>([]);

  const onSelectAsset = (selected: boolean, asset: AssetData) => {
    if (selected) {
      setSelectedFiles([...selectedFiles, asset]);
    } else {
      setSelectedFiles(selectedFiles.filter(file => file !== asset));
    }
  };

  const ModalBody = () => (
    <div className={styles.modalBody} id="dsco-dialog-description">
      {assets.map(asset => (
        <FileIcon
          key={asset.filename}
          asset={asset}
          levelName={levelName}
          selected={selectedFiles.includes(asset)}
          onSelect={selected => onSelectAsset(selected, asset)}
          canSelect={!limit || selectedFiles.length < limit}
        />
      ))}
    </div>
  );

  const primaryOnClick = () => {
    onSelect(selectedFiles);
    onClose();
  };

  return (
    <Modal
      id="starter-assets-dialog"
      onClose={onClose}
      title={'Library'}
      primaryButtonProps={{
        text: 'Open',
        onClick: primaryOnClick,
        disabled: selectedFiles.length === 0,
      }}
      secondaryButtonProps={{text: 'Cancel', onClick: onClose}}
      customContent={loading ? <Loading /> : <ModalBody />}
      customBottomContent={showError && <ErrorAlert />}
    />
  );
};

export default SelectAssetsDialog;
