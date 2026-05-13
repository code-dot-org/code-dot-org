import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';

import PortfolioEntryDialog from './PortfolioEntryDialog';

import moduleStyles from './PortfolioButton.module.scss';

interface PortfolioData {
  scriptId: number;
  levelId: number;
  isSignedIn: boolean;
}

function readPortfolioData(): PortfolioData | null {
  if (!hasScriptData('script[data-portfoliodata]')) return null;
  return getScriptData('portfoliodata') as PortfolioData;
}

export default function PortfolioButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const data = readPortfolioData();
  if (!data || !data.isSignedIn) return null;

  return (
    <>
      <MuiButton
        variant="contained"
        size="small"
        className={moduleStyles.button}
        onClick={() => setDialogOpen(true)}
      >
        + Portfolio
      </MuiButton>
      <PortfolioEntryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        scriptId={data.scriptId}
        levelId={data.levelId}
      />
    </>
  );
}
