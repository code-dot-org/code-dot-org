import ActionBlock from '@code-dot-org/component-library/actionBlock';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {
  BodyThreeText,
  Heading2,
} from '@code-dot-org/component-library/typography';
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
  return (
    <div className={moduleStyles.dialogContainer} data-theme="Dark">
      <CustomDialog
        mode="dark"
        className={moduleStyles.pickerDialog}
        aria-labelledby="project-picker-title"
        onClose={currentProjectType ? closeDialog : undefined}
      >
        <Heading2 id="project-picker-title">
          {currentProjectType
            ? pythonlabI18n.switchProjectTypeTitle()
            : pythonlabI18n.projectPickerTitle()}
        </Heading2>
        <div id="dsco-dialog-description">
          {(isNeighborhood || isConsole) && (
            <BodyThreeText>
              <span className={moduleStyles.boldWarning}>
                {pythonlabI18n.projectPickerReplaceWarning()}
              </span>
              <br />
              {pythonlabI18n.projectPickerReplaceRestoreInfo()}
            </BodyThreeText>
          )}
          <div className={moduleStyles.pickerContainer}>
            <ActionBlock
              description={pythonlabI18n.consoleOnlyDescription()}
              image={{src: consoleImage}}
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
              image={{src: neighborhoodImage}}
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
        </div>
      </CustomDialog>
    </div>
  );
};

export default ProjectTypePicker;
