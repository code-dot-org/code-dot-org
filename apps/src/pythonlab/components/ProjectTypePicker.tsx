import ActionBlock from '@code-dot-org/component-library/actionBlock';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import consoleImage from '@cdo/static/pythonlab/ConsolePreview.png';
import neighborhoodImage from '@cdo/static/pythonlab/NeighborhoodPreview.png';

import moduleStyles from './projectTypePicker.module.scss';

interface ProjectTypePickerProps {
  setProjectCallback: (type: 'console' | 'neighborhood') => void;
  currentProjectType?: string;
  closeDialog: () => void;
}

const ProjectTypePicker: React.FunctionComponent<ProjectTypePickerProps> = ({
  setProjectCallback,
  currentProjectType,
  closeDialog,
}) => {
  const isNeighborhood = currentProjectType === 'neighborhood';
  const isConsole = currentProjectType === 'console';
  const {theme} = useTheme();
  const mode = theme === 'Light' ? 'light' : 'dark';
  return (
    <div className={moduleStyles.dialogContainer}>
      <CustomDialog
        mode={mode}
        className={moduleStyles.pickerDialog}
        aria-labelledby="project-picker-title"
        onClose={currentProjectType ? closeDialog : undefined}
      >
        <Typography id="project-picker-title" variant="h2" gutterBottom>
          {currentProjectType
            ? pythonlabI18n.switchProjectTypeTitle()
            : pythonlabI18n.projectPickerTitle()}
        </Typography>
        <div id="dsco-dialog-description">
          {(isNeighborhood || isConsole) && (
            <Typography variant="body3" gutterBottom>
              <span className={moduleStyles.boldWarning}>
                {pythonlabI18n.projectPickerReplaceWarning()}
              </span>
              <br />
              {pythonlabI18n.projectPickerReplaceRestoreInfo()}
            </Typography>
          )}
          <div className={moduleStyles.pickerContainer}>
            <ActionBlock
              description={pythonlabI18n.consoleOnlyDescription()}
              image={{src: consoleImage}}
              primaryButton={{
                children: pythonlabI18n.consoleOnly(),
                color: 'primary',
                onClick: () => setProjectCallback('console'),
                endIcon: (
                  <FontAwesomeV6Icon
                    iconName={isConsole ? 'check' : 'chevron-right'}
                  />
                ),
                disabled: isConsole,
              }}
            />
            <ActionBlock
              description={pythonlabI18n.neighborhoodDescription()}
              image={{src: neighborhoodImage}}
              primaryButton={{
                children: pythonlabI18n.neighborhood(),
                color: 'primary',
                onClick: () => setProjectCallback('neighborhood'),
                endIcon: (
                  <FontAwesomeV6Icon
                    iconName={isNeighborhood ? 'check' : 'chevron-right'}
                  />
                ),
                disabled: isNeighborhood,
              }}
            />
          </div>
        </div>
      </CustomDialog>
    </div>
  );
};

export default ProjectTypePicker;
