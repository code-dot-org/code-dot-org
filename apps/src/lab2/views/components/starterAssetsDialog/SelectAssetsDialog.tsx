import Modal from '@code-dot-org/component-library/modal';
import React, {useState} from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';

import FileIcon from './FileIcon';
import {DialogAlert, Loading} from './shared';
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
  alert,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<AssetData[]>([]);

  const onSelectAsset = (selected: boolean, asset: AssetData) => {
    if (selected) {
      setSelectedFiles([...selectedFiles, asset]);
    } else {
      setSelectedFiles(selectedFiles.filter(file => file !== asset));
    }
  };

  const primaryOnClick = () => {
    onSelect(selectedFiles);
    onClose();
  };

  return (
    <Modal
      id="starter-assets-dialog"
      onClose={onClose}
      title={lab2I18n.library()}
      primaryButtonProps={{
        text: lab2I18n.attach(),
        onClick: primaryOnClick,
        disabled: selectedFiles.length === 0,
      }}
      secondaryButtonProps={{text: lab2I18n.cancel(), onClick: onClose}}
      customContent={
        loading ? (
          <Loading />
        ) : (
          <div className={styles.modalBody} id="dsco-dialog-description">
            {assets.map(asset => (
              <FileIcon
                {...asset}
                key={asset.filename}
                levelName={levelName}
                selected={selectedFiles.includes(asset)}
                onSelect={selected => onSelectAsset(selected, asset)}
                canSelect={!limit || selectedFiles.length < limit}
              />
            ))}
          </div>
        )
      }
      customBottomContent={alert && <DialogAlert {...alert} />}
    />
  );
};

export default SelectAssetsDialog;
