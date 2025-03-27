import ActionBlock from '@code-dot-org/component-library/actionBlock';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {Heading2} from '@code-dot-org/component-library/typography';
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
    <div className={moduleStyles.dialogContainer} data-theme="Dark">
      <CustomDialog mode="dark" className={moduleStyles.pickerDialog}>
        <Heading2>{pythonlabI18n.projectPickerTitle()}</Heading2>
        <div className={moduleStyles.pickerContainer}>
          <ActionBlock
            description={pythonlabI18n.consoleOnlyDescription()}
            image={consoleImage}
            primaryButton={{
              text: pythonlabI18n.consoleOnly(),
              color: 'black',
              useAsLink: false,
              onClick: () => selectProjectType('console'),
              iconRight: {iconName: 'chevron-right'},
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
              iconRight: {iconName: 'chevron-right'},
            }}
          />
        </div>
      </CustomDialog>
    </div>
  );
};

export default ProjectTypePicker;
