import React from 'react';
import {darkMode} from '@cdo/apps/lab2/views/components/editor/editorThemes';
import {python} from '@codemirror/lang-python';
import moduleStyles from './python-editor.module.scss';
import {useDispatch} from 'react-redux';
import {appendSystemMessage, resetOutput, setSource} from './pythonlabRedux';
import Button from '@cdo/apps/templates/Button';
import {runPythonCode} from './pyodideRunner';
import {useFetch} from '@cdo/apps/util/useFetch';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';

interface PermissionResponse {
  permissions: string[];
}

const PythonEditor: React.FunctionComponent = () => {
  const source = useAppSelector(state => state.pythonlab.source);
  const codeOutput = useAppSelector(state => state.pythonlab.output);
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useDispatch();
  const editorExtensions = [python(), darkMode];
  const initialSources = useAppSelector(state => state.lab.initialSources);
  let startCode = 'print("Hello world!")';

  if (initialSources?.source && typeof initialSources.source !== 'string') {
    startCode =
      getFileByName(initialSources.source.files, 'main.py')?.contents ||
      startCode;
  }

  const handleRun = () => {
    const parsedData = data ? (data as PermissionResponse) : {permissions: []};
    // For now, restrict running python code to levelbuilders.
    if (parsedData.permissions.includes('levelbuilder')) {
      dispatch(appendSystemMessage('Running program...'));
      if (source) {
        const code = getFileByName(source.files, 'main.py')?.contents;
        if (code) {
          runPythonCode(code);
        } else {
          dispatch(appendSystemMessage('No main.py to run.'));
        }
      }
    } else {
      alert('You do not have permission to run python code.');
    }
  };

  const onCodeUpdate = (updatedCode: string) => {
    // TODO: handle multiple files. For now everything is "main.py".
    const updatedSource: MultiFileSource = {
      files: {
        '0': {
          id: '0',
          name: 'main.py',
          language: 'python',
          contents: updatedCode,
          folderId: '1',
        },
      },
      folders: {
        '1': {
          id: '1',
          name: 'src',
          parentId: '0',
        },
      },
    };
    dispatch(setSource(updatedSource));
    if (Lab2Registry.getInstance().getProjectManager()) {
      const projectSources = {
        source: updatedSource,
      };
      Lab2Registry.getInstance().getProjectManager()?.save(projectSources);
    }
  };

  const clearOutput = () => {
    dispatch(resetOutput());
  };

  return (
    <div className={moduleStyles.editorContainer}>
      <CodeEditor
        onCodeChange={onCodeUpdate}
        startCode={startCode}
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

export default PythonEditor;
