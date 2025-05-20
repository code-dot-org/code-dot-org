import {Button} from '@code-dot-org/component-library/button';
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
      <Button text="Edit Starter Assets" onClick={() => setShowDialog(true)} />
    </>
  );
};

export default EditStarterAssets;
