import React from 'react';
import {darkMode} from '@cdo/apps/lab2/views/components/editor/editorThemes';
import {python} from '@codemirror/lang-python';
import moduleStyles from './python-editor.module.scss';
import {useDispatch, useSelector} from 'react-redux';
import {
  PythonlabState,
  appendOutput,
  resetOutput,
  setCode,
} from './pythonlabRedux';
import Button from '@cdo/apps/templates/Button';
// import {runPythonCode} from './pyodideRunner';
import {useFetch} from '@cdo/apps/util/useFetch';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';

interface PermissionResponse {
  permissions: string[];
}

const PythonEditor: React.FunctionComponent = () => {
  const code = useSelector(
    (state: {pythonlab: PythonlabState}) => state.pythonlab.code
  );
  const codeOutput = useSelector(
    (state: {pythonlab: PythonlabState}) => state.pythonlab.output
  );
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useDispatch();

  const onCodeUpdate = (code: string) => dispatch(setCode(code));
  const editorExtensions = [python(), darkMode];

  const handleRun = () => {
    const parsedData = data ? (data as PermissionResponse) : {permissions: []};
    // For now, restrict running python code to levelbuilders.
    if (parsedData.permissions.includes('levelbuilder')) {
      dispatch(appendOutput('Simulating running code.'));
      // TODO: re-enable once we fix iPad issues.
      // runPythonCode(code);
    } else {
      alert('You do not have permission to run python code.');
    }
  };

  const clearOutput = () => {
    dispatch(resetOutput());
  };

  return (
    <div className={moduleStyles.editorContainer}>
      <CodeEditor
        onCodeChange={onCodeUpdate}
        startCode={'print("Hello world!")'}
        editorConfigExtensions={editorExtensions}
      />
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
          return <div key={index}>{outputLine}</div>;
        })}
      </div>
    </div>
  );
};

export default PythonEditor;
