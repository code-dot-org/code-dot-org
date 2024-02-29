import React, {useState} from 'react';
import {darkMode} from '@cdo/apps/lab2/views/components/editor/editorThemes';
import {python} from '@codemirror/lang-python';
import moduleStyles from './python-editor.module.scss';
import {useDispatch} from 'react-redux';
import {appendOutput, resetOutput, setCode} from './pythonlabRedux';
import Button from '@cdo/apps/templates/Button';
// import {runPythonCode} from './pyodideRunner';
import {useFetch} from '@cdo/apps/util/useFetch';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {Connection, getDocument, peerExtension} from './collab';
import {getCollabWorker} from './collabWorkerManager';

interface PermissionResponse {
  permissions: string[];
}

const PythonEditor: React.FunctionComponent = () => {
  const code = useAppSelector(state => state.pythonlab.code); // eslint-disable-line @typescript-eslint/no-unused-vars
  const codeOutput = useAppSelector(state => state.pythonlab.output);
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useDispatch();

  const onCodeUpdate = (code: string) => dispatch(setCode(code));
  // const collabCompartment1 = new Compartment();
  // const collabCompartment2 = new Compartment();
  // const baseExtensions = [python(), darkMode];
  // const editor1Extensions = [...baseExtensions, collabCompartment1];
  // const editor2Extensions = [...baseExtensions, collabCompartment2];
  const [editor1, setEditor1] = useState<JSX.Element | null>(null);
  const [editor2, setEditor2] = useState<JSX.Element | null>(null);

  const handleRun = () => {
    const parsedData = data ? (data as PermissionResponse) : {permissions: []};
    // For now, restrict running python code to levelbuilders.
    if (parsedData.permissions.includes('levelbuilder')) {
      dispatch(appendOutput('Simulating running code.'));
      // TODO: re-enable once we fix iPad issues.
      // https://codedotorg.atlassian.net/browse/CT-299
      // runPythonCode(code);
    } else {
      alert('You do not have permission to run python code.');
    }
  };

  const clearOutput = () => {
    dispatch(resetOutput());
  };

  const createEditor = async () => {
    console.log('creating editor...');
    const collabWorker = getCollabWorker();
    const {version, doc} = await getDocument(
      new Connection(collabWorker, () => 0)
    );
    const connection = new Connection(collabWorker);
    const extensions = [python(), darkMode, peerExtension(version, connection)];
    console.log('returning editor?');
    return (
      <CodeEditor
        onCodeChange={onCodeUpdate}
        startCode={doc}
        editorConfigExtensions={extensions}
      />
    );
  };

  if (!editor1) {
    createEditor().then(editor => setEditor1(editor));
  }
  if (!editor2) {
    createEditor().then(editor => setEditor2(editor));
  }

  return (
    <div className={moduleStyles.editorContainer}>
      {editor1}
      {editor2}
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
