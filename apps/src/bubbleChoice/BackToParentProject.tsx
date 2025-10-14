import {Button, ButtonProps} from '@code-dot-org/component-library/button';
import React from 'react';

import {useMultiProject} from '../lab2/projects/MultiProjectContainer';

const BackToParentProject: React.FC<ButtonProps> = props => {
  const multiProject = useMultiProject();

  if (!multiProject) {
    return null;
  }

  return <Button {...props} onClick={() => multiProject.backToParent()} />;
};

export default BackToParentProject;
