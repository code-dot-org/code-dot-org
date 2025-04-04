import {autocompletion} from '@codemirror/autocomplete';
import {Compartment, EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {FontSize} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {setEditorFontSize} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {AppName} from '@cdo/apps/lab2/types';
import i18n from '@cdo/apps/pythonlab/locale';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetSessionStorage} from '@cdo/apps/utils';

import {editorConfig} from './editorConfig';
import {darkMode as darkModeTheme} from './editorThemes';

import moduleStyles from './code-editor.module.scss';

interface CodeEditorProps {
  onCodeChange: (code: string) => void;
  editorConfigExtensions: Extension[];
  startCode: string;
  appName: AppName;
  darkMode?: boolean;
}

const CodeEditor: React.FunctionComponent<CodeEditorProps> = ({
  onCodeChange,
  editorConfigExtensions,
  startCode,
  appName,
  darkMode = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [didInit, setDidInit] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const fontSizeKey = useAppSelector(state => state.lab2View.editorFontSizeKey);
  const {signInState} = useAppSelector(state => state.currentUser);

  // User preference for selected font size persists within a session
  // per signed-in user per app type (currently either pythonlab or weblab).
  // TODO: update so that selected font size will persist across sessions.
  // Note that When the user selects a different font size from settings, fontSizeKey
  // is updated alongside sessionStorage for sessionStorageKey.
  useEffect(() => {
    const sessionStorageKey = `${appName}CodeEditorFontSizeKey`;
    const sessionStorage = tryGetSessionStorage(sessionStorageKey, false);
    if (
      sessionStorage &&
      sessionStorage !== fontSizeKey &&
      signInState === SignInState.SignedIn
    ) {
      dispatch(setEditorFontSize(sessionStorage));
    }
  }, [dispatch, signInState, fontSizeKey, appName]);

  // These two compartments control read-only settings.
  // Controls if you can type in the editor or not.
  const editorReadOnlyCompartment = useMemo(() => new Compartment(), []);
  // Controls if the dom is focusable or not (and therefore if a cursor is visible in the editor or not).
  const editorEditableCompartment = useMemo(() => new Compartment(), []);

  // This compartment controls font size settings for the editor.
  const fontSizeCompartment = useMemo(() => new Compartment(), []);

  const getFontSizeTheme = (fontSize: number) => {
    return EditorView.theme({
      '&': {
        fontSize: `${fontSize}px`,
      },
    });
  };
  useEffect(() => {
    if (editorRef.current === null || didInit) {
      return;
    }

    const onEditorUpdate = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        onCodeChange(update.state.doc.toString());
      }
    );

    const editorExtensions = [
      ...editorConfig,

      onEditorUpdate,
      autocompletion({defaultKeymap: false}),
      ...editorConfigExtensions,
    ];

    editorExtensions.push(
      editorReadOnlyCompartment.of(EditorState.readOnly.of(isReadOnly)),
      editorEditableCompartment.of(EditorView.editable.of(!isReadOnly)),
      fontSizeCompartment.of(getFontSizeTheme(FontSize[fontSizeKey]))
    );
    if (darkMode) {
      editorExtensions.push(darkModeTheme);
    }
    setEditorView(
      new EditorView({
        state: EditorState.create({
          doc: startCode,
          extensions: editorExtensions,
        }),
        parent: editorRef.current,
        // Always start on the first line.
        // TODO: Determine if we should track line position and scroll to
        // a saved position instead.
        // https://codedotorg.atlassian.net/browse/CT-870
        scrollTo: EditorView.scrollIntoView(0),
      })
    );
    setDidInit(true);
  }, [
    dispatch,
    editorRef,
    editorConfigExtensions,
    onCodeChange,
    startCode,
    didInit,
    darkMode,
    editorReadOnlyCompartment,
    isReadOnly,
    editorEditableCompartment,
    fontSizeCompartment,
    fontSizeKey,
  ]);

  // When we have a new fontSizeKey, reset font size.
  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          fontSizeCompartment.reconfigure(
            getFontSizeTheme(FontSize[fontSizeKey])
          ),
        ],
      });
    }
  }, [editorView, fontSizeCompartment, fontSizeKey]);

  // When we have a new channelId and/or start code, reset the editor with the start code.
  // A new channelId means we are loading a new project, and we need to reset the editor.
  useEffect(() => {
    if (editorView && editorView.state.doc.toString() !== startCode) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: startCode,
        },
      });
    }
  }, [startCode, editorView, channelId]);

  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          editorReadOnlyCompartment.reconfigure(
            EditorState.readOnly.of(isReadOnly)
          ),
          editorEditableCompartment.reconfigure(
            EditorView.editable.of(!isReadOnly)
          ),
        ],
      });
    }
  }, [
    isReadOnly,
    editorView,
    editorReadOnlyCompartment,
    editorEditableCompartment,
  ]);

  // Sets aria-label on the input div once code mirror loads
  useEffect(() => {
    const cmContentDiv = editorRef.current?.querySelector('.cm-content');
    if (cmContentDiv) {
      cmContentDiv.setAttribute('aria-label', i18n.codeEditor());
    }
  }, []);

  return (
    <div
      ref={editorRef}
      className={classNames(
        'codemirror-container',
        moduleStyles.codeEditorContainer
      )}
    />
  );
};

export default CodeEditor;
