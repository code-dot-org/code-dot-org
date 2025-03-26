import ActionBlock from '@code-dot-org/component-library/actionBlock';
import React from 'react';

import consoleImage from '@cdo/static/pythonlab/console-only.svg';

const ProjectTypePicker: React.FunctionComponent = () => {
  return (
    <div data-theme="Dark">
      <ActionBlock
        title="Console"
        description="A level with a console"
        image={consoleImage}
        primaryButton={{
          text: 'Console only',
          color: 'black',
          useAsLink: false,
          onClick: () => console.log('Console only'),
        }}
      />
    </div>
  );
};

export default ProjectTypePicker;
