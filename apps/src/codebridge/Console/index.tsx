import {appendSystemMessage, resetOutput} from '@codebridge/redux/consoleRedux';
import React from 'react';
import {useDispatch} from 'react-redux';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import Button from '@cdo/apps/templates/Button';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {useFetch} from '@cdo/apps/util/useFetch';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './console.module.scss';

interface PermissionResponse {
  permissions: string[];
}

const Console: React.FunctionComponent = () => {
  const {onRun} = useCodebridgeContext();
  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;
  const codeOutput = useAppSelector(state => state.codebridgeConsole.output);
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useDispatch();

  const handleRun = (runTests: boolean) => {
    if (onRun) {
      const parsedPermissions = data
        ? (data as PermissionResponse)
        : {permissions: []};
      onRun(runTests, dispatch, parsedPermissions.permissions, source);
    } else {
      dispatch(appendSystemMessage("We don't know how to run your code"));
    }
  };

  const clearOutput = () => {
    dispatch(resetOutput());
  };

  return (
    <div className={moduleStyles.consoleContainer}>
      <div>
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
        <Button type={'button'} text="Clear output" onClick={clearOutput} />
      </div>
      <div>
        {codeOutput.map((outputLine, index) => {
          if (outputLine.type === 'img') {
            return (
              <img
                key={index}
                src={`data:image/png;base64,${outputLine.contents}`}
                alt="matplotlib_image"
              />
            );
          } else if (
            outputLine.type === 'system_out' ||
            outputLine.type === 'system_in'
          ) {
            return <div key={index}>{outputLine.contents}</div>;
          } else {
            return <div key={index}>[PYTHON LAB] {outputLine.contents}</div>;
          }
        })}
      </div>
    </div>
  );
};

export default Console;
