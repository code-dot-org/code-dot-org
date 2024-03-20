import {useCDOIDEContext} from '@cdoide/cdo-ide-context';
import React from 'react';

import './styles/instructions.css';

export const Instructions = React.memo(() => {
  const {
    config: {instructions},
  } = useCDOIDEContext();
  return <div className="instructions">{instructions}</div>;
});
