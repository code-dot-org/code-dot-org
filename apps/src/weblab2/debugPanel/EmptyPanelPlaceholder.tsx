import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import moduleStyles from './empty-panel-placeholder.module.scss';

interface EmptyPanelPlaceholderProps {
  iconName: string;
  title: string;
  description: string;
}

const EmptyPanelPlaceholder: React.FunctionComponent<
  EmptyPanelPlaceholderProps
> = ({iconName, title, description}) => {
  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.innerContainer}>
        <div className={moduleStyles.iconCircle}>
          <FontAwesomeV6Icon iconName={iconName} />
        </div>
        <Typography className={moduleStyles.title} variant="body2">
          <Typography variant="strong">{title}</Typography>
        </Typography>
        <Typography className={moduleStyles.description} variant="body4">
          {description}
        </Typography>
      </div>
    </div>
  );
};

export default EmptyPanelPlaceholder;
