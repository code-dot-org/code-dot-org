import React from 'react';
import moduleStyles from './python-console.module.scss';
import {useDispatch} from 'react-redux';
import {appendSystemMessage, resetOutput} from './pythonlabRedux';
import Button from '@cdo/apps/templates/Button';
import {runPythonCode} from './pyodideRunner';
import {useFetch} from '@cdo/apps/util/useFetch';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';

interface PermissionResponse {
  permissions: string[];
}

const PythonConsole: React.FunctionComponent = () => {
  const source = useAppSelector(state => state.pythonlab.source);
  const codeOutput = useAppSelector(state => state.pythonlab.output);
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useDispatch();

  const handleRun = () => {
    const parsedData = data ? (data as PermissionResponse) : {permissions: []};
    // For now, restrict running python code to levelbuilders.
    if (parsedData.permissions.includes('levelbuilder')) {
      dispatch(appendSystemMessage('Running program...'));
      if (source) {
        const code = getFileByName(source.files, 'main.py')?.contents;
        if (code) {
          runPythonCode(code, source);
        } else {
          dispatch(appendSystemMessage('No main.py to run.'));
        }
      }
    } else {
      alert('You do not have permission to run python code.');
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
          onClick={handleRun}
          disabled={loading}
        />
        <Button type={'button'} text="Clear output" onClick={clearOutput} />
      </div>
      <div>
        Output:
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
