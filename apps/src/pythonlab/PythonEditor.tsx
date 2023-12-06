import React, {useEffect, useRef, useState} from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import classNames from 'classnames';
import {EditorView, ViewUpdate} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {editorSetup} from '../javalab/editorSetup';
import {darkMode} from '../javalab/editorThemes';
import {python} from '@codemirror/lang-python';
import moduleStyles from './python-editor.module.scss';
import {useDispatch, useSelector} from 'react-redux';
import {PythonlabState, setCode} from './pythonlabRedux';
import Button from '../templates/Button';
import {runPython} from './pyodideRunner';

const PythonEditor: React.FunctionComponent = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const code = useSelector(
    (state: {pythonlab: PythonlabState}) => state.pythonlab.code
  );
  const [output, setOutput] = useState<string>('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (editorRef.current === null) {
      return;
    }

    const onEditorUpdate = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        dispatch(setCode(update.state.doc.toString()));
      }
    );

    const editorExtensions = [
      ...editorSetup,
      python(),
      darkMode,
      onEditorUpdate,
    ];
    new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: editorExtensions,
      }),
      parent: editorRef.current,
    });
  }, [dispatch, editorRef]);

  const handleRun = () => {
    runPython(code, setOutput);
  };

  return (
    <div className={moduleStyles.editorContainer}>
      <PanelContainer
        id="python-editor"
        headerText="Editor"
        hideHeaders={false}
      >
        <div ref={editorRef} className={classNames('codemirror-container')} />
      </PanelContainer>
      <div>
        <Button type={'button'} text="Run" onClick={handleRun} />
      </div>
    </div>
  );
};

export default PythonEditor;
