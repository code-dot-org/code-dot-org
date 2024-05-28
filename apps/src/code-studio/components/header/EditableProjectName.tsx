/**
 * Header component to show the project name and allow editing.
 * Supports projects in either lab2 or legacy lab mode.
 */

import React, {useLayoutEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {refreshProjectName, ProjectState} from '../../projectRedux';
import EditProjectName from './EditProjectName';
import DisplayProjectName from './DisplayProjectName';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

const EditableProjectName: React.FunctionComponent<
  EditableProjectNameProps
> = ({onChangedWidth}) => {
  const [editName, setEditName] = useState(false);
  const legacyProjectName = useSelector(
    (state: {project: ProjectState}) => state.project.projectName
  );
  const lab2ProjectName = useSelector(
    (state: {lab: LabState}) => state.lab.channel?.name
  );
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    if (onChangedWidth) {
      onChangedWidth();
    }
  });

  function beginEdit() {
    setEditName(true);
  }

  function finishEdit() {
    setEditName(false);
    if (!Lab2Registry.hasEnabledProjects()) {
      dispatch(refreshProjectName());
    }
  }

  function saveProjectName(newName: string) {
    if (Lab2Registry.hasEnabledProjects()) {
      return Lab2Registry.getInstance().getProjectManager()?.rename(newName);
    } else {
      return dashboard.project.rename(newName);
    }
  }

  const projectName = Lab2Registry.hasEnabledProjects()
    ? lab2ProjectName || ''
    : legacyProjectName;

  if (editName) {
    return (
      <EditProjectName
        finishEdit={finishEdit}
        projectName={projectName}
        saveProjectName={saveProjectName}
      />
    );
  } else {
    return (
      <DisplayProjectName beginEdit={beginEdit} projectName={projectName} />
    );
  }
};

interface EditableProjectNameProps {
  onChangedWidth: () => void;
}

export default EditableProjectName;
