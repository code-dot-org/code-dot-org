import {Typography} from '@mui/material';
import React from 'react';

import {BackpackProps} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';

import moduleStyles from './unified-backpack-panel.module.scss';

// Placeholder for the panel behind the 'unified-backpack' experiment; it takes
// the same props as BackpackPanel so the two are interchangeable at the call site.
interface UnifiedBackpackPanelProps extends BackpackProps {
  openPanelCallback: () => void;
  backpackRefreshKey: number;
  onImageFlagged?: (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
  ) => void;
}

const UnifiedBackpackPanel: React.FC<UnifiedBackpackPanelProps> = () => {
  return (
    <div className={moduleStyles.unifiedBackpackPanel}>
      <Typography variant="body2">Backpack</Typography>
    </div>
  );
};

export default UnifiedBackpackPanel;
