import ActionBlock from '@code-dot-org/component-library/actionBlock';
import React from 'react';

import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import consoleImage from '@cdo/static/pythonlab/console-only.svg';
import neighborhoodImage from '@cdo/static/pythonlab/neighborhood-console.svg';

import moduleStyles from './projectTypePicker.module.scss';

interface ProjectTypePickerProps {
  selectProjectType: (projectType: 'console' | 'neighborhood') => void;
}

const ProjectTypePicker: React.FunctionComponent<ProjectTypePickerProps> = ({
  selectProjectType,
}) => {
  return (
    <div data-theme="Dark" className={moduleStyles.pickerContainer}>
      <ActionBlock
        description={pythonlabI18n.consoleOnlyDescription()}
        image={consoleImage}
        primaryButton={{
          text: pythonlabI18n.consoleOnly(),
          color: 'black',
          useAsLink: false,
          onClick: () => selectProjectType('console'),
        }}
      />
      <ActionBlock
        description={pythonlabI18n.neighborhoodDescription()}
        image={neighborhoodImage}
        primaryButton={{
          text: pythonlabI18n.neighborhood(),
          color: 'black',
          useAsLink: false,
          onClick: () => selectProjectType('neighborhood'),
        }}
      />
    </div>
  );
};

export default ProjectTypePicker;
