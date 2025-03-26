import ActionBlock from '@code-dot-org/component-library/actionBlock';
import React from 'react';

import consoleImage from '@cdo/static/pythonlab/console-only.svg';

const ProjectTypePicker: React.FunctionComponent = () => {
  return (
    <div>
      <ActionBlock
        title="Console"
        description="A level with a console"
        image={consoleImage}
      />
    </div>
  );
};

export default ProjectTypePicker;
