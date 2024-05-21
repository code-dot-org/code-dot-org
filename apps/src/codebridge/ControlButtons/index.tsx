import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import React from 'react';
import {useDispatch} from 'react-redux';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import Button from '@cdo/apps/templates/Button';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {useFetch} from '@cdo/apps/util/useFetch';

import moduleStyles from './control-buttons.module.scss';

interface PermissionResponse {
  permissions: string[];
}

const ControlButtons: React.FunctionComponent = () => {
  const {onRun} = useCodebridgeContext();
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useDispatch();

  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;

  const handleRun = (runTests: boolean) => {
    if (onRun) {
      const parsedPermissions = data
        ? (data as PermissionResponse)
        : {permissions: []};
      onRun(runTests, dispatch, parsedPermissions.permissions, source);
    } else {
      dispatch(appendSystemMessage("We don't know how to run your code."));
    }
  };

  return (
    <div className={moduleStyles.controlButtonsContainer}>
      <Button
        type={'button'}
        text="Run"
        onClick={() => handleRun(false)}
        disabled={loading}
      />
      <Button
        type={'button'}
        text="Test"
        onClick={() => handleRun(true)}
        disabled={loading}
      />
    </div>
  );
};

export default ControlButtons;
