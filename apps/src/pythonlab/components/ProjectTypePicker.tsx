import ActionBlock from '@code-dot-org/component-library/actionBlock';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {setAndSaveProjectSources} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {
  defaultNeighborhoodProject,
  defaultProject,
} from '@cdo/apps/pythonlab/constants';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import consoleImage from '@cdo/static/pythonlab/console-only.svg';
import neighborhoodImage from '@cdo/static/pythonlab/neighborhood-console.svg';

import moduleStyles from './projectTypePicker.module.scss';

interface ProjectTypePickerProps {
  setProject: (project: ProjectSources) => void;
  setProjectCallback: () => void;
}

const ProjectTypePicker: React.FunctionComponent<ProjectTypePickerProps> = ({
  setProject,
  setProjectCallback,
}) => {
  const dispatch = useAppDispatch();

  const selectProjectType = (type: 'console' | 'neighborhood') => {
    let project = defaultProject;
    if (type === 'neighborhood') {
      project = defaultNeighborhoodProject;
    }
    dispatch(setAndSaveProjectSources(project));
    setProjectCallback();
  };

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
