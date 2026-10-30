import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import moduleStyles from './mini-app-empty-state.module.scss';

interface MiniAppEmptyStateProps {
  iconName: string;
  title: string;
  description: string;
}

// Covers a mini app preview that has no output yet. Sized for the preview
// panel, which is smaller than the editor and file browser that
// CodebridgeEmptyState is built for.
const MiniAppEmptyState: React.FunctionComponent<MiniAppEmptyStateProps> = ({
  iconName,
  title,
  description,
}) => (
  <div className={moduleStyles.container}>
    <div className={moduleStyles.iconCircle} aria-hidden="true">
      <FontAwesomeV6Icon iconStyle="solid" iconName={iconName} />
    </div>
    <Typography variant="body2">
      <Typography variant="strong">{title}</Typography>
    </Typography>
    <Typography variant="body4">{description}</Typography>
  </div>
);

export default MiniAppEmptyState;
