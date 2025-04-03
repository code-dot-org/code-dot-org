import ActionBlock from '@code-dot-org/component-library/actionBlock';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import consoleImage from '@cdo/static/pythonlab/console-only.svg';
import neighborhoodImage from '@cdo/static/pythonlab/neighborhood-console.svg';

import moduleStyles from './projectTypePicker.module.scss';

interface ProjectTypePickerProps {
  setProjectCallback: (type: 'console' | 'neighborhood') => void;
  currentProjectType?: string;
}

const ProjectTypePicker: React.FunctionComponent<ProjectTypePickerProps> = ({
  setProjectCallback,
  currentProjectType,
}) => {
  const isNeighborhood = currentProjectType === 'neighborhood';
  const isConsole = currentProjectType === 'console';
  return (
    <div className={moduleStyles.dialogContainer} data-theme="Dark">
      <CustomDialog
        mode="dark"
        className={moduleStyles.pickerDialog}
        aria-labelledby="project-picker-title"
      >
        <Heading2 id="project-picker-title">
          {pythonlabI18n.projectPickerTitle()}
        </Heading2>
        <div
          className={moduleStyles.pickerContainer}
          id="dsco-dialog-description"
        >
          <ActionBlock
            description={pythonlabI18n.consoleOnlyDescription()}
            image={consoleImage}
            primaryButton={{
              text: pythonlabI18n.consoleOnly(),
              color: 'black',
              useAsLink: false,
              onClick: () => setProjectCallback('console'),
              iconRight: isConsole
                ? {iconName: 'check'}
                : {iconName: 'chevron-right'},
              disabled: isConsole,
            }}
          />
          <ActionBlock
            description={pythonlabI18n.neighborhoodDescription()}
            image={neighborhoodImage}
            primaryButton={{
              text: pythonlabI18n.neighborhood(),
              color: 'black',
              useAsLink: false,
              onClick: () => setProjectCallback('neighborhood'),
              iconRight: isNeighborhood
                ? {iconName: 'check'}
                : {iconName: 'chevron-right'},
              disabled: isNeighborhood,
            }}
          />
        </div>
      </CustomDialog>
    </div>
  );
};

export default ProjectTypePicker;
