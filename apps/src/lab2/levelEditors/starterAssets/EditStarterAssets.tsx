import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import StarterAssetsDialog from '../../views/components/starterAssetsDialog';

import styles from './edit-starter-assets.module.scss';

const EditStarterAssets: React.FC<{levelName: string}> = ({levelName}) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      {showDialog && (
        <div className={styles.dialogContainer}>
          <StarterAssetsDialog
            levelName={levelName}
            mode="upload"
            onClose={() => setShowDialog(false)}
          />
        </div>
      )}
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
        onClick={() => setShowDialog(true)}
        type="button"
      >
        {'Edit Starter Assets'}
      </MuiButton>
    </>
  );
};

export default EditStarterAssets;
