import {Button} from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import StarterAssetsDialog from '../../views/components/starterAssetsDialog';

const EditStarterAssets: React.FC<{levelName: string}> = ({levelName}) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      {showDialog && (
        <StarterAssetsDialog
          levelName={levelName}
          mode="upload"
          onClose={() => setShowDialog(false)}
        />
      )}
      <Button text="Edit Starter Assets" onClick={() => setShowDialog(true)} />
    </>
  );
};

export default EditStarterAssets;
