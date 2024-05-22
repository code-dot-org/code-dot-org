import React from 'react';
import moduleStyles from './python-console.module.scss';
import {useDispatch} from 'react-redux';
import {appendSystemMessage, resetOutput} from './pythonlabRedux';
import Button from '@cdo/apps/templates/Button';
import {runAllTests, runPythonCode} from './pyodideRunner';
import {useFetch} from '@cdo/apps/util/useFetch';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {MultiFileSource} from '../lab2/types';

interface PermissionResponse {
  permissions: string[];
}

const PythonConsole: React.FunctionComponent = () => {
  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;
  const codeOutput = useAppSelector(state => state.pythonlab.output);
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useDispatch();

  const handleRun = (runTests: boolean) => {
    const parsedData = data ? (data as PermissionResponse) : {permissions: []};
    // For now, restrict running python code to levelbuilders.
    if (!parsedData.permissions.includes('levelbuilder')) {
      dispatch(
        appendSystemMessage('You do not have permission to run python code.')
      );
      return;
    }
    if (!source) {
      dispatch(appendSystemMessage('You have no code to run.'));
      return;
    }
    if (runTests) {
      dispatch(appendSystemMessage('Running tests...'));
      runAllTests(source);
    } else {
      // Run main.py
      const code = getFileByName(source.files, MAIN_PYTHON_FILE)?.contents;
      if (!code) {
        dispatch(
          appendSystemMessage(`You have no ${MAIN_PYTHON_FILE} to run.`)
        );
        return;
      }
      dispatch(appendSystemMessage('Running program...'));
      runPythonCode(code, source);
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

export default PythonConsole;
